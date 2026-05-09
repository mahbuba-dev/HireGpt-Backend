// ---- SeedPayload type ----
type SeedPayload = {
  industries: Prisma.IndustryCreateManyInput[];
  recruiterUsers: Prisma.UserCreateManyInput[];
  candidateUsers: Prisma.UserCreateManyInput[];
  recruiters: Prisma.RecruiterCreateManyInput[];
  candidates: Prisma.CandidateCreateManyInput[];
  jobs: Prisma.JobCreateManyInput[];
  summary?: unknown;
};

import { readFile } from "node:fs/promises";
import path from "node:path";


import { prisma } from "../src/lib/prisma";
import {
  type Prisma,
  UserRole,
  UserStatus,
} from "../src/generated/client";

const DEFAULT_SEED_FILE = "prisma/seed-data.json";
const DEFAULT_BATCH_SIZE = 20;

const chunkArray = <T>(items: T[], size: number): T[][] => {
  if (size <= 0) return [items];
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
};

const assertArray = <T>(value: unknown, label: string): T[] => {
  if (!Array.isArray(value)) {
    throw new Error(`Invalid seed payload: ${label} must be an array`);
  }
  return value as T[];
};

const assertUnique = <T>(
  rows: T[],
  keySelector: (row: T) => string,
  label: string
) => {
  const seen = new Set<string>();
  for (const row of rows) {
    const key = keySelector(row);
    if (seen.has(key)) {
      throw new Error(`Invalid seed payload: duplicate ${label} value '${key}'`);
    }
    seen.add(key);
  }
};

const validateEnums = (payload: SeedPayload) => {
  const validRoles = new Set(Object.values(UserRole));
  const validUserStatus = new Set(Object.values(UserStatus));
  for (const user of [
    ...(payload.recruiterUsers || []),
    ...(payload.candidateUsers || [])
  ]) {
    if (!validRoles.has(user.role as UserRole)) {
      throw new Error(`Invalid user role for user ${user.id}: ${user.role}`);
    }
    if (!validUserStatus.has(user.status as UserStatus)) {
      throw new Error(`Invalid user status for user ${user.id}: ${user.status}`);
    }
  }
};

const validateRelations = (payload: SeedPayload) => {
  const userIds = new Set([
    ...(payload.recruiterUsers || []),
    ...(payload.candidateUsers || [])
  ].map((row) => row.id));
  if (payload.recruiters) {
    for (const recruiter of payload.recruiters) {
      if (!userIds.has(recruiter.userId)) {
        throw new Error(
          `Invalid relation: recruiter ${recruiter.id} references missing userId ${recruiter.userId}`
        );
      }
      // recruiter.industryId validation removed (many-to-many handled elsewhere)
    }
  }
  // Candidate validation remains unchanged (if industryId is valid for JobSeeker)
  if (payload.candidates) {
    for (const candidate of payload.candidates) {
      if (!userIds.has(candidate.userId)) {
        throw new Error(
          `Invalid relation: candidate ${candidate.id} references missing userId ${candidate.userId}`
        );
      }
    }
  }
};

const validateUniqueness = (payload: SeedPayload) => {
  assertUnique(payload.industries, (row) => (row.id ?? ''), "industry id");
  assertUnique(payload.industries, (row) => (row.name ?? '').toLowerCase(), "industry name");
  const allUsers = [
    ...(payload.recruiterUsers || []),
    ...(payload.candidateUsers || [])
  ];
  assertUnique(allUsers, (row) => row.id, "user id");
  assertUnique(allUsers, (row) => row.email.toLowerCase(), "user email");
  if (payload.recruiters) {
    assertUnique(payload.recruiters, (row) => (row.id ?? ''), "recruiter id");
    assertUnique(payload.recruiters, (row) => (row.userId ?? ''), "recruiter userId");
    assertUnique(payload.recruiters, (row) => (row.email ?? '').toLowerCase(), "recruiter email");
  }
  if (payload.candidates) {
    assertUnique(payload.candidates, (row) => (row.id ?? ''), "candidate id");
    assertUnique(payload.candidates, (row) => (row.userId ?? ''), "candidate userId");
    assertUnique(payload.candidates, (row) => (row.email ?? '').toLowerCase(), "candidate email");
  }
};

const parseSeedPayload = async (filePath: string): Promise<SeedPayload> => {
  let raw: string;
  try {
    raw = await readFile(filePath, "utf8");
  } catch (error) {
    const fileError = error as NodeJS.ErrnoException;
    if (fileError.code === "ENOENT") {
      throw new Error(
        `Seed file not found: ${filePath}. Provide a valid JSON path, e.g. 'npm run seed:file -- prisma/my-seed.json'.`
      );
    }
    throw error;
  }

  const parsed = JSON.parse(raw) as Partial<SeedPayload>;


  // Map candidates to required fields for CandidateCreateManyInput
  let mappedCandidates: Prisma.CandidateCreateManyInput[] = [];
  if (parsed.candidates) {
    mappedCandidates = (parsed.candidates as any[]).map((c) => ({
      id: c.id ?? '',
      fullName: c.fullName ?? c.name ?? '',
      email: c.email ?? '',
      experience: c.experience,
      skills: c.skills,
      isDeleted: c.isDeleted,
      deletedAt: c.deletedAt,
      userId: c.userId ?? '',
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));
  }
  const payload: SeedPayload = {
    industries: assertArray<Prisma.IndustryCreateManyInput>(parsed.industries, "industries"),
    recruiterUsers: parsed.recruiterUsers ? assertArray<Prisma.UserCreateManyInput>(parsed.recruiterUsers, "recruiterUsers") : [],
    candidateUsers: parsed.candidateUsers ? assertArray<Prisma.UserCreateManyInput>(parsed.candidateUsers, "candidateUsers") : [],
    recruiters: parsed.recruiters ? assertArray<Prisma.RecruiterCreateManyInput>(parsed.recruiters, "recruiters") : [],
    candidates: mappedCandidates,
    jobs: parsed.jobs ? assertArray<Prisma.JobCreateManyInput>(parsed.jobs, "jobs") : [],
    summary: parsed.summary,
  };

  validateUniqueness(payload);
  validateEnums(payload);
  validateRelations(payload);

  return payload;
};

// Use correct Prisma input type for batchCreateMany
const batchCreateMany = async <T>(
  createMany: (args: { data: T[]; skipDuplicates: boolean }) => Promise<unknown>,
  rows: T[],
  batchSize: number
) => {
  for (const chunk of chunkArray(rows, batchSize)) {
    await createMany({ data: chunk, skipDuplicates: true });
  }
};


const seed = async (seedFileArg?: string) => {
  const seedFile = seedFileArg || DEFAULT_SEED_FILE;
  const resolvedSeedFile = path.resolve(process.cwd(), seedFile);
  const batchSize = Math.max(
    1,
    Number.parseInt(process.env.SEED_BATCH_SIZE || "", 10) || DEFAULT_BATCH_SIZE
  );

  const payload = await parseSeedPayload(resolvedSeedFile);

  // Load testimonials from separate file
  const testimonialSeedPath = path.resolve(process.cwd(), "prisma/seed-testimonial.json");
  let testimonials: any[] = [];
  try {
    const testimonialRaw = await readFile(testimonialSeedPath, "utf8");
    testimonials = JSON.parse(testimonialRaw).testimonials || [];
  } catch (e) {
    console.warn("No testimonial seed file found or invalid format.");
  }

  await prisma.$connect();

  try {
    await prisma.$transaction(async (tx) => {
      await batchCreateMany((args) => tx.industry.createMany(args), payload.industries, batchSize);

      // Users
      const allUsers = [
        ...(payload.recruiterUsers || []),
        ...(payload.candidateUsers || [])
      ];
      if (allUsers.length > 0) {
        await batchCreateMany((args) => tx.user.createMany(args), allUsers, batchSize);
      }

      // Recruiters
      if (payload.recruiters && payload.recruiters.length > 0) {
        await batchCreateMany((args) => tx.recruiter.createMany(args), payload.recruiters, batchSize);
      }

      // Candidates
      if (payload.candidates && payload.candidates.length > 0) {
        await batchCreateMany((args) => tx.candidate.createMany(args), payload.candidates, batchSize);
      }

      // Jobs
      if (payload.jobs && payload.jobs.length > 0) {
        await batchCreateMany((args) => tx.job.createMany(args), payload.jobs, batchSize);
      }

      // Testimonials
      if (testimonials.length > 0) {
        await batchCreateMany((args) => tx.testimonial.createMany(args), testimonials, batchSize);
      }
    });

    console.log("Seed completed successfully", {
      file: resolvedSeedFile,
      batchSize,
      counts: {
        industries: payload.industries.length,
        recruiterUsers: payload.recruiterUsers?.length || 0,
        candidateUsers: payload.candidateUsers?.length || 0,
        recruiters: payload.recruiters?.length || 0,
        candidates: payload.candidates?.length || 0,
        jobs: payload.jobs?.length || 0,
        testimonials: testimonials.length,
      },
      summary: payload.summary,
    });
  } finally {
    await prisma.$disconnect();
  }
};

seed(process.argv[2]).catch(async (error) => {
  console.error("Seed failed", error);
  await prisma.$disconnect().catch(() => null);
  process.exit(1);
});
