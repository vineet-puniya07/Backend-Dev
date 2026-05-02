const { z } = require('zod');
const Product = require('../models/Product');

const searchSchema = z.object({
  q: z.string().max(80).optional(),
});

function escapeRegex(input) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function search(req, res, next) {
  try {
    const { q } = searchSchema.parse(req.query);

    // Injection-safe query: strictly build filters, avoid passing user objects.
    const filter = { price: { $gte: 0 } };

    if (q && q.trim()) {
      const safe = escapeRegex(q.trim());
      filter.name = { $regex: safe, $options: 'i' };
    }

    const products = await Product.find(filter).select('name price description').limit(20).lean();
    res.json({ products });
  } catch (err) {
    return next(err);
  }
}

module.exports = { search };
