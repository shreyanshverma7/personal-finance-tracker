import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const transactionSchema = z.object({
  amount: z.coerce.number().positive("Amount must be positive"),
  date: z.coerce.date(),
  description: z.string().min(1, "Description is required"),
  type: z.enum(["INCOME", "EXPENSE"]),
  categoryId: z.string().min(1, "Category is required"),
  accountId: z.string().optional(),
  notes: z.string().optional(),
});

export const transactionFormSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  date: z.date(),
  description: z.string().min(1, "Description is required"),
  type: z.enum(["INCOME", "EXPENSE"]),
  categoryId: z.string().min(1, "Category is required"),
  accountId: z.string().optional(),
  notes: z.string().optional(),
});

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["INCOME", "EXPENSE"]),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid hex color"),
  icon: z.string().optional(),
});

export const accountSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name is too long"),
  type: z.enum(["BANK", "UPI", "CREDIT_CARD"]),
  initialBalance: z.coerce.number(),
});

export const accountFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name is too long"),
  type: z.enum(["BANK", "UPI", "CREDIT_CARD"]),
  initialBalance: z.number(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type TransactionInput = z.infer<typeof transactionFormSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type AccountInput = z.infer<typeof accountFormSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
