const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const targetCompanies = [
    {
      name: "TCS",
      slug: "tcs",
      industry: "IT Services & Consulting",
      roles: ["Assistant System Engineer", "Digital Innovator", "Ninja Developer"]
    },
    {
      name: "Deloitte",
      slug: "deloitte",
      industry: "Consulting & Technology",
      roles: ["Analyst", "Associate Analyst", "Technology Consultant"]
    },
    {
      name: "Cisco",
      slug: "cisco",
      industry: "Networking & Cloud Infrastructure",
      roles: ["Software Engineer", "Technical Consulting Engineer"]
    },
    {
      name: "Accenture",
      slug: "accenture",
      industry: "Technology Services",
      roles: ["Associate Software Engineer", "Advanced ASE"]
    },
    {
      name: "Amazon",
      slug: "amazon",
      industry: "Cloud & E-Commerce",
      roles: ["Software Development Engineer (SDE-1)", "Support Engineer"]
    },
    {
      name: "Microsoft",
      slug: "microsoft",
      industry: "Software & Cloud Computing",
      roles: ["Software Engineer", "Support Engineer"]
    },
    {
      name: "Google",
      slug: "google",
      industry: "Search & Cloud Systems",
      roles: ["Software Engineer", "Application Engineer"]
    }
  ];

  for (const c of targetCompanies) {
    const company = await prisma.company.upsert({
      where: { slug: c.slug },
      update: { name: c.name, industry: c.industry },
      create: { name: c.name, slug: c.slug, industry: c.industry }
    });

    for (const r of c.roles) {
      const roleSlug = r.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      await prisma.companyRole.upsert({
        where: {
          companyId_slug: {
            companyId: company.id,
            slug: roleSlug
          }
        },
        update: { title: r },
        create: {
          companyId: company.id,
          title: r,
          slug: roleSlug
        }
      });
    }
  }

  const allCompanies = await prisma.company.findMany({
    select: { name: true, slug: true, roles: { select: { title: true } } }
  });
  console.log("Current Companies in DB:", allCompanies.map(c => `${c.name} (${c.roles.length} roles)`));
}

main().catch(console.error).finally(() => prisma.$disconnect());
