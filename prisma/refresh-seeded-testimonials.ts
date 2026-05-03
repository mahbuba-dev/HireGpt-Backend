import { prisma } from "../src/lib/prisma";

const cleanIndustryLabel = (industryName?: string) =>
  String(industryName ?? "Business")
    .replace(/\s+\d+$/, "")
    .trim() || "Business";

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

const run = async () => {
  const seededTestimonials = await prisma.testimonial.findMany({
    where: {
      expert: {
        email: {
          endsWith: "@consultedge.test",
        },
        isDeleted: false,
      },
      client: {
        email: {
          endsWith: "@consultedge.test",
        },
        isDeleted: false,
      },
    },
    select: {
      id: true,
      rating: true,
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
    orderBy: {
      createdAt: "asc",
    },
  });

  if (seededTestimonials.length === 0) {
    console.log("No seeded testimonials found to refresh.");
    return;
  }

  for (let i = 0; i < seededTestimonials.length; i += 1) {
    const row = seededTestimonials[i];
    const comment = buildIndustrySpecificReview(i, row.expert.industry?.name, row.rating);

    await prisma.testimonial.update({
      where: { id: row.id },
      data: { comment },
    });
  }

  console.log(`Refreshed ${seededTestimonials.length} seeded testimonials with industry-specific comments.`);
};

run()
  .catch((error) => {
    console.error("Failed to refresh seeded testimonials", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
