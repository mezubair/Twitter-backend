const User = require("../models/user.model");
const RevToken = require("../models/revokedTokens.model");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendVerifcationEmail");
const sendPasswordResetLink = require("../utils/SendResetPasswordLink");
require("dotenv").config();

exports.register = async (req, res) => {
  try {
    const { name, password, confirmPassword, email, username } = req.body;

    if (password !== confirmPassword)
      res.json("password and confirmPassword didn't match");
    console.log("🚀 ~ exports.register= ~ password:", password);
    const hashedPassword = await bcrypt.hash(password, 10);

    //logic for sending  email verfication

    const otp = Math.floor(Math.random() * 1000000);
    await sendEmail({
      email,
      message: `Use this otp "${otp}" to verify your email`,
    });
    const hashedOtp = await bcrypt.hash(otp.toString(), 10);
    const newUser = await User.create({
      name,
      password: hashedPassword,
      email,
      username,
      otp: hashedOtp,
      otpExpTime: Date.now() + 10 * 60 * 1000,
    });
    res
      .status(201)
      .json(
        "You have been sucessfully registerd ! Please verify your email address"
      );
  } catch (error) {
    res.status(500).json({ error: "Oops, something went wrong" });
  }
};

exports.verify = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json("User not found");
    }
    if (Date.now() > user.otpExpTime) {
      return res.send(401).json("oops Otp Expired ⌛");
    }
    const isValid = await bcrypt.compare(otp, user.otp);
    if (isValid) {
      user.emailVerified = true;
      user.otp = undefined;
      user.otpExpTime = undefined;
      await user.save();
      return res.json("Yipeee! Email verified ✔");
    }

    return res.status(400).json("Wrong OTP 🤷‍♂️");
  } catch (error) {
    console.error("Error verifying email:", error);
    return res.status(500).json("Oops, something went wrong");
  }
};

exports.signIn = async (req, res) => {
  try {
    const { email, username, password } = req.body;

    const user = await User.findOne({ $or: [{ email }, { username }] });

    if (!user)
      return res.status(401).json("invalid crendentials or user not found");
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid)
      return res.status(401).json("invalid crendentials or user not found");
    const token = jwt.sign({ userId: user._id }, process.env.MY_SECRET_KEY);
    console.log("🚀 ~ exports.signIn= ~ token:", token);

    res.status(200).json({ status: "success", token: token });
  } catch (error) {
    res.status(500).json({ status: "fail", message: "Internal server error " });
  }
};

exports.forgetPassword = async (req, res) => {
  try {
    const { email, username } = req.body;
    const user = await User.findOne({ $or: [{ email }, { username }] });
    if (!user)
      return res
        .status(401)
        .json({ status: "fail", message: "USER NOT FOUND" });

    //GENERATE RESET TOKEN

    const resToken = crypto.randomBytes(32).toString("hex");
    user.resetToken = resToken;
    user.resetTokenExpTime = Date.now() + 10 * 60 * 1000;

    await user.save();

    const url = `${req.protocol}://${req.get(
      "host"
    )}/user/resetPassword/${resToken}`;

    //send resetPasswordLink

    const emailSent = await sendPasswordResetLink({
      email: user.email,
      message: url,
    });
    if (!emailSent) return res.json("oops ❌  ERROR SENDING EMAIL");
    return res.json("✅ CHECK YOUR EMAIL ");
  } catch (error) {
    res.status(500).json({
      status: "fail ",
      message: "Internal Server Error ",
      error: error.message,
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { restoken } = req.params;
    const { password } = req.body;

    const user = await User.findOne({ resetToken: restoken });

    if (!user)
      return res.status(404).json("INVALID TOKEN OR EXPIRED TOKEN ❌❗");

    if (user.resetTokenExpTime < Date.now())
      return res.status(404).json("EXPIRED TOKEN ❌❗");

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpTime = undefined;
    user.passwordChangedAt = Date.now();

    await user.save();

    return res.status(201).json("PASSWORD SUCCESSFULLY CHANGED ✅");
  } catch (error) {
    res.status(500).json({ status: "fail", error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  const userId = req.user.userId;
  const { bio } = req.body;
  const avatar = req.file ? req.file.filename : null;

  const user = await User.findOne({ _id: userId });
  if (!user) return res.status(404).json(" SOMETHING WENT WRONG");
  user.bio = bio ? bio : undefined;
  user.avatar = avatar;
  await user.save();
  return res
    .status(201)
    .json({ status: "sucess", message: " profile succesfully updated" });
};

exports.viewProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findOne({ _id: userId }).select([
      "-_id",
      "name",
      "username",
      "avatar",
      "bio",
      "email",
    ]);
    if (!user)
      return res
        .status(404)
        .json({ status: "fail", message: "user not found" });
    return res.status(200).json(user);
  } catch (error) {
    res.status(500).json("INTERNAL SERVER ERROR");
  }
};

exports.logout = async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];

    const token = authHeader && authHeader.split(" ")[1];
    const response= await RevToken.create({
      revTokens: token,
    });
    if (response) return res.status(200).json("LOGGED OUT SUCCESFULLY ");
    return res.status(500).json("SOMETHING WENT WRONG ");
  } catch (error) {
    res.status(500).json("INTERNAL SERVER ERROR");
  }
};
