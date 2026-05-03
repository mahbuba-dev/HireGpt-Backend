import { prisma } from "../src/lib/prisma";

type RegionKey = "northAmerica" | "southAsia" | "europe" | "mena";

const REGION_NAME_POOLS: Record<
  RegionKey,
  { firstNames: readonly string[]; lastNames: readonly string[] }
> = {
  northAmerica: {
    firstNames: ["Olivia", "Ethan", "Sophia", "Noah", "Amelia", "Liam", "Ava", "Mason", "Mia", "Elijah"] as const,
    lastNames: ["Morgan", "Turner", "Carter", "Bennett", "Brooks", "Collins", "Parker", "Bailey", "Watson", "Reed"] as const,
  },
  southAsia: {
    firstNames: ["Aarav", "Anika", "Ishaan", "Meera", "Arjun", "Priya", "Rahul", "Neha", "Karan", "Riya"] as const,
    lastNames: ["Patel", "Sharma", "Khan", "Singh", "Das", "Gupta", "Nair", "Malik", "Rao", "Chowdhury"] as const,
  },
  europe: {
    firstNames: ["Lucas", "Emma", "Hugo", "Nora", "Leo", "Anna", "Mateo", "Elena", "Daniel", "Sofia"] as const,
    lastNames: ["Rossi", "Muller", "Dubois", "Nowak", "Andersson", "Costa", "Silva", "Kovac", "Fischer", "Novak"] as const,
  },
  mena: {
    firstNames: ["Omar", "Layla", "Yousef", "Nour", "Karim", "Mariam", "Hassan", "Salma", "Tariq", "Dina"] as const,
    lastNames: ["Haddad", "Farouk", "Rahman", "Khalil", "Nasser", "Hamdan", "Sharif", "Saad", "Mansour", "Aziz"] as const,
  },
};

const INDUSTRY_REGION_HINTS: Array<{ keywords: string[]; region: RegionKey }> = [
  { keywords: ["software", "engineering", "data", "technology", "it"], region: "northAmerica" },
  { keywords: ["marketing", "sales", "brand", "media"], region: "europe" },
  { keywords: ["finance", "account", "tax", "investment"], region: "southAsia" },
  { keywords: ["operations", "supply", "manufact", "logistics"], region: "mena" },
];

const normalizeIndustryName = (industryName?: string) =>
  String(industryName ?? "")
    .toLowerCase()
    .replace(/\s+\d+$/, "")
    .trim();

const resolveRegionFromIndustry = (industryName?: string): RegionKey => {
  const normalized = normalizeIndustryName(industryName);
  const match = INDUSTRY_REGION_HINTS.find((entry) =>
    entry.keywords.some((keyword) => normalized.includes(keyword))
  );
  return match?.region ?? "northAmerica";
};

const buildUniqueExpertName = (index: number, industryName?: string) => {
  const region = resolveRegionFromIndustry(industryName);
  const pool = REGION_NAME_POOLS[region];
  const first = pool.firstNames[index % pool.firstNames.length];
  const last = pool.lastNames[
    Math.floor(index / pool.firstNames.length) % pool.lastNames.length
  ];

  return `${first} ${last}`;
};

const buildProfessionalHeadshot = (index: number) => {
  const collection = index % 2 === 0 ? "men" : "women";
  const photoId = (index * 17 + 11) % 90;
  return `https://randomuser.me/api/portraits/${collection}/${photoId}.jpg`;
};

const cleanIndustryLabel = (industryName?: string) =>
  String(industryName ?? "Business")
    .replace(/\s+\d+$/, "")
    .trim() || "Business";

const TITLE_PREFIXES = [
  "Principal Consultant",
  "Fractional Advisor",
  "Strategy Lead",
  "Senior Specialist",
  "Execution Partner",
] as const;

const BIO_IMPACT_PHRASES = [
  "improving conversion quality",
  "reducing execution bottlenecks",
  "tightening operating rhythm",
  "accelerating delivery outcomes",
  "raising decision confidence",
] as const;

const buildProfessionalTitle = (index: number, industryName?: string) => {
  const industry = cleanIndustryLabel(industryName);
  const prefix = TITLE_PREFIXES[index % TITLE_PREFIXES.length];
  return `${prefix}, ${industry}`;
};

const buildProfessionalBio = (index: number, industryName?: string, experience?: number) => {
  const industry = cleanIndustryLabel(industryName);
  const years = Math.max(4, Math.min(20, experience ?? 6 + (index % 10)));
  const impact = BIO_IMPACT_PHRASES[index % BIO_IMPACT_PHRASES.length];

  return `I advise clients in ${industry.toLowerCase()} on strategy and execution, with ${years}+ years of hands-on leadership experience. Recent engagements focused on ${impact} through practical playbooks and measurable milestones.`;
};

const run = async () => {
  const seededExperts = await prisma.expert.findMany({
    where: {
      email: {
        endsWith: "@consultedge.test",
      },
      isDeleted: false,
    },
    select: {
      id: true,
      userId: true,
      email: true,
      experience: true,
      industry: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  if (seededExperts.length === 0) {
    console.log("No seeded experts found to refresh.");
    return;
  }

  for (let i = 0; i < seededExperts.length; i += 1) {
    const expert = seededExperts[i];
    const fullName = buildUniqueExpertName(i, expert.industry?.name);
    const profilePhoto = buildProfessionalHeadshot(i);
    const title = buildProfessionalTitle(i, expert.industry?.name);
    const bio = buildProfessionalBio(i, expert.industry?.name, expert.experience);

    await prisma.$transaction([
      prisma.expert.update({
        where: { id: expert.id },
        data: {
          fullName,
          profilePhoto,
          title,
          bio,
          isSeeded: true,
        },
      }),
      prisma.user.update({
        where: { id: expert.userId },
        data: {
          name: fullName,
          image: profilePhoto,
        },
      }),
    ]);
  }

  console.log(`Refreshed ${seededExperts.length} seeded experts with professional names, photos, and varied bios.`);
};

run()
  .catch((error) => {
    console.error("Failed to refresh seeded experts", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
