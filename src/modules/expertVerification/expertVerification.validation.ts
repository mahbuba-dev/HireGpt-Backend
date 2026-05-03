import z from "zod";

export const submitApplicationValidationSchema = z.object({
  body: z.object({
    fullName: z.string().trim().min(1).optional(),
    email: z.string().trim().email().optional(),
    phone: z.string().trim().optional(),
    bio: z.string().trim().optional(),
    title: z.string().trim().optional(),
    experience: z.coerce.number().int().min(0).optional(),
    consultationFee: z.coerce.number().int().min(1).optional(),
    industryId: z.string().uuid().optional(),
    profilePhoto: z.string().trim().optional(),
    resume: z
      .object({
        resumeUrl: z.string().url(),
        resumeFileName: z.string().trim().min(1),
        resumeFileType: z.string().trim().min(1),
        resumeFileSize: z.coerce.number().int().min(1),
      })
      .optional(),
  }),
});

export const verifyExpertValidationSchema = z.object({
  body: z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"])
  .refine((v) => !!v, { message: "Verification status is required" }),
notes: z.string().optional(),
  }),
});

export const reviewApplicationValidationSchema = z.object({
  body: z.object({
    status: z.enum(["APPROVED", "REJECTED"]),
    notes: z.string().max(1000).optional(),
  }),
  params: z.object({
    id: z.string().uuid("Application ID must be a valid UUID"),
  }),
});

export const applicationIdParamValidationSchema = z.object({
  params: z.object({
    id: z.string().uuid("Application ID must be a valid UUID"),
  }),
});

export const adminApplicationsListValidationSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    searchTerm: z.string().trim().optional(),
    status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
    industryId: z.string().uuid().optional(),
    reviewedBy: z.string().optional(),
    sortBy: z.enum(["createdAt", "updatedAt", "reviewedAt", "fullName"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
  }),
});

export const adminNewApplicantsListValidationSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    searchTerm: z.string().trim().optional(),
    industryId: z.string().uuid().optional(),
    reviewedBy: z.string().optional(),
    sortBy: z.enum(["createdAt", "updatedAt", "reviewedAt", "fullName"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
  }),
});

export const applicationResumeAccessValidationSchema = z.object({
  params: z.object({
    id: z.string().uuid("Application ID must be a valid UUID"),
  }),
  query: z.object({
    download: z.enum(["true", "false"]).optional(),
  }),
});