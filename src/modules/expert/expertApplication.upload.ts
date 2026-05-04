import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";

import { cloudinaryUpload } from "../../config/cloudinary.config";

const allowedResumeMimeTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const allowedImageMimeTypes = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const storage = new CloudinaryStorage({
  cloudinary: cloudinaryUpload,
  params: async (_req, file) => {
    const originalName = file.originalname;
    const extension = originalName.split(".").pop()?.toLowerCase();
    const fileNameWithoutExtension = originalName
      .split(".")
      .slice(0, -1)
      .join(".")
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9/-]/g, "");

    const uniqueName = `${Math.random().toString(36).substring(2)}-${Date.now()}-${fileNameWithoutExtension}`;

    let folder = "documents";
    if (file.fieldname === "profilePhoto") {
      folder = "expert-profile-photos";
    } else if (file.fieldname === "resume") {
      folder = extension === "pdf" ? "resumes" : "documents";
    }

    return {
      folder: `consultedge/${folder}`,
      public_id: uniqueName,
      resource_type: "auto",
    };
  },
});

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  if (file.fieldname === "profilePhoto") {
    if (!allowedImageMimeTypes.has(file.mimetype)) {
      cb(new Error("Invalid profile photo type. Allowed: JPG, PNG, WEBP, GIF"));
      return;
    }
    cb(null, true);
    return;
  }

  if (file.fieldname === "resume") {
    if (!allowedResumeMimeTypes.has(file.mimetype)) {
      cb(new Error("Invalid resume type. Allowed: PDF, DOC, DOCX"));
      return;
    }
    cb(null, true);
    return;
  }

  // Unknown field — reject explicitly so we never silently swallow it
  cb(new Error(`Unexpected file field: ${file.fieldname}`));
};

export const expertApplicationUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

type CloudinaryMulterFile = Express.Multer.File & {
  path?: string;
  secure_url?: string;
};

export const mapUploadedResume = (file: Express.Multer.File) => {
  const cloudinaryFile = file as CloudinaryMulterFile;
  const resumeUrl = cloudinaryFile.path ?? cloudinaryFile.secure_url;

  if (!resumeUrl) {
    throw new Error("Failed to resolve uploaded resume URL from Cloudinary");
  }

  return {
    resumeUrl,
    resumeFileName: file.originalname,
    resumeFileType: file.mimetype,
    resumeFileSize: file.size,
  };
};

export const mapUploadedProfilePhoto = (file: Express.Multer.File) => {
  const cloudinaryFile = file as CloudinaryMulterFile;
  return cloudinaryFile.path ?? cloudinaryFile.secure_url ?? null;
};