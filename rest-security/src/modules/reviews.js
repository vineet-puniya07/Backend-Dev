const { z } = require('zod');
const Review = require('../models/Review');
const { sanitizeUserHtml, htmlPolicies } = require('../security/sanitize');

const createReviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  content: z.string().min(1).max(2000),
});

async function createReview(req, res, next) {
  try {
    const body = createReviewSchema.parse(req.body);

    const contentHtml = sanitizeUserHtml(body.content, htmlPolicies.review);

    const review = await Review.create({
      productId: body.productId,
      userId: req.session.user.id,
      rating: body.rating,
      contentHtml,
    });

    res.status(201).json({ id: String(review._id) });
  } catch (err) {
    return next(err);
  }
}

async function listReviews(req, res, next) {
  try {
    const productId = String(req.query.productId || '');
    if (!productId) return res.status(400).json({ error: 'productId required' });

    const reviews = await Review.find({ productId }).select('rating contentHtml userId').sort({ createdAt: -1 }).limit(50).lean();
    res.json({ reviews });
  } catch (err) {
    return next(err);
  }
}

module.exports = { createReview, listReviews };
