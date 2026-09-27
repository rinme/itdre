import { PrismaClient, DegreeLevel, ScheduleStatus, CourseType, DayOfWeek } from "@prisma/client";

const prisma = new PrismaClient();

const SAMPLE_PRESETS = [
  {
    courseCode: "060133101",
    courseName: "Programming Fundamentals",
    credits: "3(2-2-5)",
    courseType: CourseType.LECTURE,
    color: "orange",
  },
  {
    courseCode: "060133102",
    courseName: "Programming Fundamentals Laboratory",
    credits: "1(0-3-2)",
    courseType: CourseType.LAB,
    color: "blue",
  },
  {
    courseCode: "060133103",
    courseName: "Discrete Mathematics for IT",
    credits: "3(3-0-6)",
    courseType: CourseType.LECTURE,
    color: "emerald",
  },
  {
    courseCode: "060133104",
    courseName: "Computer Networks & Architecture",
    credits: "3(2-2-5)",
    courseType: CourseType.BOTH,
    color: "purple",
  },
  {
    courseCode: "060133201",
    courseName: "Data Structures & Algorithms",
    credits: "3(2-2-5)",
    courseType: CourseType.BOTH,
    color: "rose",
  },
  {
    courseCode: "060133202",
    courseName: "Database Systems & Design",
    credits: "3(2-2-5)",
    courseType: CourseType.BOTH,
    color: "amber",
  },
  {
    courseCode: "060133203",
    courseName: "Web Application Development",
    credits: "3(2-2-5)",
    courseType: CourseType.BOTH,
    color: "sky",
  },
  {
    courseCode: "060133301",
    courseName: "Cybersecurity & Network Defense",
    credits: "3(3-0-6)",
    courseType: CourseType.LECTURE,
    color: "rose",
  },
];

async function main() {
  console.log("Seeding Database...");

  // 1. Seed Course Presets
  console.log("Seeding Course Presets...");
  for (const preset of SAMPLE_PRESETS) {
    const existing = await prisma.coursePreset.findFirst({
      where: { courseCode: preset.courseCode },
    });
    if (!existing) {
      await prisma.coursePreset.create({
        data: preset,
      });
    }
  }
  const totalPresets = await prisma.coursePreset.count();
  console.log(`Course Presets ready: ${totalPresets} presets`);

  // 2. Seed Sample Schedule & Slots
  console.log("Seeding Schedule & Course Slots...");
  // Clear any partial slots for this test cohort to ensure pristine state
  const existingSchedule = await prisma.schedule.findUnique({
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
    include: { slots: true },
  });

  if (existingSchedule && existingSchedule.slots.length === 0) {
    // Add sample slots to existing schedule
    await prisma.courseSlot.createMany({
      data: [
        {
          scheduleId: existingSchedule.id,
          courseCode: "060133101",
          courseName: "Programming Fundamentals",
          section: "Sec 1",
          dayOfWeek: DayOfWeek.MONDAY,
          startTime: "09:00",
          endTime: "12:00",
          room: "79-5A02",
          instructors: ["ผศ.ดร.สุชา สมานชาติ", "ผศ.ดร.ผุสดี บุญรอด"],
          courseType: CourseType.LECTURE,
          color: "orange",
        },
        {
          scheduleId: existingSchedule.id,
          courseCode: "060133102",
          courseName: "Programming Fundamentals Laboratory",
          section: "Sec 1",
          dayOfWeek: DayOfWeek.MONDAY,
          startTime: "13:00",
          endTime: "16:00",
          room: "79-5A03",
          instructors: ["ผศ.ดร.สุชา สมานชาติ", "อาจารย์ ทองพูล หีบไธสง"],
          courseType: CourseType.LAB,
          color: "blue",
        },
        {
          scheduleId: existingSchedule.id,
          courseCode: "060133103",
          courseName: "Discrete Mathematics for IT",
          section: "Sec 1",
          dayOfWeek: DayOfWeek.WEDNESDAY,
          startTime: "09:00",
          endTime: "12:00",
          room: "79-4A01",
          instructors: ["ผศ.ดร.มาลีรัตน์ มะลิแย้ม"],
          courseType: CourseType.LECTURE,
          color: "emerald",
        },
        {
          scheduleId: existingSchedule.id,
          courseCode: "060133203",
          courseName: "Web Application Development",
          section: "Sec 1",
          dayOfWeek: DayOfWeek.THURSDAY,
          startTime: "13:00",
          endTime: "17:00",
          room: "79-5A01",
          instructors: ["อาจารย์ อรรฆรัตน์ บุญยะผลานันท์", "ผศ.ดร.ศิฬาณี นุชิตประสิทธิ์ชัย"],
          courseType: CourseType.BOTH,
          color: "sky",
        },
      ],
    });
    console.log("Added 4 slots to existing schedule:", existingSchedule.id);
  } else if (!existingSchedule) {
    const created = await prisma.schedule.create({
      data: {
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
              instructors: ["ผศ.ดร.สุชา สมานชาติ", "ผศ.ดร.ผุสดี บุญรอด"],
              courseType: CourseType.LECTURE,
              color: "orange",
            },
            {
              courseCode: "060133102",
              courseName: "Programming Fundamentals Laboratory",
              section: "Sec 1",
              dayOfWeek: DayOfWeek.MONDAY,
              startTime: "13:00",
              endTime: "16:00",
              room: "79-5A03",
              instructors: ["ผศ.ดร.สุชา สมานชาติ", "อาจารย์ ทองพูล หีบไธสง"],
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
              instructors: ["ผศ.ดร.มาลีรัตน์ มะลิแย้ม"],
              courseType: CourseType.LECTURE,
              color: "emerald",
            },
            {
              courseCode: "060133203",
              courseName: "Web Application Development",
              section: "Sec 1",
              dayOfWeek: DayOfWeek.THURSDAY,
              startTime: "13:00",
              endTime: "17:00",
              room: "79-5A01",
              instructors: ["อาจารย์ อรรฆรัตน์ บุญยะผลานันท์", "ผศ.ดร.ศิฬาณี นุชิตประสิทธิ์ชัย"],
              courseType: CourseType.BOTH,
              color: "sky",
            },
          ],
        },
      },
    });
    console.log("Created schedule with 4 slots:", created.id);
  } else {
    console.log(`Schedule already has ${existingSchedule.slots.length} slots.`);
  }

  console.log("Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
