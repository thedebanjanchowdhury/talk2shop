const { z } = require("zod");

const createProduct = z.object({
  body: z.object({
    title: z
      .string()
      .min(3, "Title must be at least 3 characters")
      .max(150, "Title must be at most 50 characters"),
    description: z.string().optional(),
    category: z
      .string()
      .min(1, "Category must be at least 1 character")
      .max(50, "Category must be at most 50 characters")
      .optional(),
    subcategory: z
      .string()
      .min(1, "Category must be at least 1 character")
      .max(50, "Category must be at most 50 characters")
      .optional(),
    price: z.coerce.number().nonnegative(),
    stock: z.coerce
      .number()
      .int()
      .min(1, "Stock must be at least 1")
      .max(1000, "Stock must be at most 1000")
      .nonnegative()
      .optional(),
  }),
});

const updateProduct = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId"),
  }),
  body: z.object({
    title: z
      .string()
      .min(3, "Title must be at least 3 characters")
      .max(150, "Title must be at most 50 characters")
      .optional(),
    description: z.string().optional(),
    category: z
      .string()
      .min(1, "Category must be at least 1 character")
      .max(50, "Category must be at most 50 characters")
      .optional(),
    subcategory: z
      .string()
      .min(1, "Category must be at least 1 character")
      .max(50, "Category must be at most 50 characters")
      .optional(),
    price: z.coerce.number().nonnegative().optional(),
    stock: z.coerce
      .number()
      .int()
      .min(1, "Stock must be at least 1")
      .max(1000, "Stock must be at most 1000")
      .nonnegative()
      .optional(),
  }),
});

module.exports = { createProduct, updateProduct };
