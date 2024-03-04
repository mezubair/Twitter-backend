const User = require("../models/user.model");
const RevToken = require("../models/revokedTokens.model");
const crypto = require("crypto");
const Tweet = require("../models/tweet.model")
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
      message: `Please enter this OTP ${otp} in the verification page to confirm your email address. If you did not request this OTP, please ignore this email. Note that this OTP is valid for 10 minutes only. If you do not verify your email within this time frame, you'll need to request a new OTP.`,
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
    console.log("🚀 ~ exports.verify= ~ otp:", otp, user.otp);
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
  const { bio,name } = req.body;
  const avatar = req.file ? req.file.filename : null;
  

  const user = await User.findOne({ _id: userId });
  if (!user) return res.status(404).json(" SOMETHING WENT WRONG");
  user.bio = bio ? bio : undefined;
  user.avatar = avatar;
  user.name = name ? name : user.name;
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

exports.sendVerificationEmail = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user)
    return res.status(404).json("NO ACCOUNT ASSOCIATED WITH THIS EMAIL");
  if (user.emailVerified) return res.status(200).json("EMAIL ALREADY VERFIED");
  const otp = Math.floor(Math.random(0, 1) * 1000000);
  const hashedOtp = await bcrypt.hash(otp.toString(), 10);
  user.otp = hashedOtp;
  user.otpExpTime = Date.now() + 10 * 60 * 1000;
  await user.save();
  const emailSent = await sendPasswordResetLink({
    email,
    message: `Please enter this OTP ${otp} in the verification page to confirm your email address. If you did not request this OTP, please ignore this email. Note that this OTP is valid for 10 minutes only. If you do not verify your email within this time frame, you'll need to request a new OTP.`,
  });
  if (!emailSent) return res.status(500).json("ERROR SENDING EMAIL");
  return res
    .status(200)
    .json(
      " We've sent a one-time password (OTP) to your email address for verification. Please check your inbox (and spam/junk folder) for an email from us containing the OTP."
    );
};

exports.changePassword = async (req, res)=>{
  try {
    const {oldPassword , newPassword , confirmNewPassword} = req.body;
    if(newPassword !== confirmNewPassword) return res.status(400).json({status : false , message : "NEW PASSWORD AND CONFIRM PASSWORD DIDNOT MATCH"});
    
    const user = await User.findOne({_id : req.user.userId});
    const isValid = await bcrypt.compare(user.password , oldPassword)
    
    if(!isValid) return res.status(400).json({message : " password didnot match"});
    user.password = await bcrypt.hash(newPassword , 10 );
    await user.save();
    res.status(200).json({message: "password changed succesfully"});

    
  } catch (error) {
    res.status(500).json({error});
  }
}

exports.logout = async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];

    const token = authHeader && authHeader.split(" ")[1];
    const response = await RevToken.create({
      revTokens: token,
    });
    if (response) return res.status(200).json("LOGGED OUT SUCCESFULLY ");
    return res.status(500).json("SOMETHING WENT WRONG ");
  } catch (error) {
    res.status(500).json("INTERNAL SERVER ERROR");
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { userId } = req.user;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found with this email" });
    }

    if (user._id.toString() !== userId) {
      return res.status(403).json({ error: "You are not authorized to delete this account" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Incorrect password" });
    }
    await Promise.all([
      User.findOneAndDelete({ email }),
      Tweet.deleteMany({ userId }),
    ]);

    res.status(200).json({ message: "Account deleted successfully"});
  } catch (error) {
    console.error("Error deleting account:", error);
    res.status(500).json({ error: "An internal server error occurred" });
  }
};
