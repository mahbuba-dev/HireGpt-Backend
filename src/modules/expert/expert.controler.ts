import status from "http-status";

import { IqueryParams } from "../../interfaces/query.interface";
import { Request, Response } from "express";
import { expertService } from "./expert.service";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponsr";
import { mapUploadedResume, mapUploadedProfilePhoto } from "./expertApplication.upload";


// ===============================
// GET ALL EXPERTS
// ===============================
const getAllExperts = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;

  const result = await expertService.getAllExperts(query as IqueryParams);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Experts fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});



// ===============================
// GET EXPERT BY ID
// ===============================
const getExpertById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params
 const expert = await expertService.getExpertById(id as string);
sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Expert retrieved successfully",
    data: expert,
  });
});



// ===============================
// UPDATE EXPERT
// ===============================
const updateExpert = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = req.body;

  const updatedExpert = await expertService.updateExpert(id as string, payload);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Expert updated successfully",
    data: updatedExpert,
  });
});



// ===============================
// DELETE EXPERT (SOFT DELETE)
// ===============================
const deleteExpert = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const deletedExpert = await expertService.deleteExpert(id as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Expert deleted successfully",
    data: deletedExpert,
  });
});





// apply expert

const applyExpert = catchAsync(async (req, res) => {
  const userId = req.user.userId;

  // Multer .fields() returns a record keyed by field name
  const files = req.files as
    | Record<string, Express.Multer.File[] | undefined>
    | undefined;

  const resumeFile = files?.resume?.[0];
  const profilePhotoFile = files?.profilePhoto?.[0];

  const resume = resumeFile ? mapUploadedResume(resumeFile) : undefined;

  // If a profile photo file was uploaded, prefer its Cloudinary URL.
  // Otherwise fall back to a profilePhoto URL string from the form body.
  const profilePhoto = profilePhotoFile
    ? mapUploadedProfilePhoto(profilePhotoFile)
    : req.body?.profilePhoto;

  const result = await expertService.applyExpert(userId, {
    ...req.body,
    profilePhoto,
    resume,
  });

  sendResponse(res, {
    success: true,
    httpStatusCode: 201,
    message: "Expert application submitted for admin review",
    data: result,
  });
});




// ===============================
// EXPORT CONTROLLER
// ===============================
export const expertController = {
  getAllExperts,
  getExpertById,
  updateExpert,
  deleteExpert,
  applyExpert
};