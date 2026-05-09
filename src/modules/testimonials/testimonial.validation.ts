import { z } from "zod";

export const createTestimonialSchema = z.object({
  body: z.object({
    userId: z.string().uuid(),
    userRole: z.enum(["CANDIDATE", "RECRUITER"]),
    content: z.string().min(1),
    rating: z.number().int().min(1).max(5),
    meta: z.string().optional(),
  }),
});

export const updateTestimonialSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    content: z.string().min(1).optional(),
    rating: z.number().int().min(1).max(5).optional(),
    meta: z.string().optional(),
  }),
});

export const testimonialIdSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});
