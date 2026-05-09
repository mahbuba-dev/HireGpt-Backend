
import { Router } from "express";
import { testimonialController } from "./testimonial.controler";
import { validateRequest } from "../../middleware/validateRequest";
import {
	createTestimonialSchema,
	updateTestimonialSchema,
	testimonialIdSchema,
} from "./testimonial.validation";

const router = Router();

router.post(
	"/",
	validateRequest(createTestimonialSchema),
	testimonialController.create
);

router.get("/", testimonialController.getAll);

router.get(
	"/:id",
	validateRequest(testimonialIdSchema),
	testimonialController.getById
);

router.put(
	"/:id",
	validateRequest(updateTestimonialSchema),
	testimonialController.update
);

router.delete(
	"/:id",
	validateRequest(testimonialIdSchema),
	testimonialController.delete
);

export const testimonialRouter = router;
