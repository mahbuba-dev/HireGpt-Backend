import status from "http-status";
import type { Request, Response } from "express";

import { expertVerificationService } from "./expertVerification.service";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponsr";
import type { IqueryParams } from "../../interfaces/query.interface";
import {
  mapUploadedResume,
  mapUploadedProfilePhoto,
} from "../expert/expertApplication.upload";

const verifyExpert = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params; // expertId
  const adminId = req.user.userId; // from auth middleware
  const payload = req.body;

  const result = await expertVerificationService.verifyExpert(
    id as string,
    adminId,
    payload
  );

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Expert verification updated successfully",
    data: result,
  });
});

const submitApplication = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;

  // This route accepts both JSON and multipart/form-data. When multer .fields()
  // has parsed the request, `req.files` contains uploaded files keyed by
  // fieldname. Map them to the shape the service expects.
  const files = req.files as
    | Record<string, Express.Multer.File[] | undefined>
    | undefined;

  const resumeFile = files?.resume?.[0];
  const profilePhotoFile = files?.profilePhoto?.[0];

  const resume = resumeFile
    ? mapUploadedResume(resumeFile)
    : req.body?.resume;

  const profilePhoto = profilePhotoFile
    ? mapUploadedProfilePhoto(profilePhotoFile)
    : req.body?.profilePhoto;

  const payload = {
    ...req.body,
    ...(resume ? { resume } : {}),
    ...(profilePhoto ? { profilePhoto } : {}),
  };

  const result = await expertVerificationService.submitApplication(userId, payload);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Expert application submitted successfully",
    data: result,
  });
});

const getMyApplications = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const result = await expertVerificationService.getMyApplications(userId);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "My expert applications fetched successfully",
    data: result,
  });
});

const getAllApplications = catchAsync(async (_req: Request, res: Response) => {
  const result = await expertVerificationService.getAllApplications(_req.query as IqueryParams);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Expert applications fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getNewApplicants = catchAsync(async (_req: Request, res: Response) => {
  const result = await expertVerificationService.getNewApplicants(_req.query as IqueryParams);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Pending expert applications fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getApplicationById = catchAsync(async (req: Request, res: Response) => {
  const result = await expertVerificationService.getApplicationById(String(req.params.id));

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Expert application fetched successfully",
    data: result,
  });
});

const reviewApplication = catchAsync(async (req: Request, res: Response) => {
  const adminId = req.user.userId;
  const result = await expertVerificationService.reviewApplication(
    String(req.params.id),
    adminId,
    req.body
  );

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Expert application reviewed successfully",
    data: result,
  });
});

const openApplicationResume = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { download } = req.query as { download?: string };

  const resume = await expertVerificationService.getAdminResumeAccess(String(id));
  const response = await fetch(resume.resumeUrl);

  if (!response.ok) {
    return sendResponse(res, {
      httpStatusCode: status.BAD_GATEWAY,
      success: false,
      message: "Failed to load resume from storage",
      data: null,
    });
  }

  const fileBuffer = Buffer.from(await response.arrayBuffer());
  const isDownload = download === "true";
  const disposition = `${isDownload ? "attachment" : "inline"}; filename="${encodeURIComponent(
    resume.resumeFileName
  )}"`;

  res.setHeader("Content-Type", resume.resumeFileType || "application/octet-stream");
  res.setHeader("Content-Disposition", disposition);
  res.setHeader("Content-Length", fileBuffer.length.toString());

  return res.status(status.OK).send(fileBuffer);
});

export const expertVerificationController = {
  submitApplication,
  getMyApplications,
  getAllApplications,
  getNewApplicants,
  getApplicationById,
  reviewApplication,
  openApplicationResume,
  verifyExpert,
};