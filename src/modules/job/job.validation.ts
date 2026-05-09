import { z } from 'zod';

export const createJobSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(10),
  company: z.string().min(2),
  location: z.string().min(2),
  salary: z.number().optional(),
  category: z.string().optional(),
  tags: z.array(z.string().min(1)).optional(),
});

export const updateJobSchema = createJobSchema.partial();