# Exercise 4: Create a Soft Delete System

This Mongoose plugin keeps deleted records in the database by marking them as deleted and automatically excludes them from normal queries.

```js
const mongoose = require('mongoose');

function softDeletePlugin(schema) {
  schema.add({
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  });

  schema.pre(/^find/, function (next) {
    this.where({ isDeleted: false });
    next();
  });

  schema.pre('aggregate', function (next) {
    this.pipeline().unshift({ $match: { isDeleted: false } });
    next();
  });

  schema.methods.softDelete = function () {
    this.isDeleted = true;
    this.deletedAt = new Date();
    return this.save();
  };

  schema.methods.restore = function () {
    this.isDeleted = false;
    this.deletedAt = null;
    return this.save();
  };

  schema.statics.softDeleteById = function (id) {
    return this.findByIdAndUpdate(id, {
      $set: { isDeleted: true, deletedAt: new Date() },
    });
  };
}

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    body: { type: String, required: true },
  },
  { timestamps: true }
);

postSchema.plugin(softDeletePlugin);

const Post = mongoose.model('Post', postSchema);

module.exports = { Post, softDeletePlugin };
```

## Notes

- The `pre(/^find/)` middleware hides deleted documents from standard queries.
- The `aggregate` middleware keeps reports and pipelines aligned with the same rule.
- Use `softDelete()` or `softDeleteById()` instead of calling hard delete methods in application code.
