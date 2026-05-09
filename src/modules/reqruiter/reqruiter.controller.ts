import status from "http-status";
import { IqueryParams } from "../../interfaces/query.interface";
import { Request, Response } from "express";
import { reqruiterService } from "./reqruiter.service";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponsr";
import { mapUploadedResume } from "./reqruiterApplication.upload";

// ===============================
// GET ALL REQRUITERS
// ===============================
const getAllReqruiters = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const result = await reqruiterService.getAllReqruiters(query as IqueryParams);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Reqruiters fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

// ===============================
// GET REQRUITER BY ID
// ===============================
const getReqruiterById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const reqruiter = await reqruiterService.getReqruiterById(id as string);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Reqruiter retrieved successfully",
    data: reqruiter,
  });
});

// ===============================
// UPDATE REQRUITER
// ===============================
const updateReqruiter = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = req.body;
  const updatedReqruiter = await reqruiterService.updateReqruiter(id as string, payload);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Reqruiter updated successfully",
    data: updatedReqruiter,
  });
});

// ===============================
// DELETE REQRUITER (SOFT DELETE)
// ===============================
const deleteReqruiter = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const deletedReqruiter = await reqruiterService.deleteReqruiter(id as string);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Reqruiter deleted successfully",
    data: deletedReqruiter,
  });
});

// apply reqruiter
const applyReqruiter = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const files = req.files as Record<string, Express.Multer.File[] | undefined> | undefined;
  const resumeFile = files?.resume?.[0];
  const profilePhotoFile = files?.profilePhoto?.[0];
  const resume = resumeFile ? mapUploadedResume(resumeFile) : undefined;
  // If a profile photo file was uploaded, prefer its Cloudinary URL.
  // ...existing code for handling profile photo...
  // ...existing code for application logic...
});

export const reqruiterController = {
  getAllReqruiters,
  getReqruiterById,
  updateReqruiter,
  deleteReqruiter,
  applyReqruiter,
};
