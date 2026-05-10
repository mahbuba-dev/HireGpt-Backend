

import httpStatus from "http-status";

import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import {
  CallStatus,
  MessageType,
  Prisma,
 
  UserRole,
  type Attachment,
} from "../../generated/client";
import type { SortOrder } from "../../generated/internal/prismaNamespace";

type AttachmentInput = Pick<
  Attachment,
  "fileUrl" | "fileName" | "fileType" | "fileSize"
>;

const reactionUserSelect = {
  id: true,
  name: true,
  email: true,
  image: true,
} as const;

const messageReactionInclude = {
  user: {
    select: reactionUserSelect,
  },
} as const;


type MessageReactionWithUser = Prisma.MessageReactionGetPayload<{
  include: typeof messageReactionInclude;
}>;


const mapRoleToUserRole = (role: UserRole): UserRole => {
  if (role === UserRole.RECRUITER) return UserRole.RECRUITER;
  if (role === UserRole.CANDIDATE) return UserRole.CANDIDATE;
  return UserRole.ADMIN;
};



const getCurrentRecruiterByUserId = async (userId: string) => {
  const recruiter = await prisma.recruiter.findUnique({
    where: { userId },
    select: { id: true, userId: true, isDeleted: true },
  });
  if (!recruiter || recruiter.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, "Recruiter profile not found");
  }
  return recruiter;
};

const getCurrentCandidateByUserId = async (userId: string) => {
  const candidate = await prisma.candidate.findUnique({
    where: { userId },
    select: { id: true, userId: true, isDeleted: true },
  });
  if (!candidate || candidate.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, "Candidate profile not found");
  }
  return candidate;
};

const chatRoomInclude = {
  // candidate and recruiter are not relations in the new schema, so only include messages
  messages: {
    include: {
      attachments: true,
      reactions: { include: { user: true } },
    },
    orderBy: { createdAt: "desc" as SortOrder },
    take: 1,
  },
};
// Helper to build participants from a room object
const buildParticipants = async (room: any) => {
  const presenceLookup = await getPresenceLookup([
    room.jobSeekerId,
    room.recruiterId,
  ].filter(Boolean));
  const participants = [] as any[];
  if (room.jobSeekerId) {
    participants.push({
      userId: room.jobSeekerId,
      role: UserRole.CANDIDATE,
      isOnline: presenceLookup.get(room.jobSeekerId)?.isOnline ?? false,
      lastSeen: presenceLookup.get(room.jobSeekerId)?.lastSeen ?? null,
    });
  }
  if (room.recruiterId) {
    participants.push({
      userId: room.recruiterId,
      role: UserRole.RECRUITER,
      isOnline: presenceLookup.get(room.recruiterId)?.isOnline ?? false,
      lastSeen: presenceLookup.get(room.recruiterId)?.lastSeen ?? null,
    });
  }
  return participants;
};

// Helper to format a message with participants
const formatMessage = (message: any, participants: any[] = [], currentUserId?: string) => ({
  ...message,
  sender: participants.find(
    (participant) => participant.userId === message.senderId || participant.id === message.senderId
  ) ?? null,
  attachment: formatAttachment(message.attachment),
  reactions: formatReactions(message.reactions, currentUserId),
});

const messageFullInclude = {
  attachments: true,
  reactions: { include: { user: true } },
};

const upsertRoomForParticipants = async (
  recruiterId: string,
  jobSeekerId: string
) => {
  return prisma.chatRoom.upsert({
    where: {
      jobSeekerId_recruiterId_jobId: {
        recruiterId,
        jobSeekerId,
        jobId: "", // Use empty string for null jobId
      },
    },
    update: {},
    create: {
      recruiterId,
      jobSeekerId,
    },
    include: chatRoomInclude,
  });
};

const resolveRoomByIdentifier = async (
  roomIdentifier: string,
  userId: string,
  role: UserRole
) => {
  // For HireGpt, just return null if not found
  if (role === UserRole.ADMIN) {
    return null;
  }
  return null;
};
const getLatestRoomForUser = async (userId: string, role: UserRole) => {
  if (role === UserRole.ADMIN) {
    return null;
  }
  // Implement as needed for your business logic
  return null;
};

const getRoomWithParticipants = async (
  roomId: string,
  userId?: string,
  role?: UserRole
) => {
  const room = await prisma.chatRoom.findUnique({
    where: { id: roomId },
    include: chatRoomInclude,
  });
  if (!room) {
    throw new AppError(httpStatus.NOT_FOUND, "Chat room not found");
  }
  return room;
};
const getPresenceLookup = async (userIds: string[]) => {
  const presences = await prisma.userPresence.findMany({
    where: {
      userId: { in: userIds },
    },
  });

  return new Map(presences.map((presence) => [presence.userId, presence]));
};


const formatAttachment = (attachment: Attachment | null) => {
  if (!attachment) {
    return null;
  }

  return {
    ...attachment,
    url: attachment.fileUrl,
    mimeType: attachment.fileType,
    size: attachment.fileSize,
  };
};

const formatReactions = (
  reactions: MessageReactionWithUser[],
  currentUserId?: string
) => {
  const grouped = new Map<
    string,
    {
      emoji: string;
      count: number;
      reactedByCurrentUser: boolean;
      users: Array<{
        userId: string;
        name: string;
        email: string;
        image: string | null;
      }>;
    }
  >();

  for (const reaction of reactions) {
    const existing = grouped.get(reaction.emoji);

    if (existing) {
      existing.count += 1;
      existing.reactedByCurrentUser ||= reaction.userId === currentUserId;
      existing.users.push({
        userId: reaction.userId,
        name: reaction.user.name,
        email: reaction.user.email,
        image: reaction.user.image,
      });
    } else {
      grouped.set(reaction.emoji, {
        emoji: reaction.emoji,
        count: 1,
        reactedByCurrentUser: reaction.userId === currentUserId,
        users: [{
          userId: reaction.userId,
          name: reaction.user.name,
          email: reaction.user.email,
          image: reaction.user.image,
        }],
      });
    }
  }
  return Array.from(grouped.values());
};

const formatRoom = async (room: any, currentUserId?: string) => {
  const participants = await buildParticipants(room);
  const latestMessage = room.messages && room.messages[0]
    ? formatMessage(room.messages[0], participants, currentUserId)
    : null;
  return {
    ...room,
    participants,
    lastMessage: latestMessage,
    unreadCount: 0,
  };
};

const ensureRoomAccess = async (roomId: string, userId: string, role: UserRole) => {
  const room = await getRoomWithParticipants(roomId);
  if (role === UserRole.ADMIN) return room;
  let allowedUserId: string | undefined;
  if (role === UserRole.CANDIDATE) allowedUserId = room.jobSeekerId ?? undefined;
  if (role === UserRole.RECRUITER) allowedUserId = room.recruiterId ?? undefined;
  if (allowedUserId !== userId) {
    throw new AppError(httpStatus.FORBIDDEN, "Forbidden access to this chat room");
  }
  return room;
};

const getRecipientUserIdForRoom = (
  room: any,
  senderRole: UserRole
) => (senderRole === UserRole.CANDIDATE ? room.recruiterId ?? null : room.jobSeekerId ?? null);

const getRoomRealtimeTargets = async (
  roomId: string,
  senderRole?: UserRole,
  userId?: string
) => {
  const room = await getRoomWithParticipants(roomId);
  return {
    roomId: room.id,
    candidateUserId: room.jobSeekerId ?? null,
    recruiterUserId: room.recruiterId ?? null,
    recipientUserId: senderRole ? getRecipientUserIdForRoom(room, senderRole) : null,
  };
};

const getMessageForRoom = async (roomId: string, messageId: string) => {
  const message = await prisma.message.findFirst({
    where: { id: messageId, roomId },
    include: messageFullInclude,
  });

  if (!message) {
    throw new AppError(httpStatus.NOT_FOUND, "Message not found");
  }

  return message;
};



const getRoomMessages = async (roomId: string, userId: string, role: UserRole) => {
  const room = await ensureRoomAccess(roomId, userId, role);
  const participants = await buildParticipants(room);
  const messages = await prisma.message.findMany({
    where: { roomId: room.id },
    include: messageFullInclude,
    orderBy: { createdAt: "asc" },
  });
  return {
    roomId: room.id,
    resolvedFromStaleId: room.id !== roomId,
    messages: messages.map((message) => formatMessage(message, participants, userId)),
  };
};

const updateRoomTimestamp = async (roomId: string) => {
  return prisma.chatRoom.update({
    where: { id: roomId },
    data: { updatedAt: new Date() },
  });
};

const createTextMessage = async (
  roomId: string,
  senderId: string,
  senderRole: UserRole,
  text: string
) => {
  if (!text?.trim()) {
    throw new AppError(httpStatus.BAD_REQUEST, "Message text is required");
  }

  const room = await ensureRoomAccess(roomId, senderId, senderRole);

  const message = await prisma.message.create({
    data: {
      roomId: room.id,
      senderId,
      senderRole,
      type: MessageType.TEXT,
      text: text.trim(),
    },
    include: messageFullInclude,
  });

  await updateRoomTimestamp(room.id);
  // notifyRecipient(room.id, senderId, senderRole, "You have a new chat message.");
  const participants = await buildParticipants(room);

  return {
    roomId: room.id,
    resolvedFromStaleId: room.id !== roomId,
    message: formatMessage(message, participants, senderId),
  };
};

const createFileMessage = async (
  roomId: string,
  senderId: string,
  senderRole: UserRole,
  attachmentData: AttachmentInput
) => {
  const room = await ensureRoomAccess(roomId, senderId, senderRole);

  const message = await prisma.message.create({
    data: {
      roomId: room.id,
      senderId,
      senderRole,
      type: MessageType.FILE,
      text: attachmentData.fileName,
      attachment: {
        create: {
          fileUrl: attachmentData.fileUrl,
          fileName: attachmentData.fileName,
          fileType: attachmentData.fileType,
          fileSize: attachmentData.fileSize,
        },
      },
    },
    include: messageFullInclude,
  });

  await updateRoomTimestamp(room.id);
  // notifyRecipient(room.id, senderId, senderRole, "You received a file in chat.");
  const participants = await buildParticipants(room);

  return {
    roomId: room.id,
    resolvedFromStaleId: room.id !== roomId,
    message: formatMessage(message, participants, senderId),
  };
};

const toggleMessageReaction = async (
  roomId: string,
  messageId: string,
  userId: string,
  role: UserRole,
  emoji: string
) => {
  const normalizedEmoji = emoji.trim();

  if (!normalizedEmoji) {
    throw new AppError(httpStatus.BAD_REQUEST, "Emoji is required");
  }

  if (normalizedEmoji.length > 32) {
    throw new AppError(httpStatus.BAD_REQUEST, "Emoji is too long");
  }

  const room = await ensureRoomAccess(roomId, userId, role);
  const message = await getMessageForRoom(room.id, messageId);

  const existingReaction = await prisma.messageReaction.findUnique({
    where: {
      messageId_userId_emoji: {
        messageId: message.id,
        userId,
        emoji: normalizedEmoji,
      },
    },
  });

  if (existingReaction) {
    await prisma.messageReaction.delete({
      where: { id: existingReaction.id },
    });
  } else {
    await prisma.messageReaction.create({
      data: {
        messageId: message.id,
        userId,
        emoji: normalizedEmoji,
      },
    });
  }

  const updatedMessage = await getMessageForRoom(room.id, message.id);
  const participants = await buildParticipants(room);

  return {
    roomId: room.id,
    resolvedFromStaleId: room.id !== roomId,
    messageId: message.id,
    emoji: normalizedEmoji,
    action: existingReaction ? "removed" : "added",
    reactions: formatReactions(updatedMessage.reactions, userId),
    message: formatMessage(updatedMessage, participants, userId),
  };
};



const deleteMessage = async (roomId: string, messageId: string, userId: string, role: UserRole) => {
  // Ensure user has access to the room
  await ensureRoomAccess(roomId, userId, role);
  // Delete the message
  const deleted = await prisma.message.delete({
    where: { id: messageId },
  });
  return deleted;
};


// Fetch all chat rooms for a user (or all rooms for admin)
const getUserRooms = async (userId: string, role: UserRole, recruiterId?: string) => {
  if (role === UserRole.ADMIN) {
    // Optionally filter by recruiterId if provided
    const where: any = recruiterId ? { recruiterId } : {};
    const rooms = await prisma.chatRoom.findMany({
      where,
      include: chatRoomInclude,
      orderBy: { updatedAt: "desc" },
    });
    // Optionally format rooms with participants/lastMessage
    return Promise.all(rooms.map((room) => formatRoom(room)));
  }
  // For recruiter or candidate, fetch rooms where user is a participant
  const where = role === UserRole.RECRUITER
    ? { recruiterId: userId }
    : { jobSeekerId: userId };
  const rooms = await prisma.chatRoom.findMany({
    where,
    include: chatRoomInclude,
    orderBy: { updatedAt: "desc" },
  });
  return Promise.all(rooms.map((room) => formatRoom(room, userId)));
};

export const chatService = {
  getRoomMessages,
  createTextMessage,
  createFileMessage,
  toggleMessageReaction,
  updateRoomTimestamp,
  getRoomRealtimeTargets,
  deleteMessage,
  getUserRooms,
};

