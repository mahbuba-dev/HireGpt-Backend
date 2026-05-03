import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

import { ReviewStatus, Role, UserStatus } from "../src/generated/client";

type GenericIndustry = {
  id?: string;
  name: string;
  description?: string;
  popularTitles?: string[];
  icon?: string;
};

type GenericExpert = {
  id?: string;
  fullName: string;
  title?: string;
  bio?: string;
  experience?: number;
  price?: number;
  consultationFee?: number;
  industryId?: string;
  rating?: number;
  totalReviews?: number;
  email?: string;
  phone?: string;
  profilePhoto?: string;
};

type GenericReview = {
  id?: string;
  expertId: string;
  rating?: number;
  comment?: string;
  createdAt?: string;
};

type GenericSeedInput = {
  industries: GenericIndustry[];
  experts: GenericExpert[];
  reviews: GenericReview[];
};

type TransformOptions = {
  targetIndustries: number;
  targetExperts: number;
};

type PrismaSeedOutput = {
  industries: Array<{
    id: string;
    name: string;
    description: string | null;
    icon: string | null;
    createdAt: string;
    updatedAt: string;
    isDeleted: boolean;
    deletedAt: string | null;
  }>;
  expertUsers: Array<{
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    role: Role;
    status: UserStatus;
    needPasswordChange: boolean;
    isDeleted: boolean;
    deletedAt: string | null;
    image: string | null;
    createdAt: string;
    updatedAt: string;
  }>;
  clientUsers: Array<{
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    role: Role;
    status: UserStatus;
    needPasswordChange: boolean;
    isDeleted: boolean;
    deletedAt: string | null;
    image: string | null;
    createdAt: string;
    updatedAt: string;
  }>;
  clients: Array<{
    id: string;
    fullName: string;
    email: string;
    profilePhoto: string | null;
    phone: string | null;
    address: string | null;
    isDeleted: boolean;
    deletedAt: string | null;
    userId: string;
    createdAt: string;
    updatedAt: string;
  }>;
  experts: Array<{
    id: string;
    fullName: string;
    email: string;
    profilePhoto: string | null;
    phone: string | null;
    bio: string | null;
    title: string | null;
    experience: number;
    consultationFee: number;
    isVerified: boolean;
    isSeeded: boolean;
    isDeleted: boolean;
    deletedAt: string | null;
    userId: string;
    industryId: string;
    createdAt: string;
    updatedAt: string;
  }>;
  testimonials: Array<{
    id: string;
    rating: number;
    comment: string | null;
    status: ReviewStatus;
    expertReply: string | null;
    expertRepliedAt: string | null;
    clientId: string;
    expertId: string;
    consultationId: string | null;
    createdAt: string;
    updatedAt: string;
  }>;
  summary: {
    industries: number;
    expertUsers: number;
    clientUsers: number;
    clients: number;
    experts: number;
    testimonials: number;
  };
};

const DEFAULT_TARGET_INDUSTRIES = 20;
const DEFAULT_TARGET_EXPERTS = 300;

// 20 hand-curated audience segments matching the "Who it's built for" style.
const PREMIUM_INDUSTRIES: Array<{ name: string; description: string; icon: string }> = [
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

const SEED_AGE_DAYS = 240;

const buildSeedTimestamp = (index: number, stepMinutes = 5) => {
  const base = new Date();
  base.setDate(base.getDate() - SEED_AGE_DAYS);
  const shifted = new Date(base.getTime() + index * stepMinutes * 60_000);
  return shifted.toISOString();
};

const buildProfessionalHeadshot = (index: number) => {
  const collection = index % 2 === 0 ? "men" : "women";
  const photoId = (index * 17 + 11) % 90;
  return `https://randomuser.me/api/portraits/${collection}/${photoId}.jpg`;
};

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

const CLIENT_FIRST_NAMES = [
  "Charlotte", "Alexander", "Isabella", "Benjamin", "Evelyn", "James", "Harper", "William",
  "Abigail", "Michael", "Ella", "Daniel", "Scarlett", "Matthew", "Victoria", "Joseph",
  "Grace", "Samuel", "Lily", "David", "Hannah", "Henry", "Aria", "Andrew",
] as const;

const CLIENT_LAST_NAMES = [
  "Hamilton", "Sullivan", "Mitchell", "Kensington", "Whitaker", "Harrington", "Donovan", "Sinclair",
  "Prescott", "Montgomery", "Ellington", "Thornton", "Callahan", "Wellington", "Bradford", "Kensley",
  "Livingston", "Ainsworth", "Redwood", "Fairchild", "Winters", "Langford", "Hawthorne", "Bennings",
] as const;

const buildProfessionalClientName = (index: number) => {
  const first = CLIENT_FIRST_NAMES[index % CLIENT_FIRST_NAMES.length];
  const last = CLIENT_LAST_NAMES[
    Math.floor(index / CLIENT_FIRST_NAMES.length) % CLIENT_LAST_NAMES.length
  ];

  return `${first} ${last}`;
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

const REVIEW_OUTCOMES = [
  "faster execution",
  "clearer prioritization",
  "higher conversion performance",
  "better stakeholder alignment",
  "more predictable delivery",
] as const;

const REVIEW_TIMEFRAMES = ["2 weeks", "30 days", "one quarter", "6 weeks", "45 days"] as const;

const AUDIENCE_KEYWORD_BANK: Array<{ includes: string[]; keywords: readonly string[] }> = [
  { includes: ["startup founders", "founders"], keywords: ["go-to-market", "product strategy", "investor narrative"] as const },
  { includes: ["investors", "advisors"], keywords: ["commercial diligence", "market sizing", "portfolio risk"] as const },
  { includes: ["teams", "agencies", "technical teams"], keywords: ["delivery velocity", "handoff quality", "execution cadence"] as const },
  { includes: ["small business owners", "entrepreneurs"], keywords: ["cash-flow planning", "offer positioning", "customer acquisition"] as const },
  { includes: ["marketing"], keywords: ["campaign attribution", "funnel optimization", "messaging clarity"] as const },
  { includes: ["sales"], keywords: ["pipeline hygiene", "deal qualification", "win-rate improvement"] as const },
  { includes: ["finance"], keywords: ["unit economics", "scenario modeling", "capital allocation"] as const },
  { includes: ["operations"], keywords: ["process efficiency", "SLA discipline", "cross-team coordination"] as const },
  { includes: ["hr", "talent"], keywords: ["hiring scorecards", "leadership bench", "retention strategy"] as const },
  { includes: ["career switchers", "students", "career seekers"], keywords: ["portfolio positioning", "interview readiness", "role transition plan"] as const },
  { includes: ["software", "engineering", "technology"], keywords: ["architecture trade-offs", "release reliability", "technical debt"] as const },
];

const DEFAULT_AUDIENCE_KEYWORDS = ["prioritization discipline", "execution clarity", "stakeholder communication"] as const;

const buildAudienceKeywordPhrase = (industryName: string, index: number) => {
  const normalized = industryName.toLowerCase();
  const matched = AUDIENCE_KEYWORD_BANK.find((entry) =>
    entry.includes.some((token) => normalized.includes(token))
  );
  const keywords = matched?.keywords ?? DEFAULT_AUDIENCE_KEYWORDS;
  const first = keywords[index % keywords.length];
  const second = keywords[(index + 1) % keywords.length];
  return `${first} and ${second}`;
};

const buildProfessionalTitle = (index: number, industryName?: string) => {
  const industry = cleanIndustryLabel(industryName);
  const prefix = TITLE_PREFIXES[index % TITLE_PREFIXES.length];
  return `${prefix}, ${industry}`;
};

const buildProfessionalBio = (index: number, industryName?: string, experience?: number) => {
  const industry = cleanIndustryLabel(industryName);
  const years = clampInt(experience ?? 6 + (index % 10), 4, 20, 8);
  const impact = BIO_IMPACT_PHRASES[index % BIO_IMPACT_PHRASES.length];

  return `I advise clients in ${industry.toLowerCase()} on strategy and execution, with ${years}+ years of hands-on leadership experience. Recent engagements focused on ${impact} through practical playbooks and measurable milestones.`;
};

const buildIndustrySpecificReview = (index: number, industryName: string | undefined, rating: number) => {
  const industry = cleanIndustryLabel(industryName);
  const outcome = REVIEW_OUTCOMES[index % REVIEW_OUTCOMES.length];
  const timeframe = REVIEW_TIMEFRAMES[index % REVIEW_TIMEFRAMES.length];
  const keywordPhrase = buildAudienceKeywordPhrase(industry, index);

  if (rating >= 5) {
    return `Outstanding ${industry.toLowerCase()} guidance with concrete focus on ${keywordPhrase}. We applied the recommendations quickly and saw ${outcome} within ${timeframe}.`;
  }

  if (rating === 4) {
    return `Strong ${industry.toLowerCase()} session with clear action points around ${keywordPhrase}. The framework helped our team deliver ${outcome} in ${timeframe}.`;
  }

  if (rating === 3) {
    return `Useful ${industry.toLowerCase()} consultation with practical next steps on ${keywordPhrase}. We are already seeing progress toward ${outcome}.`;
  }

  return `The ${industry.toLowerCase()} recommendations were relevant, especially on ${keywordPhrase}, and we are refining execution to unlock ${outcome}.`;
};

const normalizeEmailLocalPart = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "")
    .slice(0, 48) || "user";

const clampInt = (value: unknown, min: number, max: number, fallback: number) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.round(n)));
};

const parseInput = async (inputPath: string): Promise<GenericSeedInput> => {
  const raw = await readFile(inputPath, "utf8");
  const parsed = JSON.parse(raw) as Partial<GenericSeedInput>;

  if (!Array.isArray(parsed.industries)) {
    throw new Error("Input must include an industries array");
  }

  if (!Array.isArray(parsed.experts)) {
    throw new Error("Input must include an experts array");
  }

  if (!Array.isArray(parsed.reviews)) {
    throw new Error("Input must include a reviews array");
  }

  return {
    industries: parsed.industries,
    experts: parsed.experts,
    reviews: parsed.reviews,
  };
};

const expandIndustries = (_inputIndustries: GenericIndustry[], targetIndustries: number): GenericIndustry[] => {
  // Always use the curated premium list — every name is unique, no numeric suffixes
  const count = Math.min(targetIndustries, PREMIUM_INDUSTRIES.length);
  return PREMIUM_INDUSTRIES.slice(0, count).map((entry) => ({
    name: entry.name,
    description: entry.description,
    icon: entry.icon,
  }));
};

const expandExperts = (
  inputExperts: GenericExpert[],
  targetExperts: number,
  industryIds: string[],
  industryNames: string[]
): GenericExpert[] => {
  const base = [...inputExperts];
  if (base.length === 0) {
    throw new Error("Input must include at least one expert");
  }

  const output: GenericExpert[] = [];

  for (let i = 0; i < targetExperts; i += 1) {
    const template = base[i % base.length];
    const industryName = industryNames[i % industryNames.length];
    const fullName = buildUniqueExpertName(i, industryName);
    output.push({
      ...template,
      id: undefined,
      fullName,
      industryId: industryIds[i % industryIds.length],
      consultationFee: template.consultationFee ?? template.price,
      profilePhoto: buildProfessionalHeadshot(i),
      title: buildProfessionalTitle(i, industryName),
      bio: buildProfessionalBio(i, industryName, template.experience),
    });
  }

  return output;
};

const transform = (input: GenericSeedInput, options: TransformOptions): PrismaSeedOutput => {
  const runToken = Date.now().toString(36);

  const expandedIndustries = expandIndustries(input.industries, options.targetIndustries);

  const industries = expandedIndustries.map((industry, index) => ({
    id: randomUUID(),
    name: String(industry.name || `Industry ${index + 1}`).trim(),
    description: industry.description?.trim() || null,
    icon: industry.icon?.trim() || null,
    createdAt: buildSeedTimestamp(index),
    updatedAt: buildSeedTimestamp(index),
    isDeleted: false,
    deletedAt: null,
  }));

  const industryIdSet = new Set(industries.map((row) => row.id));

  const fallbackIndustryId = industries[0]?.id;
  if (!fallbackIndustryId) {
    throw new Error("At least one industry is required to transform experts");
  }

  const usedEmails = new Set<string>();

  const expertUsers: PrismaSeedOutput["expertUsers"] = [];
  const experts: PrismaSeedOutput["experts"] = [];
  const industryNameById = new Map(industries.map((industry) => [industry.id, industry.name]));

  const expandedExperts = expandExperts(
    input.experts,
    options.targetExperts,
    industries.map((industry) => industry.id),
    industries.map((industry) => industry.name)
  );

  expandedExperts.forEach((expert, idx) => {
    const expertId = expert.id || randomUUID();
    const userId = randomUUID();
    const fullName = String(expert.fullName || `Expert ${idx + 1}`).trim();

    const emailBase = normalizeEmailLocalPart(fullName);
    let email = `${emailBase}.expert@consultedge.test`;
    let salt = 1;
    while (usedEmails.has(email)) {
      email = `${emailBase}.expert${salt}@consultedge.test`;
      salt += 1;
    }
    usedEmails.add(email);

    const industryId =
      expert.industryId && industryIdSet.has(expert.industryId)
        ? expert.industryId
        : fallbackIndustryId;

    expertUsers.push({
      id: userId,
      name: fullName,
      email,
      emailVerified: true,
      role: Role.EXPERT,
      status: UserStatus.ACTIVE,
      needPasswordChange: false,
      isDeleted: false,
      deletedAt: null,
      image: expert.profilePhoto?.trim() || buildProfessionalHeadshot(idx),
      createdAt: buildSeedTimestamp(2000 + idx),
      updatedAt: buildSeedTimestamp(2000 + idx),
    });

    experts.push({
      id: expertId,
      fullName,
      email,
      profilePhoto: expert.profilePhoto?.trim() || buildProfessionalHeadshot(idx),
      phone: expert.phone?.trim() || null,
      bio: expert.bio?.trim() || null,
      title: expert.title?.trim() || null,
      experience: clampInt(expert.experience, 1, 20, 5),
      consultationFee: clampInt(expert.consultationFee ?? expert.price, 20, 300, 50),
      isVerified: true,
      isSeeded: true,
      isDeleted: false,
      deletedAt: null,
      userId,
      industryId,
      createdAt: buildSeedTimestamp(4000 + idx),
      updatedAt: buildSeedTimestamp(4000 + idx),
    });
  });

  const clientPoolSize = Math.max(50, Math.min(300, Math.ceil(input.reviews.length / 3)));

  const clientUsers: PrismaSeedOutput["clientUsers"] = [];
  const clients: PrismaSeedOutput["clients"] = [];

  for (let i = 0; i < clientPoolSize; i += 1) {
    const userId = randomUUID();
    const clientId = randomUUID();
    const fullName = buildProfessionalClientName(i);
    const email = `client${String(i + 1).padStart(3, "0")}.${runToken}@consultedge.test`;

    clientUsers.push({
      id: userId,
      name: fullName,
      email,
      emailVerified: true,
      role: Role.CLIENT,
      status: UserStatus.ACTIVE,
      needPasswordChange: false,
      isDeleted: false,
      deletedAt: null,
      image: buildProfessionalHeadshot(7000 + i),
      createdAt: buildSeedTimestamp(7000 + i),
      updatedAt: buildSeedTimestamp(7000 + i),
    });

    clients.push({
      id: clientId,
      fullName,
      email,
      profilePhoto: buildProfessionalHeadshot(9000 + i),
      phone: null,
      address: null,
      isDeleted: false,
      deletedAt: null,
      userId,
      createdAt: buildSeedTimestamp(9000 + i),
      updatedAt: buildSeedTimestamp(9000 + i),
    });
  }

  const reviewTemplates = input.reviews.length > 0
    ? input.reviews
    : [{ rating: 4, comment: "Great consultation experience." } as GenericReview];

  const testimonialTarget = Math.max(expandedExperts.length, reviewTemplates.length);

  const testimonials: PrismaSeedOutput["testimonials"] = Array.from(
    { length: testimonialTarget },
    (_, index) => {
      const review = reviewTemplates[index % reviewTemplates.length];
      const targetExpert = experts[index % experts.length];
      const createdAt = review.createdAt ? new Date(review.createdAt) : new Date();
      const normalizedCreatedAt = Number.isNaN(createdAt.valueOf()) ? new Date() : createdAt;

      const rating = clampInt(review.rating, 1, 5, 4);
      const status =
        rating >= 4 ? ReviewStatus.APPROVED : rating === 3 ? ReviewStatus.PENDING : ReviewStatus.HIDDEN;
      const industryName = industryNameById.get(targetExpert.industryId);

      return {
        id: randomUUID(),
        rating,
        comment: buildIndustrySpecificReview(index, industryName, rating),
        status,
        expertReply: null,
        expertRepliedAt: null,
        clientId: clients[index % clients.length].id,
        expertId: targetExpert.id,
        consultationId: null,
        createdAt: normalizedCreatedAt.toISOString(),
        updatedAt: normalizedCreatedAt.toISOString(),
      };
    }
  );

  return {
    industries,
    expertUsers,
    clientUsers,
    clients,
    experts,
    testimonials,
    summary: {
      industries: industries.length,
      expertUsers: expertUsers.length,
      clientUsers: clientUsers.length,
      clients: clients.length,
      experts: experts.length,
      testimonials: testimonials.length,
    },
  };
};

const run = async () => {
  const inputArg = process.argv[2];
  const outputArg = process.argv[3] || "prisma/seed-data.json";
  const targetIndustriesArg = Number(process.argv[4] ?? process.env.SEED_TARGET_INDUSTRIES ?? DEFAULT_TARGET_INDUSTRIES);
  const targetExpertsArg = Number(process.argv[5] ?? process.env.SEED_TARGET_EXPERTS ?? DEFAULT_TARGET_EXPERTS);

  if (!inputArg) {
    throw new Error(
      "Usage: tsx prisma/seed-transform.ts <input-json-path> [output-json-path]"
    );
  }

  const inputPath = path.resolve(process.cwd(), inputArg);
  const outputPath = path.resolve(process.cwd(), outputArg);
  const targetIndustries = Number.isFinite(targetIndustriesArg) && targetIndustriesArg > 0
    ? Math.floor(targetIndustriesArg)
    : DEFAULT_TARGET_INDUSTRIES;
  const targetExperts = Number.isFinite(targetExpertsArg) && targetExpertsArg > 0
    ? Math.floor(targetExpertsArg)
    : DEFAULT_TARGET_EXPERTS;

  const input = await parseInput(inputPath);
  const transformed = transform(input, { targetIndustries, targetExperts });

  await writeFile(outputPath, JSON.stringify(transformed, null, 2), "utf8");

  console.log("Seed transform completed successfully", {
    input: inputPath,
    output: outputPath,
    targetIndustries,
    targetExperts,
    summary: transformed.summary,
  });
};

run().catch((error) => {
  console.error("Seed transform failed", error);
  process.exit(1);
});
