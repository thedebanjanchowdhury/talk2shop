const { z } = require("zod");

const register = z.object({
  body: z.object({
    name: z
      .string()
      .min(3, "Name must be at least 3 characters")
      .max(50, "Name must be at most 50 characters"),
    email: z.email(),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(50, "Password must be at most 50 characters"),
    address: z.string().optional(),
    isAdmin: z.boolean().optional().default(false),
  }),
});

const login = z.object({
  body: z.object({
    email: z.string().email(),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(50, "Password must be at most 50 characters"),
  }),
});

module.exports = { register, login };
