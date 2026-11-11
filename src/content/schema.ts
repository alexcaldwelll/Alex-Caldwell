import { z } from 'zod';

const calendarDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value => {
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
}, 'Expected a valid calendar date');
const imagePath = z.string().trim().min(1).refine(value => value.startsWith('/') && !value.startsWith('//') || /^https:\/\//.test(value), 'Use a local absolute path or HTTPS image');
export const postMetadataSchema = z.object({
  title: z.string().trim().min(1),
  date: calendarDate,
  excerpt: z.string().trim().min(1),
  tags: z.array(z.string().trim().min(1)).optional(),
  coverImage: imagePath.optional(),
});
export type BlogPost = z.infer<typeof postMetadataSchema> & { slug: string; content: string };
