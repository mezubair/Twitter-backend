const express = require("express");
const {register, verify, signIn , forgetPassword, resetPassword ,updateProfile, viewProfile,logout, sendVerificationEmail, deleteAccount, changePassword,followUnfollow,acceptFollowReq,changeAccountMode} = require("../controllers/user.controllers");
const {upload} =require("../middleware/fileUpload.middleware")
const authMiddleware = require("../middleware/authMiddleware");

const router=express.Router();


// UN-PROTECTED ROUTES

router.post("/register",register);
router.post("/verify",verify);
router.post("/signin",signIn)
router.post("/forgetpassword",forgetPassword)
router.post("/resetPassword/:restoken",resetPassword)
router.post("/resend-otp",sendVerificationEmail);

// PROTECTED ROUTES (routes which need authtoken )

// MIDDLE WARE 
router.use(authMiddleware);

router.use("/updateProfile",upload)
router.put("/updateprofile",updateProfile);
router.put("/change-passsword",changePassword);
router.get("/viewprofile",viewProfile);
router.get("/logout",logout);
router.patch("/change-account-type",changeAccountMode);
router.post("/delete-account",deleteAccount);
router.put("/follow-unfollow/:userId", followUnfollow);
router.get("/accept-followReq",acceptFollowReq);


module.exports = router;