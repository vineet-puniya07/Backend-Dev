# Exercise 3: Build a User Activity Tracker

This Mongoose setup tracks login time, logout time, and the last active timestamp.

```js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    lastLoginAt: { type: Date, default: null },
    lastLogoutAt: { type: Date, default: null },
    lastActiveAt: { type: Date, default: null },
    isLoggedIn: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.pre('save', function (next) {
  if (this.isModified('isLoggedIn')) {
    this.lastActiveAt = new Date();

    if (this.isLoggedIn && !this.lastLoginAt) {
      this.lastLoginAt = new Date();
    }

    if (!this.isLoggedIn) {
      this.lastLogoutAt = new Date();
    }
  }

  next();
});

userSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate() || {};
  const setFields = update.$set || update;

  setFields.lastActiveAt = new Date();

  if (setFields.isLoggedIn === true) {
    setFields.lastLoginAt = new Date();
  }

  if (setFields.isLoggedIn === false) {
    setFields.lastLogoutAt = new Date();
  }

  if (update.$set) {
    update.$set = setFields;
  } else {
    Object.assign(update, setFields);
  }

  this.setUpdate(update);
  next();
});

const User = mongoose.model('User', userSchema);

async function markLogin(userId) {
  return User.findByIdAndUpdate(
    userId,
    { $set: { isLoggedIn: true, lastActiveAt: new Date(), lastLoginAt: new Date() } },
    { new: true }
  );
}

async function markLogout(userId) {
  return User.findByIdAndUpdate(
    userId,
    { $set: { isLoggedIn: false, lastActiveAt: new Date(), lastLogoutAt: new Date() } },
    { new: true }
  );
}

module.exports = {
  User,
  markLogin,
  markLogout,
};
```

## Notes

- `lastActiveAt` is refreshed whenever the user document is updated through the model.
- The `markLogin` and `markLogout` helpers keep the intent explicit while the middleware preserves consistency.
