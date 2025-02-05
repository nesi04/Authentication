import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import transporter from "../config/nodeMailer.js";
import dotenv from "dotenv";
dotenv.config();

export const register = async (req, res) => {
  console.log("Register API hit"); // Debugging
  console.log("Request Body:", req.body); // Debugging

  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    // ❌ Fixed incorrect condition
    return res.json({ success: false, message: "Missing Details" });
  }

  try {
    const existingUser = await userModel.findOne({ email }); // ❌ Fixed missing await
    if (existingUser) {
      return res.json({ success: false, message: "User Already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new userModel({ name, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    //sending email
    const mailOptions = {
      from: process.env.SENDER_MAIL,
      to: email,
      subject: "You are logged in",
      text: `Your account has successfully been created using ${email}`,
    };
    await transporter.sendMail(mailOptions);

    return res.json({ success: true });

    return res.json({ success: true });
  } catch (error) {
    console.error("Error in register:", error);
    res.json({ success: false, message: error.message });
  }
};


export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(200).json({ success: true, message: "Login successful", token });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again later." });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });

    return res.json({ success: true, message: "Logged Out" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const sendVerifyOtp = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await userModel.findById(userId);
    if (user.isAccountVerified) {
      return res.json({ success: false, message: "Account already verified" });
    }
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 60 * 60 * 1000;
    await user.save();
    const mailOption = {
      from: process.env.SENDER_MAIL,
      to: user.email,
      subject: "ACCOUNT VERIFICATION OTP",
      text: `Your otp is ${otp}. Verify your account using this otp. `,
    };
    await transporter.sendMail(mailOption);
    res.json({success:true,
        message:"Verification otp sent"
    });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  const { userId, otp } = req.body;

  if (!userId || !otp) {
    return res.json({ success: false, message: "Missing Details" });
  }

  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User Not Found" });
    }

    console.log("Stored OTP:", user.verifyOtp);
    console.log("Received OTP:", otp);
    console.log("Stored Expiry:", user.verifyOtpExpireAt, "Current Time:", Date.now());

    // Ensure OTP is compared as a string
    if (user.verifyOtp !== String(otp)) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    // Ensure the correct property name for expiration
    if (user.verifyOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: "OTP expired" });
    }

    // Mark account as verified
    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpireAt = 0;

    await user.save({ validateBeforeSave: false });

    return res.json({ success: true, message: "Email verified" });

  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const isAuthenticated = async(req,res)=>{
  try {
    return res.json({success:true});
  } catch (error) {
    res.json({success:"false",message:error.message});
  }
}

export const sendResetOtp = async(req,res)=>{
  const {email} = req.body;
  if(!email){
    return res.json({success:false,message:"Email is required"});
  }
  try {

    const user = await userModel.findOne({email});
    if(!user){
      return res.json({success:false,message:"User Not found"});
    }
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 10*60 * 60 * 1000;
    await user.save();
    const mailOption = {
      from: process.env.SENDER_MAIL,
      to: user.email,
      subject: "PASSWORD RESET  OTP",
      text: `Your otp is ${otp}. Reset your password with this otp `,
    };
    await transporter.sendMail(mailOption);

    return res.json({success:true,message:"otp sent to your email"});

    
  } catch (error) {
    return res.json({success:false,message:error.message});
  }
}

export const resetPassword = async(req,res)=>{
  const {email,otp,newPassword}=req.body;
  if(!email||!otp||!newPassword){
    return res.json({success:false,message:"Email,Otp and new password is required"});
  }
  try {
    const user = await userModel.findOne({email});
    if(!user){
      return res.json({success:false,message:"user not found"});
    }
    if(user.resetOtp===""||user.resetOtp!==otp){
      return res.json({success:false,message:"Invalid otp"})
    }
    if(user.resetOtpExpireAt<Date.now()){
      return res.json({success:false,message:"Otp expired"});
    }
    const hashedPassword = await bcrypt.hash(newPassword,10);
    user.password= hashedPassword;
    user.resetOtp ='';
    user.resetOtpExpireAt=0;
    user.save();

    return res.json({success:true,message:"Password has been reset successfully"});
    
  } catch (error) {
    return res.json({success:false,message:error.message});
  }
}
