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

const CLIENT_FALLBACK_INITIALS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

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

const buildProfessionalClientName = (index: number, industryName?: string) => {
  const region = resolveRegionFromIndustry(industryName);
  const pool = REGION_NAME_POOLS[region];

  const combinations = pool.firstNames.length * pool.lastNames.length;
  const scopedIndex = index % combinations;

  const first = pool.firstNames[scopedIndex % pool.firstNames.length];
  const last = pool.lastNames[
    Math.floor(scopedIndex / pool.firstNames.length) % pool.lastNames.length
  ];

  const cycle = Math.floor(index / combinations);

  if (cycle > 0) {
    const initial = CLIENT_FALLBACK_INITIALS[(cycle - 1) % CLIENT_FALLBACK_INITIALS.length];
    return `${first} ${last} ${initial}.`;
  }

  return `${first} ${last}`;
};

const buildProfessionalHeadshot = (index: number) => {
  const collection = index % 2 === 0 ? "women" : "men";
  const photoId = (index * 19 + 7) % 90;
  return `https://randomuser.me/api/portraits/${collection}/${photoId}.jpg`;
};

const run = async () => {
  const reviewClients = await prisma.client.findMany({
    where: {
      email: {
        endsWith: "@consultedge.test",
      },
      isDeleted: false,
      testimonials: {
        some: {},
      },
    },
    select: {
      id: true,
      userId: true,
      testimonials: {
        orderBy: {
          createdAt: "asc",
        },
        take: 1,
        select: {
          expert: {
            select: {
              industry: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  if (reviewClients.length === 0) {
    console.log("No seeded review clients found to refresh.");
    return;
  }

  const usedNames = new Set<string>();

  for (let i = 0; i < reviewClients.length; i += 1) {
    const client = reviewClients[i];
    const industryName = client.testimonials[0]?.expert.industry?.name;

    let fullName = buildProfessionalClientName(i, industryName);
    let salt = 1;
    while (usedNames.has(fullName.toLowerCase())) {
      fullName = buildProfessionalClientName(i + salt * 97, industryName);
      salt += 1;
    }
    usedNames.add(fullName.toLowerCase());

    const profilePhoto = buildProfessionalHeadshot(i + 500);

    await prisma.$transaction([
      prisma.client.update({
        where: { id: client.id },
        data: {
          fullName,
          profilePhoto,
        },
      }),
      prisma.user.update({
        where: { id: client.userId },
        data: {
          name: fullName,
          image: profilePhoto,
        },
      }),
    ]);
  }

  console.log(`Refreshed ${reviewClients.length} seeded review clients with professional names.`);
};

run()
  .catch((error) => {
    console.error("Failed to refresh seeded review clients", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
