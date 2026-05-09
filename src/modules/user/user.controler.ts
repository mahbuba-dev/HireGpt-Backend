import { Request, Response } from "express";
import { userService } from "./user.service";

import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponsr";
import { IqueryParams } from "../../interfaces/query.interface";






//create admin controler

const createAdmin = catchAsync(async(req: Request, res: Response) => {
    const payload = req.body
    const result = await userService.createAdmin(payload)
   sendResponse(res, {
    success: true,
    httpStatusCode:status.CREATED,
    message: "Admin created successfully",
    data: result
   })
})

const getAllClients = catchAsync(async (req: Request, res: Response) => {
    const result = await userService.getAllClients(req.query as IqueryParams)

    sendResponse(res, {
        success: true,
        httpStatusCode: status.OK,
        message: "Clients retrieved successfully",
        data: result.data,
        meta: result.meta,
    })
})


// Update profile (all users)
const updateProfile = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user.userId;
    const payload = req.body;
    const result = await userService.updateProfile(userId, payload);
    sendResponse(res, {
        success: true,
        httpStatusCode: status.OK,
        message: "Profile updated successfully",
        data: result
    })
});

export const userController = {
   createAdmin,
   getAllClients,
   updateProfile,
}

