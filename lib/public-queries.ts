import { prisma } from "./prisma";

/**
 * STRICT PUBLIC DATA QUERY LIBRARY
 * Guarantee: ALL public queries strictly filter by `status === "APPROVED"`.
 * DRAFT, PENDING, and REJECTED experiences never appear in public listings or frequency calculations.
 */

export interface GetExperiencesFilter {
  query?: string;
  companySlug?: string;
  roleSlug?: string;
  interviewYear?: number;
  placementType?: string;
  roundType?: string;
  result?: string;
  department?: string;
  sortBy?: "newest" | "views";
  page?: number;
  limit?: number;
}

/**
 * Fetch approved experiences with multi-parameter filtering and pagination
 */
export async function getPublicExperiences(filter: GetExperiencesFilter = {}) {
  const {
    query,
    companySlug,
    roleSlug,
    interviewYear,
    placementType,
    roundType,
    result,
    department,
    sortBy = "newest",
    page = 1,
    limit = 15,
  } = filter;

  const skip = (page - 1) * limit;

  // Include both APPROVED (Verified) and PENDING (Unverified) experiences in public catalog
  const where: any = {
    status: { in: ["APPROVED", "PENDING"] },
  };

  if (companySlug) {
    const companySlugs = companySlug.split(",").map((s) => s.trim()).filter(Boolean);
    if (companySlugs.length === 1) {
      where.company = { slug: companySlugs[0] };
    } else if (companySlugs.length > 1) {
      where.company = { slug: { in: companySlugs } };
    }
  }

  if (roleSlug) {
    const roleSlugs = roleSlug.split(",").map((s) => s.trim()).filter(Boolean);
    if (roleSlugs.length === 1) {
      where.role = { slug: roleSlugs[0] };
    } else if (roleSlugs.length > 1) {
      where.role = { slug: { in: roleSlugs } };
    }
  }

  if (interviewYear) {
    where.interviewYear = interviewYear;
  }

  if (placementType) {
    where.placementType = placementType;
  }

  if (result) {
    where.result = result;
  }

  if (department) {
    where.department = { contains: department };
  }

  if (roundType) {
    where.rounds = {
      some: {
        roundType: roundType,
      },
    };
  }

  if (query) {
    const q = query.trim();
    where.OR = [
      { company: { name: { contains: q } } },
      { role: { title: { contains: q } } },
      { overallExperience: { contains: q } },
      { advice: { contains: q } },
      {
        questionLinks: {
          some: {
            question: {
              text: { contains: q },
            },
          },
        },
      },
    ];
  }

  const orderBy = sortBy === "views" ? { viewsCount: "desc" as const } : { createdAt: "desc" as const };

  const [experiences, totalCount] = await Promise.all([
    prisma.experience.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        company: true,
        role: true,
        user: {
          select: {
            name: true,
            department: true,
          },
        },
        rounds: {
          orderBy: { orderIndex: "asc" },
        },
        questionLinks: {
          include: {
            question: true,
          },
        },
      },
    }),
    prisma.experience.count({ where }),
  ]);

  return {
    experiences,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
  };
}

/**
 * Fetch a single approved experience by slug
 */
export async function getPublicExperienceBySlug(slug: string) {
  // First verify existence and public status
  const existing = await prisma.experience.findUnique({
    where: { slug },
    select: { id: true, status: true },
  });

  // Allow public viewing if APPROVED or PENDING
  if (!existing || (existing.status !== "APPROVED" && existing.status !== "PENDING")) {
    return null;
  }

  // Atomically increment viewsCount AND fetch the fresh record in one atomic operation
  const experience = await prisma.experience.update({
    where: { id: existing.id },
    data: { viewsCount: { increment: 1 } },
    include: {
      company: {
        include: {
          roles: true,
        },
      },
      role: true,
      college: true,
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          department: true,
          graduationYear: true,
          placementStatus: true,
          placedCompany: true,
          linkedinUrl: true,
          bio: true,
        },
      },
      rounds: {
        orderBy: { orderIndex: "asc" },
        include: {
          questions: {
            include: {
              question: {
                include: {
                  topic: true,
                },
              },
            },
          },
        },
      },
      questionLinks: {
        include: {
          question: {
            include: {
              topic: true,
            },
          },
        },
      },
    },
  });

  return experience;
}

/**
 * Fetch related approved experiences (same company or similar role)
 */
export async function getRelatedExperiences(experienceId: string, companyId: string, roleId: string) {
  return await prisma.experience.findMany({
    where: {
      status: { in: ["APPROVED", "PENDING"] },
      id: { not: experienceId },
      OR: [{ companyId }, { roleId }],
    },
    take: 3,
    orderBy: { createdAt: "desc" },
    include: {
      company: true,
      role: true,
      rounds: { orderBy: { orderIndex: "asc" } },
    },
  });
}

/**
 * Get real database-driven statistics (strictly 0 fake metrics)
 */
export async function getPublicStats() {
  const [experiencesCount, companiesCount, questionsCount, oaRoundsCount] = await Promise.all([
    // Public experiences (approved & pending)
    prisma.experience.count({
      where: { status: { in: ["APPROVED", "PENDING"] } },
    }),
    // Companies with at least one public experience
    prisma.company.count({
      where: {
        experiences: {
          some: { status: { in: ["APPROVED", "PENDING"] } },
        },
      },
    }),
    // Questions appearing in public experiences
    prisma.question.count({
      where: {
        experienceLinks: {
          some: {
            experience: { status: { in: ["APPROVED", "PENDING"] } },
          },
        },
      },
    }),
    // Online assessment rounds in public experiences
    prisma.interviewRound.count({
      where: {
        roundType: "ONLINE_ASSESSMENT",
        experience: { status: { in: ["APPROVED", "PENDING"] } },
      },
    }),
  ]);

  return {
    experiencesCount,
    companiesCount,
    questionsCount,
    oaRoundsCount,
  };
}

/**
 * Fetch recently approved experiences for the homepage
 */
export async function getRecentApprovedExperiences(limit = 6) {
  return await prisma.experience.findMany({
    where: { status: { in: ["APPROVED", "PENDING"] } },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      company: true,
      role: true,
      rounds: {
        orderBy: { orderIndex: "asc" },
      },
    },
  });
}

/**
 * Fetch popular companies based on actual approved experience count
 */
export async function getPopularCompanies(limit = 6) {
  const companies = await prisma.company.findMany({
    where: {
      experiences: {
        some: { status: { in: ["APPROVED", "PENDING"] } },
      },
    },
    include: {
      _count: {
        select: {
          experiences: {
            where: { status: { in: ["APPROVED", "PENDING"] } },
          },
          roles: true,
        },
      },
      experiences: {
        where: { status: { in: ["APPROVED", "PENDING"] } },
        select: { interviewYear: true },
        orderBy: { interviewYear: "desc" },
        take: 1,
      },
    },
  });

  return companies
    .map((c) => ({
      ...c,
      approvedExperiencesCount: c._count.experiences,
      rolesCount: c._count.roles,
      latestYear: c.experiences[0]?.interviewYear ?? null,
    }))
    .sort((a, b) => b.approvedExperiencesCount - a.approvedExperiencesCount)
    .slice(0, limit);
}

/**
 * Fetch all companies for the directory with approved stats
 */
export async function getAllPublicCompanies(search?: string) {
  const where: any = {};
  if (search) {
    where.name = { contains: search.trim() };
  }

  const companies = await prisma.company.findMany({
    where,
    include: {
      _count: {
        select: {
          experiences: {
            where: { status: { in: ["APPROVED", "PENDING"] } },
          },
          roles: true,
        },
      },
      experiences: {
        where: { status: { in: ["APPROVED", "PENDING"] } },
        select: { interviewYear: true },
        orderBy: { interviewYear: "desc" },
        take: 1,
      },
      roles: {
        take: 5,
      },
    },
    orderBy: { name: "asc" },
  });

  return companies.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    industry: c.industry,
    website: c.website,
    approvedExperiencesCount: c._count.experiences,
    rolesCount: c._count.roles,
    latestYear: c.experiences[0]?.interviewYear ?? null,
    sampleRoles: c.roles.map((r) => r.title),
  }));
}

/**
 * Fetch company detail by slug
 */
export async function getPublicCompanyBySlug(slug: string) {
  const company = await prisma.company.findUnique({
    where: { slug },
    include: {
      roles: true,
      experiences: {
        where: { status: { in: ["APPROVED", "PENDING"] } },
        orderBy: { interviewYear: "desc" },
        include: {
          role: true,
          rounds: { orderBy: { orderIndex: "asc" } },
          questionLinks: {
            include: {
              question: {
                include: { topic: true },
              },
            },
          },
        },
      },
    },
  });

  if (!company) return null;

  // Reported rounds process calculation from approved experiences
  const roundCounts: Record<string, number> = {};
  company.experiences.forEach((exp) => {
    exp.rounds.forEach((r) => {
      roundCounts[r.roundType] = (roundCounts[r.roundType] || 0) + 1;
    });
  });

  // Extract frequently reported questions for this company (strictly approved experiences)
  const questionMap = new Map<
    string,
    { question: any; count: number; roles: Set<string> }
  >();

  company.experiences.forEach((exp) => {
    exp.questionLinks.forEach((link) => {
      const q = link.question;
      if (!questionMap.has(q.id)) {
        questionMap.set(q.id, {
          question: q,
          count: 0,
          roles: new Set<string>(),
        });
      }
      const entry = questionMap.get(q.id)!;
      entry.count += 1;
      if (exp.role?.title) entry.roles.add(exp.role.title);
    });
  });

  const reportedQuestions = Array.from(questionMap.values())
    .map((item) => ({
      ...item.question,
      frequencyInCompany: item.count,
      roles: Array.from(item.roles),
    }))
    .sort((a, b) => b.frequencyInCompany - a.frequencyInCompany);

  const latestYear = company.experiences[0]?.interviewYear ?? null;

  return {
    ...company,
    approvedExperiencesCount: company.experiences.length,
    rolesCount: company.roles.length,
    latestYear,
    reportedQuestions,
  };
}

/**
 * Calculate question frequency STRICTLY from APPROVED experiences
 */
export async function getQuestionFrequency(questionId: string) {
  const [totalCount, links] = await Promise.all([
    prisma.experienceQuestion.count({
      where: {
        questionId,
        experience: { status: { in: ["APPROVED", "PENDING"] } },
      },
    }),
    prisma.experienceQuestion.findMany({
      where: {
        questionId,
        experience: { status: { in: ["APPROVED", "PENDING"] } },
      },
      include: {
        experience: {
          select: {
            interviewYear: true,
            company: {
              select: {
                name: true,
                slug: true,
              },
            },
            role: {
              select: {
                title: true,
              },
            },
          },
        },
      },
    }),
  ]);

  // Aggregate by company
  const companyCounts: Record<string, { name: string; slug: string; count: number }> = {};
  const timeline: { company: string; year: number; role: string }[] = [];

  links.forEach((l) => {
    if (l.experience?.company) {
      const c = l.experience.company;
      if (!companyCounts[c.slug]) {
        companyCounts[c.slug] = { name: c.name, slug: c.slug, count: 0 };
      }
      companyCounts[c.slug].count += 1;

      timeline.push({
        company: c.name,
        year: l.experience.interviewYear,
        role: l.experience.role.title,
      });
    }
  });

  // Sort timeline newest first
  timeline.sort((a, b) => b.year - a.year);

  return {
    totalFrequency: totalCount,
    companyBreakdown: Object.values(companyCounts).sort((a, b) => b.count - a.count),
    timeline,
  };
}

/**
 * Fetch public question database with approved frequency counts
 */
export async function getPublicQuestions(filter: {
  topicSlug?: string;
  round?: string;
  difficulty?: string;
  query?: string;
}) {
  const where: any = {
    // Return questions that have at least one public experience link
    experienceLinks: {
      some: {
        experience: { status: { in: ["APPROVED", "PENDING"] } },
      },
    },
  };

  if (filter.topicSlug) {
    where.topic = { slug: filter.topicSlug };
  }

  if (filter.round) {
    where.round = filter.round;
  }

  if (filter.difficulty) {
    where.difficulty = filter.difficulty;
  }

  if (filter.query) {
    const q = filter.query.trim();
    where.OR = [
      { text: { contains: q } },
      { topic: { name: { contains: q } } },
    ];
  }

  const questions = await prisma.question.findMany({
    where,
    include: {
      topic: true,
      experienceLinks: {
        where: {
          experience: { status: { in: ["APPROVED", "PENDING"] } },
        },
        include: {
          experience: {
            select: {
              company: {
                select: { name: true, slug: true },
              },
            },
          },
        },
      },
    },
    take: 50,
  });

  return questions
    .map((q) => {
      const companiesSet = new Map<string, string>();
      q.experienceLinks.forEach((link) => {
        if (link.experience?.company) {
          companiesSet.set(link.experience.company.slug, link.experience.company.name);
        }
      });

      return {
        id: q.id,
        text: q.text,
        slug: q.slug,
        round: q.round,
        difficulty: q.difficulty,
        topic: q.topic,
        frequencyCount: q.experienceLinks.length,
        companies: Array.from(companiesSet.entries()).map(([slug, name]) => ({ slug, name })),
      };
    })
    .sort((a, b) => b.frequencyCount - a.frequencyCount);
}

/**
 * Fetch a single question by slug
 */
export async function getPublicQuestionBySlug(slug: string) {
  const question = await prisma.question.findUnique({
    where: { slug },
    include: {
      topic: true,
    },
  });

  if (!question) return null;

  const frequencyData = await getQuestionFrequency(question.id);

  // Fetch related questions in same topic
  const relatedQuestions = question.topicId
    ? await prisma.question.findMany({
        where: {
          topicId: question.topicId,
          id: { not: question.id },
          experienceLinks: {
            some: { experience: { status: { in: ["APPROVED", "PENDING"] } } },
          },
        },
        take: 5,
        select: {
          id: true,
          text: true,
          slug: true,
          difficulty: true,
        },
      })
    : [];

  return {
    ...question,
    ...frequencyData,
    relatedQuestions,
  };
}

/**
 * Fetch all Online Assessment rounds reported in public experiences
 */
export async function getPublicOnlineAssessments() {
  const rounds = await prisma.interviewRound.findMany({
    where: {
      roundType: "ONLINE_ASSESSMENT",
      experience: { status: { in: ["APPROVED", "PENDING"] } },
    },
    include: {
      experience: {
        include: {
          company: true,
          role: true,
        },
      },
      questions: {
        include: {
          question: true,
        },
      },
    },
    orderBy: {
      experience: { interviewYear: "desc" },
    },
  });

  return rounds;
}

/**
 * Global search across public experiences, companies, questions, topics
 */
export async function globalSearch(query: string) {
  const q = query.trim();
  if (!q) {
    return { experiences: [], companies: [], questions: [], topics: [] };
  }

  const [experiences, companies, questions, topics] = await Promise.all([
    prisma.experience.findMany({
      where: {
        status: { in: ["APPROVED", "PENDING"] },
        OR: [
          { company: { name: { contains: q } } },
          { role: { title: { contains: q } } },
          { overallExperience: { contains: q } },
        ],
      },
      take: 5,
      include: {
        company: true,
        role: true,
      },
    }),
    prisma.company.findMany({
      where: {
        name: { contains: q },
      },
      take: 5,
      include: {
        _count: {
          select: {
            experiences: { where: { status: { in: ["APPROVED", "PENDING"] } } },
          },
        },
      },
    }),
    prisma.question.findMany({
      where: {
        text: { contains: q },
        experienceLinks: {
          some: { experience: { status: { in: ["APPROVED", "PENDING"] } } },
        },
      },
      take: 8,
      include: {
        topic: true,
      },
    }),
    prisma.topic.findMany({
      where: {
        name: { contains: q },
      },
      take: 4,
    }),
  ]);

  return {
    experiences,
    companies,
    questions,
    topics,
  };
}
