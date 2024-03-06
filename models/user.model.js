const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: [true, "Username must be unique"],
    },
    email: {
      type: String,
      required: true,
      unique: [true, "email already exists"],
    },
    password: {
      type: String,
      required: [true, "Password can't be empty"],
    },
    bio: {
      type: String,
    },
    avatar: {
      type: String,
    },
    otp: {
      type: String,
    },
    otpExpTime: {
      type: Date,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    accountMode : {
      type : String,
      enum : ["public" , "private"],
      default : "public"
    },

    resetToken: String,
    resetTokenExpTime: Date,
    passwordChangedAt: Date,
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
