import status from "http-status";

import { industryService } from "./industry.service";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponsr";
import { IqueryParams } from "../../interfaces/query.interface";


const createIndustry = catchAsync(async (req, res) => {
  const { name, description, icon: iconUrl } = req.body;
  const icon = req.file?.path ?? iconUrl;

  const result = await industryService.createIndustry({
    name,
    description,
    icon,
  });

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Industry created successfully",
    data: result,
  });
});

const getAllIndustries = catchAsync(async (req, res) => {
  const result = await industryService.getAllIndustries(req.query as IqueryParams);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Industries fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getIndustryById = catchAsync(async (req, res) => {
  const result = await industryService.getIndustryById(req.params.id as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Industry retrieved successfully",
    data: result,
  });
});

const updateIndustry = catchAsync(async (req, res) => {
  const { name, description, icon: iconUrl } = req.body;
  const icon = req.file?.path ?? iconUrl;

  const payload = {
    ...(name !== undefined ? { name } : {}),
    ...(description !== undefined ? { description } : {}),
    ...(icon !== undefined ? { icon } : {}),
  };

  const result = await industryService.updateIndustry(
    req.params.id as string,
    payload
  );

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Industry updated successfully",
    data: result,
  });
});

const deleteIndustry = catchAsync(async (req, res) => {
  const result = await industryService.deleteIndustry(req.params.id as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Industry deleted successfully",
    data: result,
  });
});

export const industryController = {
  createIndustry,
  getAllIndustries,
  getIndustryById,
  updateIndustry,
  deleteIndustry,
};