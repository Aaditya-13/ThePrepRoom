const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const qCount = await prisma.question.count();
  const eqCount = await prisma.experienceQuestion.count();
  const expCount = await prisma.experience.count();
  const users = await prisma.user.findMany({ select: { id: true, email: true, role: true, name: true } });
  
  console.log('=== DATABASE STATUS ===');
  console.log(`Experiences count: ${expCount}`);
  console.log(`Questions count: ${qCount}`);
  console.log(`Experience Questions count: ${eqCount}`);
  console.log('Registered Users:', users);
}

main().catch(console.error).finally(() => prisma.$disconnect());
