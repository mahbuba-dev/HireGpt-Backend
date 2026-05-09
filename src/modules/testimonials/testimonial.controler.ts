
import { Request, Response } from "express";
import { testimonialService } from "./testimonial.service";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponsr";

export const testimonialController = {
	create: catchAsync(async (req: Request, res: Response) => {
		const testimonial = await testimonialService.createTestimonial(req.body);
		sendResponse(res, {
			httpStatusCode: 201,
			success: true,
			message: "Testimonial created successfully",
			data: testimonial,
		});
	}),

	getAll: catchAsync(async (_req: Request, res: Response) => {
		const testimonials = await testimonialService.getAllTestimonials();
		sendResponse(res, {
			httpStatusCode: 200,
			success: true,
			message: "Testimonials fetched successfully",
			data: testimonials,
		});
	}),

	getById: catchAsync(async (req: Request, res: Response) => {
		const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
		const testimonial = await testimonialService.getTestimonialById(id);
		sendResponse(res, {
			httpStatusCode: 200,
			success: true,
			message: "Testimonial fetched successfully",
			data: testimonial,
		});
	}),

	update: catchAsync(async (req: Request, res: Response) => {
		const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
		const testimonial = await testimonialService.updateTestimonial(id, req.body);
		sendResponse(res, {
			httpStatusCode: 200,
			success: true,
			message: "Testimonial updated successfully",
			data: testimonial,
		});
	}),

	delete: catchAsync(async (req: Request, res: Response) => {
		const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
		await testimonialService.deleteTestimonial(id);
		sendResponse(res, {
			httpStatusCode: 200,
			success: true,
			message: "Testimonial deleted successfully",
		});
	}),
};
