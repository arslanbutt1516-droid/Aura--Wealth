import { z } from "zod";

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name cannot exceed 100 characters")
      .trim(),
    email: z
      .string()
      .email("Please enter a valid email address")
      .toLowerCase()
      .trim(),
    phone: z
      .string()
      .regex(/^(\+92|0)?[0-9]{10}$/, "Please enter a valid Pakistani phone number")
      .optional()
      .or(z.literal("")),
    whatsappNumber: z
      .string()
      .optional()
      .or(z.literal("")),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
    preferredCurrency: z.string().default("PKR"),
    notificationPreferences: z
      .object({
        email: z.boolean().default(true),
        inApp: z.boolean().default(true),
        whatsapp: z.boolean().default(false),
      })
      .optional(),
    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: "You must accept the terms and privacy policy" }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email").toLowerCase().trim(),
  password: z.string().min(1, "Password is required"),
});

export const addBondSchema = z.object({
  bondNumber: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Bond number must be exactly 6 digits"),
  denomination: z
    .number()
    .refine((v) => [100, 200, 750, 1500, 25000, 40000].includes(v), {
      message: "Invalid denomination",
    }),
  purchaseDate: z.string().optional(),
  notes: z.string().max(500).optional(),
});

export const checkBondSchema = z.object({
  bondNumber: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Bond number must be exactly 6 digits"),
  denomination: z
    .number()
    .refine((v) => [100, 200, 750, 1500, 25000, 40000].includes(v), {
      message: "Invalid denomination",
    }),
});

export const convertCurrencySchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  from: z.string().min(3).max(5).toUpperCase(),
  to: z.string().min(3).max(5).toUpperCase(),
});

export const currencyAlertSchema = z.object({
  baseCurrency: z.string().min(3).max(5).toUpperCase(),
  targetCurrency: z.string().min(3).max(5).toUpperCase(),
  targetRate: z.number().positive("Target rate must be positive"),
  direction: z.enum(["above", "below"]),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  phone: z.string().optional(),
  whatsappNumber: z.string().optional(),
  preferredCurrency: z.string().optional(),
  favoriteCurrencies: z.array(z.string()).optional(),
});

export const updateNotificationPrefsSchema = z.object({
  email: z.boolean().optional(),
  inApp: z.boolean().optional(),
  whatsapp: z.boolean().optional(),
  prizeWin: z.boolean().optional(),
  upcomingDraw: z.boolean().optional(),
  drawResult: z.boolean().optional(),
  currencyAlert: z.boolean().optional(),
  accountActivity: z.boolean().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type AddBondInput = z.infer<typeof addBondSchema>;
export type CheckBondInput = z.infer<typeof checkBondSchema>;
export type ConvertCurrencyInput = z.infer<typeof convertCurrencySchema>;
export type CurrencyAlertInput = z.infer<typeof currencyAlertSchema>;
