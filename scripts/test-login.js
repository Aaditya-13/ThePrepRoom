const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function test() {
  const email = 'vedkalantri7@gmail.com';
  const password = 'admin123';

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.error(`User ${email} NOT FOUND in database!`);
    return;
  }

  const isValid = await bcrypt.compare(password, user.passwordHash || '');
  console.log(`User found: ${user.name} (${user.email}), role: ${user.role}`);
  console.log(`Password check with '${password}': ${isValid ? 'PASSED ✅' : 'FAILED ❌'}`);
}

test().catch(console.error).finally(() => prisma.$disconnect());
