const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("--- CLEANING DATABASE & RESTORING USERS ---");
  
  // 1. Purge all dummy experiences so users can add real experiences
  console.log("1. Removing all sample experiences...");
  await prisma.report.deleteMany({});
  await prisma.bookmark.deleteMany({});
  await prisma.experienceQuestion.deleteMany({});
  await prisma.interviewRound.deleteMany({});
  await prisma.experience.deleteMany({});
  console.log("All sample experiences deleted cleanly.");

  // 2. Ensure Admin user vedkalantri7@gmail.com
  console.log("2. Setting up Admin user vedkalantri7@gmail.com...");
  const passwordHash = await bcrypt.hash("admin123", 10);
  
  const admin = await prisma.user.upsert({
    where: { email: "vedkalantri7@gmail.com" },
    update: {
      role: "ADMIN",
      passwordHash: passwordHash,
      name: "Ved Kalantri",
      department: "Information Technology",
      graduationYear: 2027,
    },
    create: {
      email: "vedkalantri7@gmail.com",
      name: "Ved Kalantri",
      role: "ADMIN",
      passwordHash: passwordHash,
      department: "Information Technology",
      graduationYear: 2027,
    },
  });

  console.log("Admin account active:", admin.email, "| Role:", admin.role);

  // Restore vedk7744@gmail.com
  await prisma.user.upsert({
    where: { email: "vedk7744@gmail.com" },
    update: {
      passwordHash: passwordHash,
      name: "Ved Kalantri",
    },
    create: {
      email: "vedk7744@gmail.com",
      name: "Ved Kalantri",
      role: "STUDENT",
      passwordHash: passwordHash,
    },
  });

  // Verify counts
  const expCount = await prisma.experience.count();
  const userCount = await prisma.user.count();
  const companyCount = await prisma.company.count();
  const topicCount = await prisma.topic.count();

  console.log("--- POSTGRESQL VERIFICATION ---");
  console.log("Total Experiences:", expCount, "(Clean: 0 sample experiences)");
  console.log("Total Companies:", companyCount);
  console.log("Total Topics:", topicCount);
  console.log("Total Users:", userCount);
  console.log("Admin email: vedkalantri7@gmail.com");
  console.log("Admin password: admin123");
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
