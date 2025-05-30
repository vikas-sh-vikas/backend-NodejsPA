import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiErrors.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/apiResponce.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import mongoose from "mongoose";
import { User_detail } from "../models/userDetail.model.js";
const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();

    return { accessToken };
  } catch (error) {
   return res
        .status(200)
        .json(
          new ApiError(500, "RefreshToken Fail", [
            {  message: "Something went wrong while generating referesh and access token" },
          ])
        );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      user_name,
      email,
      full_name,
      password,
      mobileNo
    } = req.body;

    if ([user_name, email, full_name, password,mobileNo].some((item) => item?.trim() === "")) {
      return res
        .status(200)
        .json(
          new ApiError(400, "Register Fail", [
            { message: "All Fields Required" },
          ])
        );
    }

    const existedUser = await User.findOne({
      $or: [{ user_name }, { email }],
    }).session(session);

    if (existedUser) {
      await session.abortTransaction();
      return res
        .status(200)
        .json(
          new ApiError(400, "Register Fail", [
            { message: "Username or Email already exists" },
          ])
        );
    }

    const profilePic = req.files?.profilepic?.[0];
    // if (!profilePic) {
    //   await session.abortTransaction();
    //   return res
    //   .status(200)
    //   .json(
    //     new ApiError(400, "Register Fail", [
    //       { message: "No profile picture uploaded" },
    //     ])
    //   );
    // }
    const result = null;
    if(profilePic){
      result = await uploadOnCloudinary(profilePic.buffer, profilePic.originalname);
    }

    const user = await User.create([{
      user_name,
      profile_picture: result?.secure_url || "",
      email,
      full_name,
      password,
      mobileNo
    }], { session });

    const userDetail = await User_detail.create([{
      user_master: user[0]._id,
    }], { session });

    await session.commitTransaction();
    session.endSession();

    const createdUser = await User.findById(user[0]._id).select("-password");

    return res
      .status(201)
      .json(new ApiResponse(200, createdUser, "User registered Successfully"));

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res
      .status(200)
      .json(
        new ApiError(400, "Register Fail", [
          { message: error.message || "Registration failed with transaction." },
        ])
      );
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, user_name, password } = req.body;

  if (!user_name && !email) {
    return res
    .status(200)
    .json(
      new ApiError(400, "Login Fail", [
        { message: "username or email is required" },
      ])
    );
  }

  const user = await User.findOne({
    $or: [{ user_name }, { email }],
  });

  if (!user) {
    return res.status(200).json(
      new ApiError(400, "Login Fail",[
        {  message: "User not found" },
      ] )
    ) 
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    return res
    .status(200)
    .json(
      new ApiError(400, "Login Fail", [
        {  message: "Invalid user credentials" },
      ])
    );
  }

  const { accessToken } = await generateAccessAndRefereshTokens(user._id);

  const loggedInUser = await User.findById(user._id).select("-password");

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
        },
        "User logged In Successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1, // this removes the field from document
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});

const getUserDetail = asyncHandler(async (req, res) => {
  return res.status(200).json(new ApiResponse(200, req.user, "Success"));
});

export { registerUser, loginUser, logoutUser, getUserDetail };
