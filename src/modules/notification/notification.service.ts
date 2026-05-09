import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { UserRole, UserStatus } from "../../generated/enums";

type CreateNotificationPayload = {
  type: string;
  message: string;
  userId?: string;
  role?: Role;
};

const getNotificationById = async (id: string) => {
  const notification = await prisma.notification.findUnique({
    where: { id },
  });

  if (!notification) {
    throw new AppError(status.NOT_FOUND, "Notification not found");
  }

  return notification;
};

const normalizeNotificationPayload = (payload: CreateNotificationPayload) => ({
  type: payload.type.trim(),
  message: payload.message.trim(),
  userId: payload.userId,
  role: payload.role,
});

const createNotification = async (payload: CreateNotificationPayload) => {
  const { type, message, userId, role } = normalizeNotificationPayload(payload);

  if (!type || !message) {
    throw new AppError(status.BAD_REQUEST, "Type and message are required");
  }

  if ((userId && role) || (!userId && !role)) {
    throw new AppError(status.BAD_REQUEST, "Provide exactly one target: userId or role");
  }

  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError(status.NOT_FOUND, "Target user not found");
    }

    return prisma.notification.create({
      data: {
        type,
        message,
        userId,
      },
    });
  }

  if (role) {
    if (!Object.values(Role).includes(role)) {
      throw new AppError(status.BAD_REQUEST, "Invalid role provided");
    }

    const users = await prisma.user.findMany({
      where: {
        role,
        isDeleted: false,
        status: UserStatus.ACTIVE,
      },
      select: { id: true },
    });

    if (!users.length) {
      return { count: 0 };
    }

    const result = await prisma.notification.createMany({
      data: users.map((user) => ({
        type,
        message,
        userId: user.id,
      })),
    });

    return result;
  }

  throw new AppError(status.BAD_REQUEST, "Either userId or role is required");
};

const getAllNotifications = async () => {
  return prisma.notification.findMany({
    orderBy: { createdAt: "desc" },
  });
};

const getMyNotifications = async (user: IRequestUser) => {
  return prisma.notification.findMany({
    where: { userId: user.userId },
    orderBy: { createdAt: "desc" },
  });
};

const getUnreadCount = async (user: IRequestUser) => {
  const unreadCount = await prisma.notification.count({
    where: {
      userId: user.userId,
      read: false,
    },
  });

  return { unreadCount };
};

const markAsRead = async (id: string, user: IRequestUser) => {
  const notification = await getNotificationById(id);

  if (user.role !== UserRole.ADMIN && notification.userId !== user.userId) {
    throw new AppError(status.FORBIDDEN, "Forbidden access to this notification");
  }

  return prisma.notification.update({
    where: { id },
    data: { read: true },
  });
};

const markAllAsRead = async (user: IRequestUser) => {
  const result = await prisma.notification.updateMany({
    where: {
      userId: user.userId,
      read: false,
    },
    data: { read: true },
  });

  return result;
};

const deleteNotification = async (id: string, user: IRequestUser) => {
  const notification = await getNotificationById(id);

  if (user.role !== UserRole.ADMIN && notification.userId !== user.userId) {
    throw new AppError(status.FORBIDDEN, "Forbidden access to this notification");
  }

  await prisma.notification.delete({
    where: { id },
  });

  return null;
};

export const notificationService = {
  createNotification,
  getAllNotifications,
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
