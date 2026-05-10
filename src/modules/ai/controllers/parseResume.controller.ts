import { Request, Response } from "express";
import { openai } from "../../../lib/openai";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

export const parseResumeController = async (req: Request, res: Response) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: "No resume file uploaded" });


  let resumeText = "";
  if (file.mimetype === "application/pdf") {
    const parser = new PDFParse({ data: file.buffer });
    await parser.parse();
    resumeText = parser.text;
    await parser.destroy();
  } else if (
    file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({ buffer: file.buffer });
    resumeText = result.value;
  } else {
    return res.status(400).json({ error: "Unsupported file type" });
  }

  const prompt = `
Extract the following from this resume:
- Full Name
- Email
- Phone
- Skills (as array)
- Experience (as array of {company, title, years})
- Education (as array)
Resume:
${resumeText}
Respond in JSON.
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
  });

  const result = completion.choices[0].message.content;
  res.json({ parsed: JSON.parse(result || "{}") });
};
