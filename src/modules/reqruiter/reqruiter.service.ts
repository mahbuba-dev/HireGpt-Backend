import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { updateReqruiterInterface } from "./reqruiter.interface";
import { IqueryParams } from "../../interfaces/query.interface";
import { QueryBuilder } from "../../utilis/queryBuilder";
import { reqruiterFilterableFields, reqruiterIncludeConfig, reqruiterSearchableFields } from "./reqruiter.constant";
import { Recruiter, Prisma, Role, UserStatus } from "../../generated/client";
import { prisma } from "../../lib/prisma";

const getAllReqruiters = async (query: IqueryParams) => {
  const qb = new QueryBuilder<
    Recruiter,
    Prisma.RecruiterWhereInput,
    Prisma.RecruiterInclude
  >(prisma.recruiter, query, {
    searchableFields: reqruiterSearchableFields,
    filterableFields: reqruiterFilterableFields,
  });

  const result = await qb
    .search()
    .filter()
    .where({
      isDeleted: false,
      user: { is: { isDeleted: false } },
    })
    .include({
      user: true,
    })
    .dynamicInclude(reqruiterIncludeConfig)
    .paginate()
    .sort()
    .fields()
    .excute();

  return result;
};

const getReqruiterById = async (id: string) => {
  const reqruiter = await prisma.recruiter.findFirst({
    where: {
      id,
      isDeleted: false,
      user: { is: { isDeleted: false } },
      // industry: { is: { isDeleted: false } },
    },
    include: {
      user: true,
      schedules: {
        where: {
          isDeleted: false,
          isPublished: true,
          isBooked: false,
          schedule: {
            isDeleted: false,
            endDateTime: { gt: new Date() },
          },
        },
        include: { schedule: true },
        orderBy: { schedule: { startDateTime: "asc" } },
      },
      consultations: {
        include: {
          candidate: true,
          reqruiterSchedule: true,
        },
      },
      testimonials: true,
      verification: true,
    },
  });

  if (!reqruiter) {
    throw new AppError(status.NOT_FOUND, "Reqruiter not found");
  }

  return reqruiter;
};

const updateReqruiter = async (id: string, payload: updateReqruiterInterface["reqruiter"]) => {
  const reqruiter = await prisma.recruiter.findUnique({
    where: { id, isDeleted: false },
  });
  if (!reqruiter) {
    throw new AppError(status.NOT_FOUND, "Reqruiter not found");
  }
  const updated = await prisma.recruiter.update({
    where: { id },
    data: payload,
  });
  return updated;
};

const deleteReqruiter = async (id: string) => {
  const reqruiter = await prisma.recruiter.findUnique({
    where: { id, isDeleted: false },
  });
  if (!reqruiter) {
    throw new AppError(status.NOT_FOUND, "Reqruiter not found");
  }
  const deleted = await prisma.recruiter.update({
    where: { id },
    data: { isDeleted: true, deletedAt: new Date() },
  });
  return deleted;
};

export const reqruiterService = {
  getAllReqruiters,
  getReqruiterById,
  updateReqruiter,
  deleteReqruiter,
};
