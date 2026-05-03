import { prisma } from "../src/lib/prisma";

const CURATED_INDUSTRIES: Array<{ name: string; description: string; icon: string }> = [
  {
    name: "Entrepreneurs",
    description: "Turn bold ideas into executable strategies with guidance from proven business leaders.",
    icon: "https://api.iconify.design/lucide:lightbulb.svg?color=%230ea5e9",
  },
  {
    name: "Small Business Owners",
    description: "Get practical, actionable advice on operations, growth, and scaling your business.",
    icon: "https://api.iconify.design/lucide:building-2.svg?color=%232563eb",
  },
  {
    name: "Startup Founders",
    description: "Move faster with investor-ready insights, product strategy, and go-to-market expertise.",
    icon: "https://api.iconify.design/lucide:rocket.svg?color=%2314b8a6",
  },
  {
    name: "Students & Career Seekers",
    description: "Get mentorship on internships, career pivots, and navigating competitive industries.",
    icon: "https://api.iconify.design/lucide:book-open.svg?color=%234f46e5",
  },
  {
    name: "Working Professionals",
    description: "Access senior experts for quick, high-value answers to complex professional challenges.",
    icon: "https://api.iconify.design/lucide:briefcase.svg?color=%2310b981",
  },
  {
    name: "Anyone Seeking Expertise",
    description: "Whatever your question, find a verified professional who can answer it with clarity.",
    icon: "https://api.iconify.design/lucide:zap.svg?color=%23f97316",
  },
  {
    name: "Investors & Advisors",
    description: "Validate decisions with sector specialists before committing capital or making strategic moves.",
    icon: "https://api.iconify.design/lucide:shield-check.svg?color=%23a855f7",
  },
  {
    name: "Teams & Agencies",
    description: "Plug in expert reviewers and on-demand mentors to ship faster and raise the bar on every deliverable.",
    icon: "https://api.iconify.design/lucide:users.svg?color=%230ea5a4",
  },
  {
    name: "Corporate Leaders",
    description: "Get executive-level guidance on transformation, governance, and cross-functional alignment.",
    icon: "https://api.iconify.design/lucide:landmark.svg?color=%230ea5e9",
  },
  {
    name: "Product Managers",
    description: "Refine roadmaps, prioritize outcomes, and accelerate product-market fit.",
    icon: "https://api.iconify.design/lucide:layout-panel-top.svg?color=%232563eb",
  },
  {
    name: "Technical Teams",
    description: "Solve architecture, performance, and delivery bottlenecks with specialist support.",
    icon: "https://api.iconify.design/lucide:code-2.svg?color=%2314b8a6",
  },
  {
    name: "Marketing Leaders",
    description: "Improve acquisition efficiency, positioning, and campaign ROI.",
    icon: "https://api.iconify.design/lucide:megaphone.svg?color=%234f46e5",
  },
  {
    name: "Sales Leaders",
    description: "Strengthen pipeline quality, conversion strategy, and revenue operations.",
    icon: "https://api.iconify.design/lucide:handshake.svg?color=%2310b981",
  },
  {
    name: "HR & Talent Teams",
    description: "Design hiring systems, leadership pipelines, and people operations.",
    icon: "https://api.iconify.design/lucide:user-round-check.svg?color=%23f97316",
  },
  {
    name: "Freelancers & Consultants",
    description: "Sharpen offers, improve client outcomes, and scale your personal brand.",
    icon: "https://api.iconify.design/lucide:badge-check.svg?color=%23a855f7",
  },
  {
    name: "Nonprofit Leaders",
    description: "Advance mission impact with stronger strategy, partnerships, and execution support.",
    icon: "https://api.iconify.design/lucide:heart-handshake.svg?color=%230ea5a4",
  },
  {
    name: "Operations Managers",
    description: "Optimize process, systems, and team performance across core workflows.",
    icon: "https://api.iconify.design/lucide:settings-2.svg?color=%230ea5e9",
  },
  {
    name: "Finance & Strategy Teams",
    description: "Model scenarios, assess risk, and make sharper strategic decisions.",
    icon: "https://api.iconify.design/lucide:chart-column.svg?color=%232563eb",
  },
  {
    name: "Creators & Coaches",
    description: "Build sustainable growth engines around your content, programs, and audience.",
    icon: "https://api.iconify.design/lucide:sparkles.svg?color=%2314b8a6",
  },
  {
    name: "Career Switchers",
    description: "Plan and execute confident transitions into high-growth roles and sectors.",
    icon: "https://api.iconify.design/lucide:compass.svg?color=%234f46e5",
  },
];

const run = async () => {
  const seededIndustryIds = await prisma.expert.findMany({
    where: {
      email: {
        endsWith: "@consultedge.test",
      },
      isDeleted: false,
    },
    select: {
      industryId: true,
    },
    distinct: ["industryId"],
  });

  if (seededIndustryIds.length === 0) {
    console.log("No seeded industries found to refresh.");
    return;
  }

  const industryIdSet = new Set(seededIndustryIds.map((row) => row.industryId));

  const industries = await prisma.industry.findMany({
    where: {
      id: {
        in: Array.from(industryIdSet),
      },
      isDeleted: false,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const targetCount = Math.min(industries.length, CURATED_INDUSTRIES.length);

  for (let i = 0; i < targetCount; i += 1) {
    const current = industries[i];
    const next = CURATED_INDUSTRIES[i];

    await prisma.industry.update({
      where: { id: current.id },
      data: {
        name: next.name,
        description: next.description,
        icon: next.icon,
      },
    });
  }

  console.log(`Refreshed ${targetCount} seeded industries with curated names and icons.`);
};

run()
  .catch((error) => {
    console.error("Failed to refresh seeded industries", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
