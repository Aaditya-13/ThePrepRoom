const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function testWrite() {
  const company = await prisma.company.findFirst();
  const role = await prisma.companyRole.findFirst({ where: { companyId: company.id } });
  const user = await prisma.user.findUnique({ where: { email: "vedkalantri7@gmail.com" } });
  
  console.log("Testing write into Neon PostgreSQL...");
  const exp = await prisma.experience.create({
    data: {
      slug: "test-verification-slug-" + Date.now(),
      companyId: company.id,
      roleId: role.id,
      userId: user.id,
      interviewYear: 2026,
      placementType: "CAMPUS",
      overallExperience: "Test write verification in PostgreSQL to confirm instant persistence.",
      status: "APPROVED",
    },
  });

  console.log("Successfully created experience in PostgreSQL! ID:", exp.id);
  const fetched = await prisma.experience.findUnique({ where: { id: exp.id } });
  console.log("Verified from PostgreSQL:", fetched.slug);

  // Clean up
  await prisma.experience.delete({ where: { id: exp.id } });
  console.log("Cleaned up test record. Total experiences in PostgreSQL:", await prisma.experience.count());
}

testWrite()
  .catch((e) => {
    console.error("Test failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
