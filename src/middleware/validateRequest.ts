



 // support any zod schema

import { NextFunction, Request, Response } from "express"
import { ZodType } from "zod"

const replaceObjectContents = (target: Record<string, unknown>, source: unknown) => {
  Object.keys(target).forEach((key) => {
    delete target[key]
  })

  if (source && typeof source === "object") {
    Object.assign(target, source as Record<string, unknown>)
  }
}

export const validateRequest = (zodSchema: ZodType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (typeof req.body?.data === "string") {
        req.body = JSON.parse(req.body.data)
      }

      // Ensure schema validation always receives an object for body
      const normalizedBody = req.body ?? {}

      const requestData = {
        body: normalizedBody,
        query: req.query,
        params: req.params,
      }

      const wrappedResult = zodSchema.safeParse(requestData)

      if (wrappedResult.success) {
        const parsedData = wrappedResult.data as {
          body?: unknown
          query?: unknown
          params?: unknown
        }

        if (parsedData.body !== undefined) {
          req.body = parsedData.body as Request["body"]
        }

        if (parsedData.query !== undefined) {
          replaceObjectContents(
            req.query as unknown as Record<string, unknown>,
            parsedData.query
          )
        }

        if (parsedData.params !== undefined) {
          replaceObjectContents(
            req.params as unknown as Record<string, unknown>,
            parsedData.params
          )
        }

        return next()
      }

      const bodyOnlyResult = zodSchema.safeParse(normalizedBody)

      if (!bodyOnlyResult.success) {
        return next(bodyOnlyResult.error)
      }

      req.body = bodyOnlyResult.data
      next()
    } catch (error) {
      next(error)
    }
  }
}



// import { NextFunction, Request, Response } from "express";
// import { ZodObject } from "zod";

// export const validateRequest = (schema: ZodObject<any>) => {
//   return (req: Request, res: Response, next: NextFunction) => {
//     try {
//       // If frontend sends multipart/form-data with a "data" field (stringified JSON)
//       if (req.body && typeof req.body.data === "string") {
//         req.body = JSON.parse(req.body.data);
//       }

//       // Merge file if exists (multer)
//       const finalData = {
//         ...req.body,
//         ...(req.file && { file: req.file }),
//       };

//       const parsed = schema.parse(finalData);

//       req.body = parsed;
//       next();
//     } catch (error) {
//       next(error);
//     }
//   };
// };