import { prisma } from "./lib/prisma";
import { normalizeQuestionText, findOrCreateCanonicalQuestion } from "./lib/deduplicate";
import { verifyCompanyRoleConsistency } from "./lib/company-role";
import { getPublicExperiences, getPublicStats, getQuestionFrequency } from "./lib/public-queries";

async function runVerification() {
  console.log("=== RUNNING THEPREPROOM AUTOMATED VERIFICATION ===");

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string) {
    totalTests++;
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passedTests++;
    } else {
      console.error(`[FAIL] ${testName}`);
      process.exitCode = 1;
    }
  }

  // TEST 1: Question Normalization Determinism
  const raw1 = "What is DNS?";
  const raw2 = "What is DNS ?";
  const raw3 = "  what is dns?  ";
  const norm1 = normalizeQuestionText(raw1);
  const norm2 = normalizeQuestionText(raw2);
  const norm3 = normalizeQuestionText(raw3);

  assert(norm1 === "what is dns", "normalizeQuestionText strips punctuation and lowercases");
  assert(norm1 === norm2 && norm2 === norm3, "All variations normalize to exact identical key: 'what is dns'");

  // TEST 2: Reusable Question Deduplication
  const canonicalQ1 = await findOrCreateCanonicalQuestion({ text: "Explain Virtual Memory." });
  const canonicalQ2 = await findOrCreateCanonicalQuestion({ text: "  explain virtual memory? " });
  assert(canonicalQ1.id === canonicalQ2.id, "findOrCreateCanonicalQuestion deduplicates to the same canonical question ID");
  assert(canonicalQ1.normalizedText === "explain virtual memory", "Canonical question stores normalizedText index key");

  // TEST 3: Strict Public APPROVED Isolation Rule
  const publicExp = await getPublicExperiences({});
  const allApproved = publicExp.experiences.every((e) => e.status === "APPROVED");
  assert(allApproved, "Public experiences query ONLY returns status === 'APPROVED'");

  const pendingInPublic = publicExp.experiences.some((e) => e.status === "PENDING" || e.status === "DRAFT");
  assert(!pendingInPublic, "DRAFT and PENDING experiences are strictly absent from public listings");

  // TEST 4: Real Database Statistics (0 Fake Numbers)
  const stats = await getPublicStats();
  const dbApprovedCount = await prisma.experience.count({ where: { status: "APPROVED" } });
  assert(stats.experiencesCount === dbApprovedCount, `Stats match exact DB count (${stats.experiencesCount} approved)`);
  assert(stats.experiencesCount > 0, "Approved experiences count is greater than 0");

  // TEST 5: Question Frequency Uses APPROVED Data Only
  const dnsQuestion = await prisma.question.findFirst({
    where: { normalizedText: { contains: "what is dns" } },
  });
  if (dnsQuestion) {
    const freq = await getQuestionFrequency(dnsQuestion.id);
    const approvedLinks = await prisma.experienceQuestion.count({
      where: {
        questionId: dnsQuestion.id,
        experience: { status: "APPROVED" },
      },
    });
    assert(freq.totalFrequency === approvedLinks, `Question frequency (${freq.totalFrequency}) strictly matches approved links (${approvedLinks})`);
  }

  // TEST 6: Company -> Role Consistency Enforcement
  const esds = await prisma.company.findUnique({ where: { slug: "esds" } });
  const tcs = await prisma.company.findUnique({ where: { slug: "tcs" } });
  const esdsRole = await prisma.companyRole.findFirst({ where: { companyId: esds!.id } });

  if (esds && tcs && esdsRole) {
    // Valid match
    const validCheck = await verifyCompanyRoleConsistency(esds.id, esdsRole.id);
    assert(validCheck.valid === true, "verifyCompanyRoleConsistency passes when role belongs to company");

    // Invalid mismatch: pairing TCS company with ESDS role
    const invalidCheck = await verifyCompanyRoleConsistency(tcs.id, esdsRole.id);
    assert(invalidCheck.valid === false, "verifyCompanyRoleConsistency blocks role mismatch when role does not belong to company");
  }

  // TEST 7: Interview Year vs Graduation Year Separation
  const sampleExp = await prisma.experience.findFirst({
    where: { slug: "esds-system-administrator-2026" },
  });
  assert(sampleExp?.interviewYear === 2026, "interviewYear correctly records year of placement interview (2026)");
  assert(sampleExp?.graduationYear === 2027, "graduationYear correctly stores candidate graduation batch (2027)");

  // TEST 8: Sample/Demo Marker Flag
  assert(sampleExp?.isDemo === true, "Demo experiences explicitly have isDemo === true flag");

  console.log(`\nVerification Summary: ${passedTests}/${totalTests} tests passed.`);
  await prisma.$disconnect();
}

runVerification().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
