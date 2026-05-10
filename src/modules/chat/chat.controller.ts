import type { Request, Response } from "express";
import httpStatus from "http-status";

import AppError from "../../errorHelpers/AppError";
import { CallStatus, MessageType, Role } from "../../generated/client";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponsr";
import { chatService } from "./chat.service";
import { mapUploadedFileToAttachmentData } from "./chat.upload";
import { publishToRoom, publishToUser } from "../../lib/ably";

const emitChatEvent = async (
  roomId: string,
  eventName: string,
  payload: unknown,
  senderRole?: Role,
  senderUserId?: string
) => {
  const targets = await chatService.getRoomRealtimeTargets(
    roomId,
    senderRole,
    senderUserId
  );

  await publishToRoom(targets.roomId, eventName, payload);

  if (senderRole && targets.recipientUserId) {
    await publishToUser(targets.recipientUserId, eventName, payload);
    return;
  }

  await publishToUser(targets.clientUserId, eventName, payload);
  await publishToUser(targets.expertUserId, eventName, payload);
};

const getSingleString = (value: unknown): string => {
  if (Array.isArray(value)) {
    return typeof value[0] === "string" ? value[0] : "";
  }

  return typeof value === "string" ? value : "";
};

const getRooms = catchAsync(async (req: Request, res: Response) => {
  const expertId = getSingleString(req.query.expertId) || undefined;
  const rooms = await chatService.getUserRooms(
    req.user.userId,
    req.user.userRole as Role,
    expertId
  );

  sendResponse(res, {
    httpStatusCode: httpStatus.OK,
    success: true,
    message: "Chat rooms fetched successfully",
    data: rooms,
  });
});

const createOrGetRoom = catchAsync(async (req: Request, res: Response) => {
  const participantIdentifier = getSingleString(
    req.body?.expertId ?? req.body?.participantId ?? req.body?.userId
  );

  const room = await chatService.createOrGetRoom(
    req.user.userId,
    req.user.role as Role,
    participantIdentifier
  );

  sendResponse(res, {
    httpStatusCode: httpStatus.OK,
    success: true,
    message: "Chat room fetched successfully",
    data: room,
  });
});

const getRoomMessages = catchAsync(async (req: Request, res: Response) => {
  const roomId = getSingleString(req.params.roomId);

  if (!roomId) {
    throw new AppError(httpStatus.BAD_REQUEST, "roomId is required");
  }

  const result = await chatService.getRoomMessages(
    roomId,
    req.user.userId,
    req.user.role as Role
  );

  sendResponse(res, {
    httpStatusCode: httpStatus.OK,
    success: true,
    message: "Room messages fetched successfully",
    data: result,
  });
});

const postTextMessage = catchAsync(async (req: Request, res: Response) => {
  const roomId = getSingleString(req.params.roomId);
  const text = String(req.body?.text ?? "");

  if (!roomId) {
    throw new AppError(httpStatus.BAD_REQUEST, "roomId is required");
  }

  const result = await chatService.createTextMessage(
    roomId,
    req.user.userId,
    req.user.role as Role,
    text
  );

  await emitChatEvent(
    result.roomId,
    "receive_message",
    result.message,
    req.user.role as Role,
    req.user.userId
  );

  sendResponse(res, {
    httpStatusCode: httpStatus.CREATED,
    success: true,
    message: "Message sent successfully",
    data: result,
  });
});

const postAttachmentMessage = catchAsync(async (req: Request, res: Response) => {
  const roomId = getSingleString(req.params.roomId);

  if (!roomId) {
    throw new AppError(httpStatus.BAD_REQUEST, "roomId is required");
  }

  if (!req.file) {
    return sendResponse(res, {
      httpStatusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "Attachment file is required",
      data: null,
    });
  }

  const attachment = mapUploadedFileToAttachmentData(req.file);
  const result = await chatService.createFileMessage(
    roomId,
    req.user.userId,
    req.user.role as Role,
    attachment
  );

  await emitChatEvent(
    result.roomId,
    "receive_message",
    result.message,
    req.user.role as Role,
    req.user.userId
  );

  sendResponse(res, {
    httpStatusCode: httpStatus.CREATED,
    success: true,
    message: "Attachment message sent successfully",
    data: result,
  });
});

const toggleMessageReaction = catchAsync(async (req: Request, res: Response) => {
  const roomId = getSingleString(req.params.roomId);
  const messageId = getSingleString(req.params.messageId);
  const emoji = getSingleString(req.body?.emoji);

  if (!roomId || !messageId) {
    throw new AppError(httpStatus.BAD_REQUEST, "roomId and messageId are required");
  }

  const result = await chatService.toggleMessageReaction(
    roomId,
    messageId,
    req.user.userId,
    req.user.role as Role,
    emoji
  );

  await emitChatEvent(
    result.roomId,
    "message_reaction_updated",
    result,
    req.user.role as Role,
    req.user.userId
  );

  sendResponse(res, {
    httpStatusCode: httpStatus.OK,
    success: true,
    message: `Message reaction ${result.action} successfully`,
    data: result,
  });
});

const createCall = catchAsync(async (req: Request, res: Response) => {
  const roomId = getSingleString(req.params.roomId);

  if (!roomId) {
    throw new AppError(httpStatus.BAD_REQUEST, "roomId is required");
  }

  const call = await chatService.createCall(roomId, req.user.userId, req.user.role as Role);

  await emitChatEvent(
    roomId,
    "call_started",
    call,
    req.user.role as Role,
    req.user.userId
  );

  sendResponse(res, {
    httpStatusCode: httpStatus.CREATED,
    success: true,
    message: "Call started successfully",
    data: call,
  });
});

const updateCallStatus = catchAsync(async (req: Request, res: Response) => {
  const callId = getSingleString(req.params.callId);
  const statusValue = req.body?.status as CallStatus;

  if (!callId) {
    throw new AppError(httpStatus.BAD_REQUEST, "callId is required");
  }

  if (!Object.values(CallStatus).includes(statusValue)) {
    return sendResponse(res, {
      httpStatusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "Invalid call status",
      data: null,
    });
  }

  const call = await chatService.updateCallStatus(callId, statusValue);

  await emitChatEvent(
    call.roomId,
    statusValue === CallStatus.ENDED ? "call_ended" : "call_updated",
    call
  );

  sendResponse(res, {
    httpStatusCode: httpStatus.OK,
    success: true,
    message: "Call status updated successfully",
    data: call,
  });
});



 const  deleteMessage = catchAsync(async (req: Request, res: Response) => {
    const roomId = getSingleString(req.params.roomId);
    const messageId = getSingleString(req.params.messageId);
    if (!roomId || !messageId) {
      throw new AppError(httpStatus.BAD_REQUEST, "roomId and messageId are required");
    }
    await chatService.deleteMessage(roomId, messageId, req.user.userId, req.user.role as Role);
    // Optionally emit a socket event here for real-time UI update
    sendResponse(res, {
      httpStatusCode: httpStatus.OK,
      success: true,
      message: "Message deleted successfully",
      data: { messageId },
    });
  })

export const chatController = {
  getRooms,
  createOrGetRoom,
  getRoomMessages,
  postTextMessage,
  postAttachmentMessage,
  toggleMessageReaction,
  createCall,
  updateCallStatus,
  deleteMessage,

};
