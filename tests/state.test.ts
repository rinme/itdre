import { describe, expect, it, beforeEach, vi } from "vitest";
import { languageState, setLanguage, t, type Language } from "$lib/state/language.svelte";
import { adminPresetsState, INSTRUCTOR_LIST } from "$lib/state/admin-presets.svelte";

describe("Language State (Universal Svelte 5 Rune)", () => {
  beforeEach(() => {
    // Reset to 'th' before each test
    languageState.setLanguage("th");
  });

  it("initializes with default language 'th'", () => {
    expect(languageState.language).toBe("th");
  });

  it("translates text using t() based on active language", () => {
    expect(languageState.t("ยินดีต้อนรับ", "Welcome")).toBe("ยินดีต้อนรับ");
    expect(t("หน้าหลัก", "Home")).toBe("หน้าหลัก");

    languageState.setLanguage("en");
    expect(languageState.language).toBe("en");
    expect(languageState.t("ยินดีต้อนรับ", "Welcome")).toBe("Welcome");
    expect(t("หน้าหลัก", "Home")).toBe("Home");
  });

  it("falls back to Thai when English translation is undefined or empty", () => {
    languageState.setLanguage("en");
    expect(languageState.t("ภาษาไทยเท่านั้น")).toBe("ภาษาไทยเท่านั้น");
    expect(languageState.t("ข้อความ", "")).toBe("ข้อความ");
  });

  it("persists language choice to storage and document.documentElement.lang", () => {
    setLanguage("en");
    const storage = typeof window !== "undefined" ? window.localStorage : undefined;
    if (storage) {
      expect(storage.getItem("itd_lang")).toBe("en");
    }
    if (typeof document !== "undefined") {
      expect(document.documentElement.lang).toBe("en");
    }

    setLanguage("th");
    if (storage) {
      expect(storage.getItem("itd_lang")).toBe("th");
    }
    if (typeof document !== "undefined") {
      expect(document.documentElement.lang).toBe("th");
    }
  });
});

describe("Admin Presets State (Universal Svelte 5 Rune)", () => {
  it("initializes instructors from personnel correctly", () => {
    expect(INSTRUCTOR_LIST.length).toBeGreaterThan(0);
    expect(adminPresetsState.instructors.length).toBe(INSTRUCTOR_LIST.length);

    // Verify first few instructors have valid fields
    const sample = adminPresetsState.instructors[0];
    expect(sample).toHaveProperty("id");
    expect(sample).toHaveProperty("nameTh");
    expect(sample).toHaveProperty("role");
  });

  it("instructors are deduplicated and sorted by Thai collation", () => {
    const names = adminPresetsState.instructors.map((i) => i.nameTh);
    const uniqueNames = new Set(names);
    expect(names.length).toBe(uniqueNames.size);

    // Check sorted order
    for (let i = 0; i < names.length - 1; i++) {
      expect(names[i].localeCompare(names[i + 1], "th")).toBeLessThanOrEqual(0);
    }
  });

  it("initializes coursePresets as empty and loading as false", () => {
    expect(Array.isArray(adminPresetsState.coursePresets)).toBe(true);
    expect(adminPresetsState.loading).toBe(false);
    expect(adminPresetsState.error).toBe(null);
  });

  it("refreshPresets successfully updates coursePresets on 200 response", async () => {
    const mockPresets = [
      {
        id: "p-1",
        courseCode: "060133101",
        courseName: "Programming I",
        credits: "3 (2-2-5)",
        courseType: "BOTH" as const,
        color: "orange",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    ];

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ presets: mockPresets }),
    } as unknown as Response);

    await adminPresetsState.refreshPresets(mockFetch as unknown as typeof fetch);

    expect(mockFetch).toHaveBeenCalledWith("/api/admin/presets");
    expect(adminPresetsState.coursePresets).toEqual(mockPresets);
    expect(adminPresetsState.error).toBe(null);
    expect(adminPresetsState.loading).toBe(false);
  });

  it("refreshPresets handles network or API error gracefully", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    } as unknown as Response);

    await adminPresetsState.refreshPresets(mockFetch as unknown as typeof fetch);

    expect(adminPresetsState.error).toBe("Failed to load presets");
    expect(adminPresetsState.loading).toBe(false);
  });
});
