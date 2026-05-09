

import { prisma } from "../../lib/prisma";
import type { Testimonial } from "../../generated/client";

export const testimonialService = {
  async createTestimonial(data: Omit<Testimonial, "id" | "createdAt" | "updatedAt">) {
    return prisma.testimonial.create({ data });
  },

  async getAllTestimonials() {
    return prisma.testimonial.findMany({
      include: { user: true },
      orderBy: { createdAt: "desc" },
    });
  },

  async getTestimonialById(id: string) {
    return prisma.testimonial.findUnique({
      where: { id },
      include: { user: true },
    });
  },

  async updateTestimonial(id: string, data: Partial<Omit<Testimonial, "id" | "userId" | "createdAt" | "updatedAt">>) {
    return prisma.testimonial.update({
      where: { id },
      data,
    });
  },

  async deleteTestimonial(id: string) {
    return prisma.testimonial.delete({ where: { id } });
  },
};
