export const reqruiterSearchableFields = [
  "fullName",
  "email",
  "title",
  "bio",
  "phone",
  "industry.name",
];

export const reqruiterFilterableFields = [
  "isVerified",
  "industryId",
  "experience",
  "price",
  "isDeleted",
];

export const reqruiterIncludeConfig = {
  user: true,
  industry: true,
  schedules: {
    include: { schedule: true },
  },
  consultations: {
    include: {
      candidate: true,
      reqruiterSchedule: true,
    },
  },
  testimonials: true,
  verification: true,
};