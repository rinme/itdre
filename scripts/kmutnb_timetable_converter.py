#!/usr/bin/env python3
"""
KMUTNB Registrar Timetable PDF-to-JSON Auto-Converter.

Parses class/exam timetable PDFs exported from KMUTNB Registrar
(https://reg4.kmutnb.ac.th/registrar/timetable) into structured JSON.

Supports single PDFs, multiple PDFs, or entire directories of PDFs.

Usage:
    # Convert all PDFs in a folder to individual JSON files
    python3 kmutnb_timetable_converter.py ./pdfs -o ./json_out

    # Convert specific PDFs into a single combined JSON file
    python3 kmutnb_timetable_converter.py schd1.pdf schd2.pdf --combine -o all_timetables.json

    # Convert a single PDF and print JSON to stdout
    python3 kmutnb_timetable_converter.py schd1.pdf --stdout
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any

import pdfplumber

THAI_DAYS: dict[str, tuple[str, str, int]] = {
    "จ.": ("จันทร์", "Monday", 1),
    "อ.": ("อังคาร", "Tuesday", 2),
    "พ.": ("พุธ", "Wednesday", 3),
    "พฤ.": ("พฤหัสบดี", "Thursday", 4),
    "ศ.": ("ศุกร์", "Friday", 5),
    "ส.": ("เสาร์", "Saturday", 6),
    "อา.": ("อาทิตย์", "Sunday", 7),
}

DAY_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

THAI_MONTHS: dict[str, int] = {
    "ม.ค.": 1,
    "ก.พ.": 2,
    "มี.ค.": 3,
    "เม.ย.": 4,
    "พ.ค.": 5,
    "มิ.ย.": 6,
    "ก.ค.": 7,
    "ส.ค.": 8,
    "ก.ย.": 9,
    "ต.ค.": 10,
    "พ.ย.": 11,
    "ธ.ค.": 12,
}

SECTION_TYPES: dict[str, str] = {
    "S": "lecture",
    "L": "lab",
}

INSTRUCTOR_TITLE_RE = re.compile(
    r"^(?:ผู้ช่วยศาสตราจารย์|รองศาสตราจารย์|ศาสตราจารย์|อาจารย์|ผศ\.|รศ\.|ศ\.|อ\.)"
)
INSTRUCTOR_TITLE_PREFIX_RE = re.compile(
    r"^(?:ผู้ช่วยศาสตราจารย์|รองศาสตราจารย์|ศาสตราจารย์|อาจารย์|ผศ\.|รศ\.|ศ\.|อ\.)\s*(?:ดร\.\s*)?"
)
THAI_CHAR_RE = re.compile(r"[\u0E00-\u0E7F]")
LATIN_CHAR_RE = re.compile(r"[A-Za-z]")


def normalize_thai(text: str) -> str:
    """Fix decomposed Thai sara am and normalize whitespace."""
    if not text:
        return ""
    # Replace nikhahit + sara aa (\u0e4d\u0e32) with composed sara am (\u0e33)
    text = text.replace("\u0e4d\u0e32", "\u0e33")
    # Also handle tone mark between nikhahit and sara aa: \u0e4d([่้๊๋])\u0e32 -> \1\u0e33
    text = re.sub(r"\u0e4d([\u0e48-\u0e4b])\u0e32", "\\1\u0e33", text)
    return text.strip()


def extract_cell_lines_stream_order(page: pdfplumber.page.Page, bbox: tuple[float, float, float, float]) -> list[str]:
    """
    Extract text lines inside a cell bbox while preserving PDF content-stream
    character order within each visual line so Thai combining marks (e.g., ฟัง)
    are never reordered behind following consonants.
    """
    x0, top, x1, bottom = bbox
    pad = 0.5
    chars = [
        c for c in page.chars
        if (c["x0"] + c["x1"]) / 2 >= x0 - pad
        and (c["x0"] + c["x1"]) / 2 <= x1 + pad
        and (c["top"] + c["bottom"]) / 2 >= top - pad
        and (c["top"] + c["bottom"]) / 2 <= bottom + pad
    ]
    if not chars:
        return []

    # Group characters into visual lines by vertical center (tolerance ~4pt)
    lines_buckets: list[tuple[float, list[dict[str, Any]]]] = []
    for ch in chars:
        cy = (ch["top"] + ch["bottom"]) / 2
        placed = False
        for idx, (line_y, bucket) in enumerate(lines_buckets):
            if abs(cy - line_y) <= 4.0:
                bucket.append(ch)
                # Update running average y
                new_y = (line_y * (len(bucket) - 1) + cy) / len(bucket)
                lines_buckets[idx] = (new_y, bucket)
                placed = True
                break
        if not placed:
            lines_buckets.append((cy, [ch]))

    # Sort visual lines top-to-bottom; keep PDF stream order within each line
    lines_buckets.sort(key=lambda item: item[0])

    result_lines: list[str] = []
    for _, bucket in lines_buckets:
        # Join characters in stream order, inserting space if horizontal gap is wide
        # (only when moving forward, skipping combining marks)
        parts: list[str] = []
        prev_x1: float | None = None
        for ch in bucket:
            txt = ch["text"]
            is_combining = bool(re.match(r"[\u0e31\u0e34-\u0e3a\u0e47-\u0e4e]", txt))
            if prev_x1 is not None and not is_combining and txt != " ":
                gap = ch["x0"] - prev_x1
                if gap > 2.0 and (not parts or parts[-1] != " "):
                    parts.append(" ")
            parts.append(txt)
            if not is_combining:
                prev_x1 = max(prev_x1, ch["x1"]) if prev_x1 is not None else ch["x1"]
        line_str = normalize_thai(re.sub(r"[ \t]+", " ", "".join(parts)).strip())
        if line_str:
            result_lines.append(line_str)
    return result_lines


def detect_metadata(pdf: pdfplumber.PDF, pdf_path: Path) -> dict[str, Any]:
    """Extract academic year, active semester, week date range, URL, and print timestamp."""
    p0 = pdf.pages[0]
    words = p0.extract_words(keep_blank_chars=False, use_text_flow=False)

    # Academic year (4-digit Thai Buddhist Era year near header top < 165, x < 110)
    academic_year_be: int | None = None
    for w in words:
        if w["top"] < 165 and w["x0"] < 110 and re.fullmatch(r"25\d{2}", w["text"]):
            academic_year_be = int(w["text"])
            break

    # Active semester: in KMUTNB's Bootstrap btn-group, the active button has higher z-index
    # and is painted LAST in the PDF character stream among the '1', '2', '3' buttons.
    sem_chars = [
        c for c in p0.chars
        if 105 <= c["x0"] <= 190 and 135 <= c["top"] <= 156 and c["text"] in ("1", "2", "3")
    ]
    semester: int | None = None
    if sem_chars:
        semester = int(sem_chars[-1]["text"])
    else:
        # Fallback to filename pattern (e.g. schd1:2569.pdf -> 1)
        m = re.search(r"schd(\d)", pdf_path.name, re.IGNORECASE)
        if m:
            semester = int(m.group(1))

    # Date range in header (e.g., 15/11/2569 - 21/11/2569)
    header_text = " ".join(w["text"] for w in words if w["top"] < 165)
    date_range_obj: dict[str, str | None] | None = None
    m_range = re.search(r"(\d{2}/\d{2}/\d{4})\s*-\s*(\d{2}/\d{2}/\d{4})", header_text)
    if m_range:
        raw_start, raw_end = m_range.group(1), m_range.group(2)
        date_range_obj = {
            "raw": f"{raw_start} - {raw_end}",
            "start_date_iso": parse_be_dmy_to_iso(raw_start),
            "end_date_iso": parse_be_dmy_to_iso(raw_end),
        }

    # Footer metadata: source URL and printed timestamp
    footer_words = [w for w in words if w["top"] > p0.height - 80]
    source_url: str | None = None
    printed_at: str | None = None
    for w in footer_words:
        if w["text"].startswith("http"):
            source_url = w["text"]
    footer_text = " ".join(w["text"] for w in footer_words)
    m_print = re.search(r"(\d{2}/\d{2}/\d{2,4},?\s+\d{2}:\d{2})", footer_text)
    if m_print:
        printed_at = m_print.group(1)

    return {
        "source_file": pdf_path.name,
        "source_url": source_url,
        "academic_year_be": academic_year_be,
        "academic_year_ad": (academic_year_be - 543) if academic_year_be else None,
        "semester": semester,
        "week_date_range": date_range_obj,
        "printed_at": printed_at,
    }


def parse_be_dmy_to_iso(dmy: str) -> str | None:
    """Convert DD/MM/YYYY (Buddhist Era) to ISO YYYY-MM-DD (Gregorian)."""
    m = re.fullmatch(r"(\d{1,2})/(\d{1,2})/(\d{4})", dmy.strip())
    if not m:
        return None
    day, month, year_be = int(m.group(1)), int(m.group(2)), int(m.group(3))
    year_ad = year_be - 543 if year_be > 2400 else year_be
    return f"{year_ad:04d}-{month:02d}-{day:02d}"


def parse_course_name(lines: list[str]) -> tuple[str, str]:
    """Split course title lines into Thai name and English name."""
    th_lines: list[str] = []
    en_lines: list[str] = []
    for line in lines:
        if THAI_CHAR_RE.search(line):
            th_lines.append(line)
        else:
            en_lines.append(line)
    # Thai wraps mid-word without spaces; English wraps between words with spaces
    name_th = "".join(th_lines).strip()
    name_en = " ".join(en_lines).strip()
    return name_th, name_en


def parse_credits(text: str) -> dict[str, Any]:
    """Parse credit string like '3(2-2-5)' into structured fields."""
    raw = re.sub(r"\s+", "", text)
    m = re.fullmatch(r"(\d+)\((\d+)-(\d+)-(\d+)\)", raw)
    if m:
        return {
            "raw": raw,
            "total": int(m.group(1)),
            "lecture": int(m.group(2)),
            "lab": int(m.group(3)),
            "self_study": int(m.group(4)),
        }
    return {"raw": raw, "total": None, "lecture": None, "lab": None, "self_study": None}


def parse_instructors(lines: list[str]) -> list[str]:
    """
    Reconstruct instructor names from wrapped table lines, handling multiple
    instructors and mid-word Thai surname/first-name line wraps.
    """
    groups: list[list[str]] = []
    for raw_line in lines:
        line = raw_line.lstrip("•·- ").strip()
        if not line:
            continue
        if INSTRUCTOR_TITLE_RE.match(line) or not groups:
            groups.append([line])
        else:
            groups[-1].append(line)

    instructors: list[str] = []
    for grp in groups:
        combined = grp[0]
        for nxt in grp[1:]:
            # Strip academic title prefix from current accumulated string to inspect name tokens
            remainder = INSTRUCTOR_TITLE_PREFIX_RE.sub("", combined).strip()
            if not remainder:
                # Previous line ended with an academic title (e.g. ผู้ช่วยศาสตราจารย์\nดร.ณฐพร)
                combined = f"{combined} {nxt}"
            elif " " in remainder or " " in nxt:
                # Either previous line already has FirstName+LastName prefix, or next line
                # has FirstName suffix+LastName -> wrapped mid-word, join without space
                combined = f"{combined}{nxt}"
            else:
                # Previous line has 1 name token (FirstName) and next line has 1 token (LastName)
                combined = f"{combined} {nxt}"

        # Normalize spacing between Thai title and Latin name (e.g., อาจารย์Thomas -> อาจารย์ Thomas)
        combined = re.sub(r"([\u0E00-\u0E7F])([A-Za-z])", r"\1 \2", combined)
        combined = re.sub(r"\s+", " ", combined).strip()
        if combined:
            instructors.append(combined)
    return instructors


def parse_schedules_and_rooms(sched_lines: list[str], room_lines: list[str]) -> list[dict[str, Any]]:
    """
    Parse one or more schedule slots and align them with room entries.
    Handles:
      - Wrapped schedule slots (e.g. 'S.1\\nพฤ.13:00-\\n16:00')
      - Multiple slots per section (e.g. 'L.1 จ.13:00-14:00', 'L.1 จ.11:00-12:00', 'L.1 จ.09:00-11:00')
      - Wrapped room codes (e.g. '31-\\n5A09' -> '31-5A09')
      - Multiple rooms for one slot (e.g. '31-4A04', '31-4A05')
      - Unassigned room ('-' -> [])
    """
    # Join schedule text cleanly and fix hyphens split across lines
    sched_text = " ".join(sched_lines)
    sched_text = re.sub(r"-\s+", "-", sched_text)
    sched_text = re.sub(r"\s+-", "-", sched_text)

    slot_pattern = re.compile(
        r"(?:([A-Z]\.\d+)\s*)?(พฤ\.|อา\.|จ\.|อ\.|พ\.|ศ\.|ส\.)\s*(\d{1,2}:\d{2})-(\d{1,2}:\d{2})"
    )
    raw_slots = list(slot_pattern.finditer(sched_text))

    # Reconstruct room codes from wrapped lines
    rooms: list[str] = []
    i = 0
    while i < len(room_lines):
        token = room_lines[i].strip()
        if token.endswith("-") and i + 1 < len(room_lines):
            rooms.append(token + room_lines[i + 1].strip())
            i += 2
        else:
            rooms.append(token)
            i += 1
    # Filter out placeholder dashes like '-'
    cleaned_rooms = [r for r in rooms if r and r != "-"]

    schedules: list[dict[str, Any]] = []
    for idx, m in enumerate(raw_slots):
        day_abbr = m.group(2)
        start_time = m.group(3).zfill(5)
        end_time = m.group(4).zfill(5)
        day_th, day_en, day_of_week = THAI_DAYS[day_abbr]

        if len(raw_slots) == 1:
            slot_rooms = cleaned_rooms
        elif len(rooms) == len(raw_slots):
            r = rooms[idx]
            slot_rooms = [] if r == "-" else [r]
        else:
            slot_rooms = cleaned_rooms

        schedules.append({
            "day_th": day_th,
            "day_abbr_th": day_abbr,
            "day_en": day_en,
            "day_of_week": day_of_week,
            "start_time": start_time,
            "end_time": end_time,
            "rooms": slot_rooms,
        })

    # Sort chronologically by day_of_week, start_time, end_time
    schedules.sort(key=lambda s: (s["day_of_week"], s["start_time"], s["end_time"]))
    return schedules


def parse_exam(lines: list[str]) -> dict[str, str | None] | None:
    """Parse Thai exam cell like '20 ส.ค. 2568 เวลา 09:00-11:00'."""
    if not lines:
        return None
    text = " ".join(lines)
    text = re.sub(r"-\s+", "-", text)
    text = re.sub(r"\s+-", "-", text)
    text = re.sub(r"\s+", " ", text).strip()
    if not text or text == "-":
        return None

    m = re.search(
        r"(\d{1,2})\s+([ก-ฮ]+\.?[ก-ฮ]*\.)\s+(\d{4})(?:\s*เวลา\s*(\d{1,2}:\d{2})-(\d{1,2}:\d{2}))?",
        text,
    )
    if not m:
        return {"raw": text, "date_th": None, "date_iso": None, "start_time": None, "end_time": None}

    day = int(m.group(1))
    month_abbr = m.group(2)
    year_be = int(m.group(3))
    month_num = THAI_MONTHS.get(month_abbr)
    year_ad = year_be - 543 if year_be > 2400 else year_be
    date_iso = f"{year_ad:04d}-{month_num:02d}-{day:02d}" if month_num else None

    return {
        "raw": text,
        "date_th": f"{day} {month_abbr} {year_be}",
        "date_iso": date_iso,
        "start_time": m.group(4).zfill(5) if m.group(4) else None,
        "end_time": m.group(5).zfill(5) if m.group(5) else None,
    }


def extract_course_rows(pdf: pdfplumber.PDF) -> list[dict[str, Any]]:
    """Find the 10-column course detail table across all pages and extract each row."""
    rows_out: list[dict[str, Any]] = []
    for page in pdf.pages:
        found_tables = page.find_tables()
        for tbl in found_tables:
            extracted = tbl.extract()
            if not extracted or not extracted[0]:
                continue
            header_joined = " ".join(c or "" for c in extracted[0])
            if "รหัสวิชา" not in header_joined or "รายวิชา" not in header_joined:
                continue

            # Map columns by header keywords so minor layout shifts still work
            col_count = len(tbl.rows[0].cells)
            if col_count < 7:
                continue

            for row_obj in tbl.rows[1:]:
                cells = row_obj.cells
                if not cells or cells[0] is None:
                    continue
                code_lines = extract_cell_lines_stream_order(page, cells[0])
                course_code = "".join(code_lines).strip()
                if not re.fullmatch(r"\d{6,10}", course_code):
                    continue

                sec_lines = extract_cell_lines_stream_order(page, cells[1]) if cells[1] else []
                name_lines = extract_cell_lines_stream_order(page, cells[2]) if cells[2] else []
                cred_lines = extract_cell_lines_stream_order(page, cells[3]) if cells[3] else []
                inst_lines = extract_cell_lines_stream_order(page, cells[4]) if cells[4] else []
                sched_lines = extract_cell_lines_stream_order(page, cells[5]) if cells[5] else []
                room_lines = extract_cell_lines_stream_order(page, cells[6]) if cells[6] else []
                mid_lines = extract_cell_lines_stream_order(page, cells[7]) if len(cells) > 7 and cells[7] else []
                fin_lines = extract_cell_lines_stream_order(page, cells[8]) if len(cells) > 8 and cells[8] else []
                rem_lines = extract_cell_lines_stream_order(page, cells[9]) if len(cells) > 9 and cells[9] else []

                section = "".join(sec_lines).strip()
                sec_prefix = section.split(".")[0].upper() if section else ""
                name_th, name_en = parse_course_name(name_lines)
                credits_obj = parse_credits("".join(cred_lines))
                instructors = parse_instructors(inst_lines)
                schedules = parse_schedules_and_rooms(sched_lines, room_lines)
                midterm = parse_exam(mid_lines)
                final = parse_exam(fin_lines)
                remarks = " ".join(rem_lines).strip() or None

                rows_out.append({
                    "course_code": course_code,
                    "course_name_th": name_th,
                    "course_name_en": name_en,
                    "credits": credits_obj,
                    "section": section,
                    "section_type": SECTION_TYPES.get(sec_prefix, "other"),
                    "instructors": instructors,
                    "schedules": schedules,
                    "midterm_exam": midterm,
                    "final_exam": final,
                    "remarks": remarks,
                })
    return rows_out


def convert_pdf_to_dict(pdf_path: Path) -> dict[str, Any]:
    """Convert a single KMUTNB timetable PDF into a structured dictionary."""
    with pdfplumber.open(pdf_path) as pdf:
        metadata = detect_metadata(pdf, pdf_path)
        raw_rows = extract_course_rows(pdf)

    # Group rows by course_code so multi-section courses (S.1 + L.1) are unified
    courses_map: dict[str, dict[str, Any]] = {}
    for r in raw_rows:
        code = r["course_code"]
        if code not in courses_map:
            courses_map[code] = {
                "course_code": code,
                "course_name_th": r["course_name_th"],
                "course_name_en": r["course_name_en"],
                "credits": r["credits"],
                "sections": [],
            }
        courses_map[code]["sections"].append({
            "section": r["section"],
            "section_type": r["section_type"],
            "instructors": r["instructors"],
            "schedules": r["schedules"],
            "midterm_exam": r["midterm_exam"],
            "final_exam": r["final_exam"],
            "remarks": r["remarks"],
        })

    courses = list(courses_map.values())

    # Build day-by-day weekly_schedule sorted chronologically
    weekly_schedule: dict[str, list[dict[str, Any]]] = {day: [] for day in DAY_ORDER}
    for course in courses:
        for sec in course["sections"]:
            for slot in sec["schedules"]:
                weekly_schedule[slot["day_en"]].append({
                    "course_code": course["course_code"],
                    "course_name_th": course["course_name_th"],
                    "course_name_en": course["course_name_en"],
                    "section": sec["section"],
                    "section_type": sec["section_type"],
                    "start_time": slot["start_time"],
                    "end_time": slot["end_time"],
                    "rooms": slot["rooms"],
                    "instructors": sec["instructors"],
                })
    for day in DAY_ORDER:
        weekly_schedule[day].sort(key=lambda item: (item["start_time"], item["end_time"], item["course_code"]))

    total_credits = sum(
        c["credits"]["total"] for c in courses if isinstance(c["credits"].get("total"), int)
    )
    metadata["total_courses"] = len(courses)
    metadata["total_sections"] = len(raw_rows)
    metadata["total_credits"] = total_credits

    return {
        "metadata": metadata,
        "courses": courses,
        "weekly_schedule": weekly_schedule,
    }


def collect_pdf_paths(inputs: list[str]) -> list[Path]:
    """Resolve input files and directories into a sorted list of PDF paths."""
    pdf_paths: list[Path] = []
    for raw in inputs:
        p = Path(raw)
        if p.is_dir():
            pdf_paths.extend(sorted(p.glob("*.pdf")))
        elif p.is_file() and p.suffix.lower() == ".pdf":
            pdf_paths.append(p)
        else:
            print(f"Warning: skipping non-PDF or missing path: {raw}", file=sys.stderr)
    return pdf_paths


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Auto-convert KMUTNB Registrar timetable PDF(s) to structured JSON."
    )
    parser.add_argument(
        "inputs",
        nargs="+",
        help="One or more PDF file paths or directories containing timetable PDFs.",
    )
    parser.add_argument(
        "-o",
        "--output",
        help="Output directory (default: same folder as each PDF) or output file path when using --combine.",
    )
    parser.add_argument(
        "--combine",
        action="store_true",
        help="Combine all converted timetables into a single JSON file sorted by academic year and semester.",
    )
    parser.add_argument(
        "--stdout",
        action="store_true",
        help="Print JSON output to stdout instead of writing files.",
    )
    parser.add_argument(
        "--indent",
        type=int,
        default=2,
        help="JSON indentation level (default: 2).",
    )
    args = parser.parse_args()

    pdf_paths = collect_pdf_paths(args.inputs)
    if not pdf_paths:
        print("Error: no PDF files found.", file=sys.stderr)
        return 1

    results = [convert_pdf_to_dict(p) for p in pdf_paths]

    if args.combine:
        results.sort(
            key=lambda r: (
                r["metadata"].get("academic_year_be") or 0,
                r["metadata"].get("semester") or 0,
                r["metadata"].get("source_file") or "",
            )
        )
        payload = {"timetables": results}
        text = json.dumps(payload, ensure_ascii=False, indent=args.indent)
        if args.stdout:
            print(text)
        else:
            out_path = Path(args.output) if args.output else Path("timetables_combined.json")
            out_path.parent.mkdir(parents=True, exist_ok=True)
            out_path.write_text(text + "\n", encoding="utf-8")
            print(f"Saved combined JSON ({len(results)} timetables) -> {out_path}")
    else:
        if args.stdout:
            payload = results[0] if len(results) == 1 else {"timetables": results}
            print(json.dumps(payload, ensure_ascii=False, indent=args.indent))
        else:
            out_dir = Path(args.output) if args.output else None
            if out_dir:
                out_dir.mkdir(parents=True, exist_ok=True)
            for pdf_path, data in zip(pdf_paths, results):
                safe_stem = pdf_path.stem.replace(":", "_")
                target = (out_dir / f"{safe_stem}.json") if out_dir else pdf_path.with_name(f"{safe_stem}.json")
                target.write_text(
                    json.dumps(data, ensure_ascii=False, indent=args.indent) + "\n",
                    encoding="utf-8",
                )
                meta = data["metadata"]
                print(
                    f"Converted {pdf_path.name} -> {target} "
                    f"(Year {meta['academic_year_be']}, Sem {meta['semester']}, "
                    f"{meta['total_courses']} courses, {meta['total_sections']} sections, "
                    f"{meta['total_credits']} credits)"
                )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())