import { Request, Response } from "express";
import { openai } from "../../../lib/openai";

export const jobRecommendationsController = async (req: Request, res: Response) => {
  const { userProfile, jobList } = req.body;
  const prompt = `
Given this user profile: ${JSON.stringify(userProfile)}
and these jobs: ${JSON.stringify(jobList)},
recommend the top 5 jobs for this user. Respond as a JSON array of job IDs.
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
  });

  const result = completion.choices[0].message.content;
  res.json({ recommendations: JSON.parse(result || "[]") });
};
