
import { IIndustry } from "./industry.interface";
import AppError from "../../errorHelpers/AppError";
import status from "http-status";
import { prisma } from "../../lib/prisma";
import { Industry, Prisma } from "../../generated/client";
import { IqueryParams } from "../../interfaces/query.interface";
import { QueryBuilder } from "../../utilis/queryBuilder";

type IndustryWithExperts = Prisma.IndustryGetPayload<{
  include: { experts: true };
}>;

const findActiveIndustryById = async (id: string): Promise<Industry> => {
  const industry = await prisma.industry.findFirst({
    where: { id, isDeleted: false },
  });

  if (!industry) {
    throw new AppError(status.NOT_FOUND, "Industry not found");
  }

  return industry;
};

const ensureIndustryNameAvailable = async (
  name: string,
  excludeIndustryId?: string
): Promise<void> => {
  const existingIndustry = await prisma.industry.findUnique({
    where: { name },
  });

  if (existingIndustry && existingIndustry.id !== excludeIndustryId) {
    throw new AppError(status.CONFLICT, "Industry already exists");
  }
};

const buildIndustryPayload = (payload: Partial<IIndustry>) => {
  const data: Partial<IIndustry> = {};

  if (payload.name !== undefined) {
    data.name = payload.name.trim();
  }

  if (payload.description !== undefined) {
    data.description = payload.description.trim();
  }

  if (payload.icon !== undefined) {
    data.icon = payload.icon.trim();
  }

  return data;
};

// ===============================
// CREATE INDUSTRY
// ===============================
const createIndustry = async (payload: IIndustry) => {
  const data = buildIndustryPayload(payload);

  await ensureIndustryNameAvailable(data.name as string);

  const industry = await prisma.industry.create({
    data: {
      name: data.name as string,
      description: data.description,
      icon: data.icon,
    },
  });

  return industry;
};

// ===============================
// GET ALL INDUSTRIES
// ===============================
const getAllIndustries = async (query: IqueryParams) => {
  const qb = new QueryBuilder<
    Industry,
    Prisma.IndustryWhereInput,
    Prisma.IndustryInclude
  >(prisma.industry, query, {
    searchableFields: ["name", "description"],
    filterableFields: ["name"],
  });

  const result = await qb
    .search()
    .filter()
    .where({ isDeleted: false })
    .paginate()
    .sort()
    .fields()
    .excute();

  return result;
};

// ===============================
// GET INDUSTRY BY ID
// ===============================
const getIndustryById = async (id: string): Promise<IndustryWithExperts> => {
  const industry = await prisma.industry.findFirst({
    where: { id, isDeleted: false },
    include: { experts: true },
  });

  if (!industry) {
    throw new AppError(status.NOT_FOUND, "Industry not found");
  }

  return industry;
};

// ===============================
// UPDATE INDUSTRY
// ===============================
const updateIndustry = async (
  id: string,
  data: Partial<IIndustry>
): Promise<Industry> => {
  const existingIndustry = await findActiveIndustryById(id);
  const updateData = buildIndustryPayload(data);

  if (Object.keys(updateData).length === 0) {
    throw new AppError(status.BAD_REQUEST, "No valid industry fields provided for update");
  }

  if (
    updateData.name !== undefined &&
    updateData.name !== existingIndustry.name
  ) {
    await ensureIndustryNameAvailable(updateData.name, id);
  }

  const updated = await prisma.industry.update({
    where: { id },
    data: updateData,
  });

  return updated;
};

// ===============================
// SOFT DELETE INDUSTRY
// ===============================
const deleteIndustry = async (id: string): Promise<Industry> => {
  await findActiveIndustryById(id);

  const deleted = await prisma.industry.update({
    where: { id },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
    },
  });

  return deleted;
};

// ===============================
// EXPORT SERVICE
// ===============================
export const industryService = {
  createIndustry,
  getAllIndustries,
  getIndustryById,
  updateIndustry,
  deleteIndustry,
};