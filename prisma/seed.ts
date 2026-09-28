import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clear existing data in correct relational order
  await prisma.report.deleteMany({});
  await prisma.bookmark.deleteMany({});
  await prisma.experienceQuestion.deleteMany({});
  await prisma.interviewRound.deleteMany({});
  await prisma.experience.deleteMany({});
  await prisma.question.deleteMany({});
  await prisma.topic.deleteMany({});
  await prisma.companyRole.deleteMany({});
  await prisma.company.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.college.deleteMany({});

  // 1. College
  const college = await prisma.college.create({
    data: {
      name: "Institute of Technology",
      slug: "institute-of-technology",
      emailDomain: "college.edu",
    },
  });

  // 2. Demo Users (DEVELOPMENT ONLY)
  // WARNING: These credentials are strictly intended for local demonstration and evaluation.
  const passwordHash = await bcrypt.hash("admin123", 10);
  const studentPasswordHash = await bcrypt.hash("student123", 10);

  const adminUser = await prisma.user.create({
    data: {
      email: "admin@thepreproom.internal",
      passwordHash: passwordHash,
      name: "Placement Coordinator (Admin)",
      role: "ADMIN",
      department: "Placement Cell",
      collegeId: college.id,
    },
  });

  const studentUser = await prisma.user.create({
    data: {
      email: "student@thepreproom.internal",
      passwordHash: studentPasswordHash,
      name: "Ved K.",
      role: "STUDENT",
      department: "Information Technology",
      graduationYear: 2027,
      bio: "Final year IT student interested in Linux infrastructure, networks, and cloud architecture.",
      collegeId: college.id,
    },
  });

  // 3. Topics
  const topicData = [
    { name: "Computer Networks", slug: "computer-networks", category: "Core CS" },
    { name: "Operating Systems", slug: "operating-systems", category: "Core CS" },
    { name: "Database Systems", slug: "dbms", category: "Core CS" },
    { name: "Data Structures & Algorithms", slug: "dsa", category: "Core CS" },
    { name: "Linux & Administration", slug: "linux-admin", category: "Cloud / Infrastructure" },
    { name: "Cloud & Virtualization", slug: "cloud-computing", category: "Cloud / Infrastructure" },
    { name: "Web Development", slug: "web-dev", category: "Development" },
    { name: "Behavioral & HR", slug: "hr-behavioral", category: "Interview" },
  ];

  const topics: Record<string, any> = {};
  for (const t of topicData) {
    topics[t.slug] = await prisma.topic.create({ data: t });
  }

  // 4. Questions with normalized deterministic keys
  const questionsList = [
    {
      text: "What is DNS and how does resolution work?",
      normalizedText: "what is dns and how does resolution work",
      slug: "what-is-dns-and-how-does-resolution-work",
      round: "TECHNICAL",
      difficulty: "EASY",
      topicId: topics["computer-networks"].id,
    },
    {
      text: "Explain TCP vs UDP and when to use each.",
      normalizedText: "explain tcp vs udp and when to use each",
      slug: "explain-tcp-vs-udp-and-when-to-use-each",
      round: "TECHNICAL",
      difficulty: "EASY",
      topicId: topics["computer-networks"].id,
    },
    {
      text: "What is SSH and how does asymmetric key authentication work?",
      normalizedText: "what is ssh and how does asymmetric key authentication work",
      slug: "what-is-ssh-and-how-does-asymmetric-key-authentication-work",
      round: "TECHNICAL",
      difficulty: "MEDIUM",
      topicId: topics["linux-admin"].id,
    },
    {
      text: "Explain Linux permissions (rwx) and how chmod/chown work.",
      normalizedText: "explain linux permissions rwx and how chmodchown work",
      slug: "explain-linux-permissions-rwx-and-how-chmod-chown-work",
      round: "TECHNICAL",
      difficulty: "EASY",
      topicId: topics["linux-admin"].id,
    },
    {
      text: "What is Active Directory and what role does LDAP play?",
      normalizedText: "what is active directory and what role does ldap play",
      slug: "what-is-active-directory-and-what-role-does-ldap-play",
      round: "TECHNICAL",
      difficulty: "MEDIUM",
      topicId: topics["cloud-computing"].id,
    },
    {
      text: "Explain OSI 7-Layer model and which layer switches vs routers operate on.",
      normalizedText: "explain osi 7 layer model and which layer switches vs routers operate on",
      slug: "explain-osi-7-layer-model-and-switches-vs-routers",
      round: "TECHNICAL",
      difficulty: "MEDIUM",
      topicId: topics["computer-networks"].id,
    },
    {
      text: "What is a subnet mask and how does CIDR notation work?",
      normalizedText: "what is a subnet mask and how does cidr notation work",
      slug: "what-is-a-subnet-mask-and-how-does-cidr-notation-work",
      round: "TECHNICAL",
      difficulty: "MEDIUM",
      topicId: topics["computer-networks"].id,
    },
    {
      text: "Difference between Process and Thread with memory layout.",
      normalizedText: "difference between process and thread with memory layout",
      slug: "difference-between-process-and-thread-with-memory-layout",
      round: "TECHNICAL",
      difficulty: "EASY",
      topicId: topics["operating-systems"].id,
    },
    {
      text: "What is Virtual Memory and how does page fault handling work?",
      normalizedText: "what is virtual memory and how does page fault handling work",
      slug: "what-is-virtual-memory-and-page-fault-handling",
      round: "TECHNICAL",
      difficulty: "MEDIUM",
      topicId: topics["operating-systems"].id,
    },
    {
      text: "Explain SQL Indexes and difference between Clustered vs Non-Clustered index.",
      normalizedText: "explain sql indexes and difference between clustered vs non clustered index",
      slug: "explain-sql-indexes-clustered-vs-non-clustered",
      round: "TECHNICAL",
      difficulty: "MEDIUM",
      topicId: topics["dbms"].id,
    },
    {
      text: "What are ACID properties in database transactions?",
      normalizedText: "what are acid properties in database transactions",
      slug: "what-are-acid-properties-in-database-transactions",
      round: "TECHNICAL",
      difficulty: "EASY",
      topicId: topics["dbms"].id,
    },
    {
      text: "How do you detect a loop in a Singly Linked List (Floyd's algorithm)?",
      normalizedText: "how do you detect a loop in a singly linked list floyds algorithm",
      slug: "how-do-you-detect-a-loop-in-a-singly-linked-list",
      round: "TECHNICAL",
      difficulty: "EASY",
      topicId: topics["dsa"].id,
    },
    {
      text: "Tell me about yourself and your technical interests.",
      normalizedText: "tell me about yourself and your technical interests",
      slug: "tell-me-about-yourself-and-your-technical-interests",
      round: "HR",
      difficulty: "EASY",
      topicId: topics["hr-behavioral"].id,
    },
    {
      text: "Why should we hire you over other candidates from your batch?",
      normalizedText: "why should we hire you over other candidates from your batch",
      slug: "why-should-we-hire-you-over-other-candidates",
      round: "HR",
      difficulty: "EASY",
      topicId: topics["hr-behavioral"].id,
    },
    {
      text: "Are you willing to relocate or work in rotating shifts?",
      normalizedText: "are you willing to relocate or work in rotating shifts",
      slug: "are-you-willing-to-relocate-or-work-in-rotating-shifts",
      round: "HR",
      difficulty: "EASY",
      topicId: topics["hr-behavioral"].id,
    },
  ];

  const questions: Record<string, any> = {};
  for (const q of questionsList) {
    questions[q.slug] = await prisma.question.create({ data: q });
  }

  // 5. Companies & Roles
  const companyData = [
    {
      name: "ESDS",
      slug: "esds",
      industry: "Cloud & Datacenter Services",
      description: "ESDS Software Solution is a cloud hosting and datacenter infrastructure provider specializing in patented auto-scaling cloud technology.",
      roles: ["System Administrator", "Cloud Support Engineer", "Linux Engineer"],
    },
    {
      name: "TCS",
      slug: "tcs",
      industry: "Information Technology & Services",
      description: "Tata Consultancy Services is a global IT services, consulting and business solutions enterprise.",
      roles: ["Software Engineer", "Assistant System Engineer", "Systems Engineer (Digital)"],
    },
    {
      name: "Deloitte",
      slug: "deloitte",
      industry: "Consulting & Advisory",
      description: "Deloitte provides audit, consulting, financial advisory, risk advisory, and tax services globally.",
      roles: ["Analyst", "Associate Analyst", "Technology Risk Consultant"],
    },
    {
      name: "Cisco",
      slug: "cisco",
      industry: "Networking & Telecommunications",
      description: "Cisco Systems is an American multinational digital communications technology conglomerate.",
      roles: ["Network Engineer", "Technical Consulting Engineer", "Software Engineer"],
    },
    {
      name: "Accenture",
      slug: "accenture",
      industry: "IT Consulting & Services",
      description: "Accenture is a leading global professional services company specializing in digital, cloud and security.",
      roles: ["Advanced Application Engineering Analyst", "Associate Software Engineer"],
    },
    {
      name: "Infosys",
      slug: "infosys",
      industry: "IT & Business Services",
      description: "Infosys is a global leader in next-generation digital services and consulting.",
      roles: ["Systems Engineer Specialist", "Operations Executive"],
    },
  ];

  const companies: Record<string, any> = {};
  const roles: Record<string, Record<string, any>> = {};

  for (const c of companyData) {
    const comp = await prisma.company.create({
      data: {
        name: c.name,
        slug: c.slug,
        industry: c.industry,
        description: c.description,
      },
    });
    companies[c.slug] = comp;
    roles[c.slug] = {};

    for (const rTitle of c.roles) {
      const rSlug = rTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const r = await prisma.companyRole.create({
        data: {
          title: rTitle,
          slug: rSlug,
          companyId: comp.id,
        },
      });
      roles[c.slug][rSlug] = r;
    }
  }

  // 6. Realistic Approved Experiences (Tagged with isDemo: true)
  // Experience 1: ESDS - System Administrator 2026
  const esdsExp = await prisma.experience.create({
    data: {
      slug: "esds-system-administrator-2026",
      companyId: companies["esds"].id,
      roleId: roles["esds"]["system-administrator"].id,
      userId: studentUser.id,
      collegeId: college.id,
      interviewYear: 2026,
      graduationYear: 2027,
      department: "Information Technology",
      placementType: "CAMPUS",
      result: "SELECTED",
      status: "APPROVED",
      isDemo: true, // Clearly marked as Sample / Demo Experience
      isFeatured: true,
      viewsCount: 142,
      overallExperience: `The ESDS campus recruitment process was rigorous and heavily focused on networking fundamentals, Linux commands, and enterprise IT infrastructure. 

The process kicked off in the morning with an Online Assessment on their custom assessment platform. Out of approximately 180 eligible students, 35 cleared for the Group Discussion round.

The Group Discussion topic was "On-Premise Infrastructure vs Public Cloud: Cost vs Data Sovereignty". The evaluators looked closely at clarity of thought, real technical awareness, and active listening. 18 candidates advanced to the Technical Interview.

The Technical Interview lasted 45 minutes. The interviewer was a senior systems engineer who dug deep into how DNS resolution operates, SSH key negotiation, Linux permission bitmask calculation (chmod 755 vs 644), and troubleshooting network latency issues. Having hands-on Linux virtual machine practice was the deciding factor.

Finally, the HR round verified communication skills, willingness to work in 24x7 rotation shifts (standard for datacenter operations), and long-term career aspirations. By 8 PM, the final selection list of 6 students was declared.`,
      advice: `1. Build a Linux VM on your laptop and stop relying solely on GUI. Practice permissions, process management, and network troubleshooting commands (netstat, ss, curl, dig, traceroute).
2. Deep dive into Computer Networks: Understand the packet flow from typing a URL in the browser to page load (DNS lookup, ARP, TCP handshake, TLS negotiation).
3. Be crystal clear about why you want to work in Datacenter/Infrastructure rather than pure software development.`,
    },
  });

  // Rounds for ESDS
  const esdsOA = await prisma.interviewRound.create({
    data: {
      experienceId: esdsExp.id,
      orderIndex: 1,
      roundType: "ONLINE_ASSESSMENT",
      roundName: "Online Assessment",
      platform: "Company Internal Platform",
      durationMinutes: 75,
      sections: "Aptitude (20 Qs), Technical Networking & OS (30 Qs), Scenario-based IT (10 Qs)",
      difficulty: "MEDIUM",
      description: "Timed online test. Sectional cutoff was strictly applied.",
    },
  });

  const esdsGD = await prisma.interviewRound.create({
    data: {
      experienceId: esdsExp.id,
      orderIndex: 2,
      roundType: "GROUP_DISCUSSION",
      roundName: "Group Discussion",
      durationMinutes: 20,
      difficulty: "MEDIUM",
      description: "Topic: Cloud Migration vs On-Premise Data Centers. Groups of 10 students.",
    },
  });

  const esdsTech = await prisma.interviewRound.create({
    data: {
      experienceId: esdsExp.id,
      orderIndex: 3,
      roundType: "TECHNICAL",
      roundName: "Technical Interview",
      durationMinutes: 45,
      difficulty: "MEDIUM",
      description: "One-on-one round covering OS, Networks, and Linux CLI scenario questions.",
    },
  });

  const esdsHR = await prisma.interviewRound.create({
    data: {
      experienceId: esdsExp.id,
      orderIndex: 4,
      roundType: "HR",
      roundName: "HR & Behavioral Round",
      durationMinutes: 20,
      difficulty: "EASY",
      description: "Discussion on shift rotations, relocation preferences, and company values.",
    },
  });

  // Questions linked to ESDS rounds
  await prisma.experienceQuestion.createMany({
    data: [
      {
        experienceId: esdsExp.id,
        interviewRoundId: esdsTech.id,
        questionId: questions["what-is-dns-and-how-does-resolution-work"].id,
        studentNotes: "Interviewer asked me to draw recursive vs iterative resolution on a piece of paper.",
      },
      {
        experienceId: esdsExp.id,
        interviewRoundId: esdsTech.id,
        questionId: questions["explain-tcp-vs-udp-and-when-to-use-each"].id,
        studentNotes: "Focused on packet headers, sequence numbers, and why DNS uses UDP for queries but TCP for zone transfers.",
      },
      {
        experienceId: esdsExp.id,
        interviewRoundId: esdsTech.id,
        questionId: questions["what-is-ssh-and-how-does-asymmetric-key-authentication-work"].id,
        studentNotes: "Asked how ~/.ssh/authorized_keys works and what happens during diffie-hellman exchange.",
      },
      {
        experienceId: esdsExp.id,
        interviewRoundId: esdsTech.id,
        questionId: questions["explain-linux-permissions-rwx-and-how-chmod-chown-work"].id,
        studentNotes: "Given numerical permission 754 and asked what group permissions were.",
      },
      {
        experienceId: esdsExp.id,
        interviewRoundId: esdsTech.id,
        questionId: questions["what-is-active-directory-and-what-role-does-ldap-play"].id,
        studentNotes: "Basic questions on domain controller, organizational units, and single sign on.",
      },
      {
        experienceId: esdsExp.id,
        interviewRoundId: esdsHR.id,
        questionId: questions["tell-me-about-yourself-and-your-technical-interests"].id,
        studentNotes: "Kept it concise: introduced my academic background, personal lab setup, and internship projects.",
      },
      {
        experienceId: esdsExp.id,
        interviewRoundId: esdsHR.id,
        questionId: questions["are-you-willing-to-relocate-or-work-in-rotating-shifts"].id,
        studentNotes: "Clear yes, explained familiarity with 24x7 SOC/NOC operations.",
      },
    ],
  });

  // Experience 2: TCS - Software Engineer 2026
  const tcsExp = await prisma.experience.create({
    data: {
      slug: "tcs-software-engineer-2026",
      companyId: companies["tcs"].id,
      roleId: roles["tcs"]["software-engineer"].id,
      userId: studentUser.id,
      collegeId: college.id,
      interviewYear: 2026,
      graduationYear: 2026,
      department: "Computer Engineering",
      placementType: "CAMPUS",
      result: "SELECTED",
      status: "APPROVED",
      isDemo: true,
      isFeatured: true,
      viewsCount: 210,
      overallExperience: `TCS National Qualifier Test (NQT) was conducted off-site, and candidates scoring in the top percentile were invited for the Digital interview for Software Engineer.

The interview was a unified panel consisting of one Technical interviewer, one Managerial interviewer, and one HR representative.

The Technical round covered Core Java, Data Structures (Linked list cycle detection, binary search), and DBMS queries involving JOINs and indexing. The panel also questioned me thoroughly on my final year capstone project.

The HR questions checked readiness to work anywhere across India and communication clarity. The overall process was professional and structured.`,
      advice: `Focus heavily on Core CS subjects (DBMS, OS, OOP). For coding, mastering arrays, strings, and linked lists is sufficient for the primary rounds. Ensure you know every line of code in your resume projects.`,
    },
  });

  const tcsOA = await prisma.interviewRound.create({
    data: {
      experienceId: tcsExp.id,
      orderIndex: 1,
      roundType: "ONLINE_ASSESSMENT",
      roundName: "TCS NQT Assessment",
      platform: "TCS iON",
      durationMinutes: 120,
      sections: "Cognitive Skills (Numerical, Verbal, Reasoning) + Advanced Coding (2 problems)",
      difficulty: "MEDIUM",
    },
  });

  const tcsTech = await prisma.interviewRound.create({
    data: {
      experienceId: tcsExp.id,
      orderIndex: 2,
      roundType: "TECHNICAL",
      roundName: "Technical + Managerial Interview",
      durationMinutes: 40,
      difficulty: "MEDIUM",
    },
  });

  const tcsHR = await prisma.interviewRound.create({
    data: {
      experienceId: tcsExp.id,
      orderIndex: 3,
      roundType: "HR",
      roundName: "HR Interview",
      durationMinutes: 15,
      difficulty: "EASY",
    },
  });

  await prisma.experienceQuestion.createMany({
    data: [
      {
        experienceId: tcsExp.id,
        interviewRoundId: tcsTech.id,
        questionId: questions["what-is-dns-and-how-does-resolution-work"].id,
        studentNotes: "Briefly asked when discussing web project deployment.",
      },
      {
        experienceId: tcsExp.id,
        interviewRoundId: tcsTech.id,
        questionId: questions["explain-sql-indexes-clustered-vs-non-clustered"].id,
        studentNotes: "Interviewer asked why searching by indexed ID is O(log N) compared to full table scan.",
      },
      {
        experienceId: tcsExp.id,
        interviewRoundId: tcsTech.id,
        questionId: questions["what-are-acid-properties-in-database-transactions"].id,
        studentNotes: "Asked to give a banking transfer transaction example illustrating atomicity and isolation.",
      },
      {
        experienceId: tcsExp.id,
        interviewRoundId: tcsTech.id,
        questionId: questions["how-do-you-detect-a-loop-in-a-singly-linked-list"].id,
        studentNotes: "Explained fast and slow pointer algorithm and time/space complexity.",
      },
      {
        experienceId: tcsExp.id,
        interviewRoundId: tcsHR.id,
        questionId: questions["why-should-we-hire-you-over-other-candidates"].id,
      },
    ],
  });

  // Experience 3: Deloitte - Analyst 2025
  const deloitteExp = await prisma.experience.create({
    data: {
      slug: "deloitte-analyst-2025",
      companyId: companies["deloitte"].id,
      roleId: roles["deloitte"]["analyst"].id,
      userId: studentUser.id,
      collegeId: college.id,
      interviewYear: 2025,
      graduationYear: 2025,
      department: "Information Technology",
      placementType: "CAMPUS",
      result: "SELECTED",
      status: "APPROVED",
      isDemo: true,
      isFeatured: false,
      viewsCount: 98,
      overallExperience: `Deloitte hiring process was conducted in three stages: Online Assessment on AMCAT, followed by a Technical Interview and a Partner/HR interview.

The technical interview evaluated relational databases, SQL queries, understanding of business logic, and basic cloud/security awareness. The interviewer presented realistic case scenarios such as handling confidential client data and automating reporting.`,
      advice: `Deloitte values a balance of solid technical fundamentals and business acumen. Speak with confidence and articulate your thought process clearly.`,
    },
  });

  const deloitteOA = await prisma.interviewRound.create({
    data: {
      experienceId: deloitteExp.id,
      orderIndex: 1,
      roundType: "ONLINE_ASSESSMENT",
      roundName: "Deloitte Online Test",
      platform: "AMCAT",
      durationMinutes: 90,
      sections: "Quantitative, Logical Reasoning, Verbal, Computer Programming MCQs",
      difficulty: "MEDIUM",
    },
  });

  const deloitteTech = await prisma.interviewRound.create({
    data: {
      experienceId: deloitteExp.id,
      orderIndex: 2,
      roundType: "TECHNICAL",
      roundName: "Technical & Problem Solving Round",
      durationMinutes: 35,
      difficulty: "MEDIUM",
    },
  });

  await prisma.experienceQuestion.createMany({
    data: [
      {
        experienceId: deloitteExp.id,
        interviewRoundId: deloitteTech.id,
        questionId: questions["explain-sql-indexes-clustered-vs-non-clustered"].id,
        studentNotes: "Asked how to optimize a slow running query on a 10 million row database.",
      },
      {
        experienceId: deloitteExp.id,
        interviewRoundId: deloitteTech.id,
        questionId: questions["what-are-acid-properties-in-database-transactions"].id,
      },
      {
        experienceId: deloitteExp.id,
        interviewRoundId: deloitteTech.id,
        questionId: questions["difference-between-process-and-thread-with-memory-layout"].id,
      },
    ],
  });

  // Experience 4: Cisco - Network Engineer 2026
  const ciscoExp = await prisma.experience.create({
    data: {
      slug: "cisco-network-engineer-2026",
      companyId: companies["cisco"].id,
      roleId: roles["cisco"]["network-engineer"].id,
      userId: studentUser.id,
      collegeId: college.id,
      interviewYear: 2026,
      graduationYear: 2026,
      department: "Electronics & Telecommunication",
      placementType: "CAMPUS",
      result: "SELECTED",
      status: "APPROVED",
      isDemo: true,
      isFeatured: true,
      viewsCount: 185,
      overallExperience: `The Cisco interview was heavily focused on networking protocols, routing, switching, and packet-level inspection.

Rounds included an Online Assessment on HackerRank with networking MCQs and Python scripting, followed by two technical interviews and an HR discussion.

In the technical rounds, I was asked to calculate subnet masks on the fly, explain OSI layers in detail, explain packet flow through switches and routers, and discuss TCP windowing and congestion control.`,
      advice: `Read Kurose & Ross or Tanenbaum thoroughly. Practice subnetting calculations until you can do them in under 30 seconds.`,
    },
  });

  const ciscoOA = await prisma.interviewRound.create({
    data: {
      experienceId: ciscoExp.id,
      orderIndex: 1,
      roundType: "ONLINE_ASSESSMENT",
      roundName: "Cisco Technical Assessment",
      platform: "HackerRank",
      durationMinutes: 90,
      sections: "Networking MCQs, OS concepts, 2 Python/C++ automation scripts",
      difficulty: "HARD",
    },
  });

  const ciscoTech1 = await prisma.interviewRound.create({
    data: {
      experienceId: ciscoExp.id,
      orderIndex: 2,
      roundType: "TECHNICAL",
      roundName: "Technical Round 1 — Core Networking",
      durationMinutes: 60,
      difficulty: "HARD",
    },
  });

  await prisma.experienceQuestion.createMany({
    data: [
      {
        experienceId: ciscoExp.id,
        interviewRoundId: ciscoTech1.id,
        questionId: questions["what-is-dns-and-how-does-resolution-work"].id,
      },
      {
        experienceId: ciscoExp.id,
        interviewRoundId: ciscoTech1.id,
        questionId: questions["explain-tcp-vs-udp-and-when-to-use-each"].id,
      },
      {
        experienceId: ciscoExp.id,
        interviewRoundId: ciscoTech1.id,
        questionId: questions["explain-osi-7-layer-model-and-switches-vs-routers"].id,
        studentNotes: "Went into header encapsulation and MAC address table lookup vs IP routing table lookup.",
      },
      {
        experienceId: ciscoExp.id,
        interviewRoundId: ciscoTech1.id,
        questionId: questions["what-is-a-subnet-mask-and-how-does-cidr-notation-work"].id,
        studentNotes: "Given /27 subnet and asked to calculate valid host IPs and broadcast address.",
      },
    ],
  });

  // Experience 5: Infosys - Systems Engineer Specialist 2025
  const infosysExp = await prisma.experience.create({
    data: {
      slug: "infosys-systems-engineer-specialist-2025",
      companyId: companies["infosys"].id,
      roleId: roles["infosys"]["systems-engineer-specialist"].id,
      userId: studentUser.id,
      collegeId: college.id,
      interviewYear: 2025,
      graduationYear: 2025,
      department: "Computer Engineering",
      placementType: "CAMPUS",
      result: "SELECTED",
      status: "APPROVED",
      isDemo: true,
      isFeatured: false,
      viewsCount: 76,
      overallExperience: `Infosys HackWithInfy finalist interview for the Specialist Software Engineer track.

The interview was purely technical: dynamic programming problem discussion, OS memory management, and database concurrency controls.`,
      advice: `For the Specialist role, standard questions will not suffice. Be ready for dynamic programming and graphs.`,
    },
  });

  const infosysTech = await prisma.interviewRound.create({
    data: {
      experienceId: infosysExp.id,
      orderIndex: 1,
      roundType: "TECHNICAL",
      roundName: "Specialist Technical Round",
      durationMinutes: 45,
      difficulty: "HARD",
    },
  });

  await prisma.experienceQuestion.createMany({
    data: [
      {
        experienceId: infosysExp.id,
        interviewRoundId: infosysTech.id,
        questionId: questions["what-is-dns-and-how-does-resolution-work"].id,
      },
      {
        experienceId: infosysExp.id,
        interviewRoundId: infosysTech.id,
        questionId: questions["difference-between-process-and-thread-with-memory-layout"].id,
      },
      {
        experienceId: infosysExp.id,
        interviewRoundId: infosysTech.id,
        questionId: questions["what-is-virtual-memory-and-page-fault-handling"].id,
      },
    ],
  });

  // Experience 6: Accenture - Advanced Application Engineering Analyst 2026
  const accentureExp = await prisma.experience.create({
    data: {
      slug: "accenture-advanced-application-engineering-analyst-2026",
      companyId: companies["accenture"].id,
      roleId: roles["accenture"]["advanced-application-engineering-analyst"].id,
      userId: studentUser.id,
      collegeId: college.id,
      interviewYear: 2026,
      graduationYear: 2026,
      department: "Information Technology",
      placementType: "CAMPUS",
      result: "SELECTED",
      status: "APPROVED",
      isDemo: true,
      isFeatured: false,
      viewsCount: 112,
      overallExperience: `Accenture recruitment had Cognitive Assessment, Technical Assessment (coding & pseudocode), Communication Assessment, and an Interview round.

The interview combined technical project questions with behavioral assessment. Questions were asked about web application deployment, API integration, and team problem-solving.`,
      advice: `Do not ignore the pseudocode section in the test. In the interview, explain your projects clearly.`,
    },
  });

  const accTech = await prisma.interviewRound.create({
    data: {
      experienceId: accentureExp.id,
      orderIndex: 1,
      roundType: "TECHNICAL",
      roundName: "Technical & Behavioral Interview",
      durationMinutes: 30,
      difficulty: "MEDIUM",
    },
  });

  await prisma.experienceQuestion.createMany({
    data: [
      {
        experienceId: accentureExp.id,
        interviewRoundId: accTech.id,
        questionId: questions["explain-sql-indexes-clustered-vs-non-clustered"].id,
      },
      {
        experienceId: accentureExp.id,
        interviewRoundId: accTech.id,
        questionId: questions["what-are-acid-properties-in-database-transactions"].id,
      },
      {
        experienceId: accentureExp.id,
        interviewRoundId: accTech.id,
        questionId: questions["tell-me-about-yourself-and-your-technical-interests"].id,
      },
    ],
  });

  // 7. Seed 1 PENDING experience (for Admin moderation testing)
  await prisma.experience.create({
    data: {
      slug: "esds-cloud-support-engineer-pending-2026",
      companyId: companies["esds"].id,
      roleId: roles["esds"]["cloud-support-engineer"].id,
      userId: studentUser.id,
      collegeId: college.id,
      interviewYear: 2026,
      graduationYear: 2027,
      department: "Information Technology",
      placementType: "CAMPUS",
      result: "SELECTED",
      status: "PENDING", // PENDING - should NOT appear in public lists
      isDemo: true,
      overallExperience: "Attended interview for Cloud Support Engineer. Focused on AWS EC2, Linux bash scripting, and DNS records.",
      advice: "Know common HTTP response codes (4xx, 5xx) and DNS record types (A, CNAME, MX).",
    },
  });

  // 8. Seed 1 DRAFT experience (for student draft resume testing)
  await prisma.experience.create({
    data: {
      slug: "cisco-software-engineer-draft-2026",
      companyId: companies["cisco"].id,
      roleId: roles["cisco"]["software-engineer"].id,
      userId: studentUser.id,
      collegeId: college.id,
      interviewYear: 2026,
      graduationYear: 2027,
      department: "Information Technology",
      placementType: "CAMPUS",
      result: "PENDING",
      status: "DRAFT", // DRAFT - should NOT appear in public lists
      isDemo: true,
      overallExperience: "Work in progress draft of Cisco interview experience...",
      advice: "Work in progress...",
    },
  });

  // 9. Seed 1 Sample Report (for Admin moderation queue)
  await prisma.report.create({
    data: {
      reporterId: studentUser.id,
      questionId: questions["what-is-dns-and-how-does-resolution-work"].id,
      reason: "Incorrect information",
      details: "Could we clarify recursive vs iterative lookup in the prompt notes?",
      status: "PENDING",
    },
  });

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
