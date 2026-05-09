import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { IqueryParams } from "../../interfaces/query.interface";
import { QueryBuilder } from "../../utilis/queryBuilder";
import { Candidate,  Prisma, UserRole } from "../../generated/client";
import { IRequestUser } from "../../interfaces/requestUser.interface";

const getAllCandidates = async (query: IqueryParams) => {
  const queryBuilder = new QueryBuilder<
    Candidate,
    Prisma.CandidateWhereInput,
    Prisma.CandidateInclude
  >(prisma.candidate, query, {
    searchableFields: ["fullName", "email", "phone", "address", "user.name", "user.email"],
    filterableFields: ["fullName", "email", "phone", "address", "isDeleted", "userId"],
  });

  const result = await queryBuilder
    .search()
    .filter()
    .where({ isDeleted: false })
    .include({ user: true })
    .paginate()
    .sort()
    .fields()
    .excute();

  return result;
};

const getCandidateById = async (id: string) => {
  const candidate = await prisma.candidate.findUnique({
    where: { id, isDeleted: false },
    include: {
      user: true,
      consultations: true,
      testimonials: true,
    },
  });

  if (!candidate) {
    throw new AppError(status.NOT_FOUND, "Candidate not found");
  }

  return candidate;
};

const getMyProfile = async (userId: string) => {
  const candidate = await prisma.candidate.findUnique({
    where: { userId, isDeleted: false },
    include: {
      user: true,
      consultations: true,
      testimonials: true,
    },
  });

  if (!candidate) {
    throw new AppError(status.NOT_FOUND, "Candidate profile not found");
  }

  return candidate;
};

const updateCandidate = async (
  id: string,
  payload: Partial<{
    fullName: string;
    email: string;
    profilePhoto: string;
    phone: string;
    address: string;
  }>,
  user: IRequestUser
) => {
  const existingCandidate = await prisma.candidate.findUnique({
    where: { id, isDeleted: false },
    include: { user: true },
  });

  if (!existingCandidate) {
    throw new AppError(status.NOT_FOUND, "Candidate not found");
  }

  if (user.userRole !== UserRole.ADMIN && existingCandidate.userId !== user.userId) {
    throw new AppError(status.FORBIDDEN, "Forbidden access to update this candidate");
  }

  const result = await prisma.$transaction(async (tx) => {
    if (payload.email && payload.email !== existingCandidate.email) {
      const duplicateUser = await tx.user.findFirst({
        where: {
          email: payload.email,
          NOT: { id: existingCandidate.userId },
        },
      });

      if (duplicateUser) {
        throw new AppError(status.BAD_REQUEST, "User with same email already exists");
      }
    }

    const updated = await tx.candidate.update({
      where: { id },
      data: payload,
      include: { user: true },
    });
    return updated;
  });

  return result;
};

const deleteCandidate = async (id: string) => {
  const candidate = await prisma.candidate.findUnique({
    where: { id, isDeleted: false },
  });

  if (!candidate) {
    throw new AppError(status.NOT_FOUND, "Candidate not found");
  }

  const result = await prisma.candidate.update({
    where: { id },
    data: { isDeleted: true, deletedAt: new Date() },
  });

  return result;
};

export const candidateService = {
  getAllCandidates,
  getCandidateById,
  getMyProfile,
  updateCandidate,
  deleteCandidate,
};