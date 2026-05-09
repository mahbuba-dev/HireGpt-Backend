// Job entity TypeScript interface
export interface Job {
  id: string;
  title: string;
  description: string;
  company: string;
  location: string;
  salary?: number;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}