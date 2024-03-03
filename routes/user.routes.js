const express = require("express");
const {register, verify, signIn , forgetPassword, resetPassword ,updateProfile, viewProfile,logout} = require("../controllers/user.controllers");
const {upload} =require("../middleware/fileUpload.middleware")
const authMiddleware = require("../middleware/authMiddleware");

const router=express.Router();


// UN-PROTECTED ROUTES

router.post("/register",register);
router.post("/verify",verify);
router.post("/signin",signIn)
router.post("/forgetpassword",forgetPassword)
router.post("/resetPassword/:restoken",resetPassword)

// PROTECTED ROUTES (routes which need authtoken )

// MIDDLE WARE 
router.use(authMiddleware);
router.use("/updateProfile",upload)
router.put("/updateprofile",updateProfile);
router.get("/viewprofile",viewProfile);
router.get("/logout",logout);


module.exports = router;