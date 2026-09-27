import { PrismaClient, DegreeLevel, ScheduleStatus, CourseType, DayOfWeek } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const schedule = await prisma.schedule.upsert({
    where: {
      unique_cohort_schedule: {
        academicYear: 2567,
        semester: 1,
        degreeLevel: DegreeLevel.BACHELOR,
        programId: "bachelor-itd",
        yearLevel: 1,
        sectionGroup: "Sec 1",
      },
    },
    update: {},
    create: {
      academicYear: 2567,
      semester: 1,
      degreeLevel: DegreeLevel.BACHELOR,
      programId: "bachelor-itd",
      programName: "หลักสูตรวิทยาศาสตรบัณฑิต สาขาวิชาเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล (วท.บ.)",
      yearLevel: 1,
      sectionGroup: "Sec 1",
      status: ScheduleStatus.PUBLISHED,
      note: "ตารางเรียนภาคการศึกษาที่ 1/2567 ชั้นปีที่ 1",
      slots: {
        create: [
          {
            courseCode: "060133101",
            courseName: "Programming Fundamentals",
            section: "Sec 1",
            dayOfWeek: DayOfWeek.MONDAY,
            startTime: "09:00",
            endTime: "12:00",
            room: "79-5A02",
            instructors: ["ดร. อานนท์ วงศ์สมบูรณ์"],
            courseType: CourseType.LECTURE,
            color: "orange",
          },
          {
            courseCode: "060133102",
            courseName: "Programming Fundamentals Lab",
            section: "Sec 1",
            dayOfWeek: DayOfWeek.MONDAY,
            startTime: "13:00",
            endTime: "16:00",
            room: "79-5A03",
            instructors: ["ดร. อานนท์ วงศ์สมบูรณ์"],
            courseType: CourseType.LAB,
            color: "blue",
          },
          {
            courseCode: "060133103",
            courseName: "Discrete Mathematics for IT",
            section: "Sec 1",
            dayOfWeek: DayOfWeek.WEDNESDAY,
            startTime: "09:00",
            endTime: "12:00",
            room: "79-4A01",
            instructors: ["ผศ. สมชาย ใจดี"],
            courseType: CourseType.LECTURE,
            color: "emerald",
          },
        ],
      },
    },
  });

  console.log("Seeded sample schedule:", schedule.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
