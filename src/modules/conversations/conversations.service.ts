import { UserRole} from "../../generated/client";
import { chatService } from "../chat/chat.service";

const getAllConversationsForAdmin = async (recruiterId?: string) => {
	return chatService.getUserRooms("", UserRole.ADMIN, recruiterId);
};

export const conversationsService = {
	getAllConversationsForAdmin,
};
