const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Product' },
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    contentHtml: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Review', reviewSchema);
