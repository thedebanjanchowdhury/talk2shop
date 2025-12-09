const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

/**
 * User Schema
 * @param {String} name - The name of the user
 * @param {String} email - The email of the user
 * @param {String} password - The password of the user
 * @param {String} address - The address of the user
 * @param {String} mobile - The mobile number of the user
 * @param {Boolean} isAdmin - The admin status of the user
 * @param {Date} createdAt - The creation date of the user
 */
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  address: { type: String },
  mobile: { type: String }, // Add mobile field
  isAdmin: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

/**
 * The `pre-save` hook is used to hash the user's password before it is saved to the database.
 * @param {Function} next - The next middleware function
 */
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/**
 * Compares the provided password with the user's password.
 * @param {String} candidate - The password to compare
 * @returns {Boolean} - True if the passwords match, false otherwise
 */
userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model("User", userSchema);
