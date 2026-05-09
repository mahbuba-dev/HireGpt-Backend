import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponsr";
import { candidateService } from "../candidate/candidate.service";
import { IqueryParams } from "../../interfaces/query.interface";

const getAllCandidates = catchAsync(async (req: Request, res: Response) => {
  const result = await candidateService.getAllCandidates(req.query as IqueryParams);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Candidates fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getCandidateById = catchAsync(async (req: Request, res: Response) => {
  const result = await candidateService.getCandidateById(String(req.params.id));

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Candidate retrieved successfully",
    data: result,
  });
});

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await candidateService.getMyProfile(req.user.userId);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Candidate profile retrieved successfully",
    data: result,
  });
});

const updateCandidate = catchAsync(async (req: Request, res: Response) => {
  const result = await candidateService.updateCandidate(
    String(req.params.id),
    req.body,
    req.user
  );

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Candidate updated successfully",
    data: result,
  });
});

const deleteCandidate = catchAsync(async (req: Request, res: Response) => {
  const result = await candidateService.deleteCandidate(String(req.params.id));

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Candidate deleted successfully",
    data: result,
  });
});

export const candidateController = {
  getAllCandidates,
  getCandidateById,
  getMyProfile,
  updateCandidate,
  deleteCandidate,
};