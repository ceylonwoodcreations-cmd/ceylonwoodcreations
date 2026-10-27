import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(3).max(50).trim(),
  password: z.string().min(6).max(100),
});

export const productSchema = z.object({
  title: z.string().min(2, "Title is too short").max(150, "Title is too long").trim(),
  category: z.enum([
    "පිළිම සහ ප්‍රතිමා",
    "බිත්ති සැරසිලි",
    "සිහිවටන (Souvenirs)",
    "වෙනත් නිර්මාණ (Other)"
  ]),
  wood: z.string().min(2).max(100).trim(),
  price: z.coerce.number().positive("Price must be a positive number").max(10000000),
  image: z.string().url("Must be a valid image URL").trim(),
  description: z.string().max(1000).optional().default(""),
});

export const inquirySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100).trim(),
  phone: z.string().min(9, "Valid phone number required").max(20).trim(),
  wood: z.string().min(2).max(100).trim(),
  description: z.string().min(5, "Please provide more details").max(2000).trim(),
});
