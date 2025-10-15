const { z } = require("zod");

const addItem = z.object({
  body: z.object({
    cartName: z.string().optional(),
    product: z.string().min(1),
    quantity: z.coerce.number().int().min(1),
  }),
});

const createCart = z.object({
  body: z.object({
    name: z.string().min(1),
  }),
});

module.exports = { addItem, createCart };
