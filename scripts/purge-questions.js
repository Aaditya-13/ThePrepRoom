const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('--- PURGING DUMMY QUESTIONS & SEED USERS ---');

  // 1. Delete reports on questions
  const deletedReports = await prisma.report.deleteMany({});
  console.log(`Deleted ${deletedReports.count} reports.`);

  // 2. Delete experience question links
  const deletedEQ = await prisma.experienceQuestion.deleteMany({});
  console.log(`Deleted ${deletedEQ.count} experience question links.`);

  // 3. Delete all questions
  const deletedQuestions = await prisma.question.deleteMany({});
  console.log(`Deleted ${deletedQuestions.count} questions. Total questions is now 0.`);

  // 4. Remove internal demo seed accounts, keep real users
  const deletedInternalUsers = await prisma.user.deleteMany({
    where: {
      email: {
        in: ['admin@thepreproom.internal', 'student@thepreproom.internal']
      }
    }
  });
  console.log(`Deleted ${deletedInternalUsers.count} dummy internal accounts.`);

  // 5. Ensure admin user vedkalantri7@gmail.com is present with known bcrypt password admin123
  const adminEmail = 'vedkalantri7@gmail.com';
  const adminPassword = 'admin123';
  const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: 'ADMIN',
      passwordHash: hashedAdminPassword,
      name: 'Ved Kalantri'
    },
    create: {
      email: adminEmail,
      name: 'Ved Kalantri',
      role: 'ADMIN',
      passwordHash: hashedAdminPassword
    }
  });

  // Verify bcrypt password check matches
  const isPasswordValid = await bcrypt.compare(adminPassword, admin.passwordHash);
  console.log(`Admin account ${adminEmail} verified: Role=${admin.role}, Password check: ${isPasswordValid ? 'SUCCESS (admin123 works)' : 'FAILED'}`);

  // Summary counts
  const finalExpCount = await prisma.experience.count();
  const finalQCount = await prisma.question.count();
  const remainingUsers = await prisma.user.findMany({
    select: { email: true, role: true, name: true }
  });

  console.log('\n--- FINAL DATABASE STATE ---');
  console.log(`Experiences count: ${finalExpCount} (MUST BE 0)`);
  console.log(`Questions count: ${finalQCount} (MUST BE 0)`);
  console.log('Active Users:', remainingUsers);
}

main()
  .catch((err) => {
    console.error('Error during purge:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
