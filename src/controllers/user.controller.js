import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiErrors.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/apiResponce.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import mongoose from "mongoose";
import { User_detail } from "../models/userDetail.model.js";
import TransactionType from "../models/transactionType.model.js";
import PaymentType from "../models/paymentType.model.js";
import Bank from "../models/bank.model.js";
import Category from "../models/category,model.js";

const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();

    return { accessToken };
  } catch (error) {
    return res.status(200).json(
      new ApiError(500, "RefreshToken Fail", [
        {
          message:
            "Something went wrong while generating referesh and access token",
        },
      ])
    );
  }
};
// utils/auth.utils.ts
const registerGoogleUser = async (userData) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { email, full_name, profile_picture, provider } = userData;

    const existedUser = await User.findOne({
      $or: [{ email }],
    }).session(session);

    if (existedUser) {
      await session.abortTransaction();
      session.endSession();
      return { error: "Username or Email already exists" };
    }

    const user = await User.create(
      [
        {
          user_name: email,
          profile_picture: profile_picture || "",
          email,
          provider,
          full_name,
          password: "password", // optional or dummy since Google login skips password
          // mobileNo,
        },
      ],
      { session }
    );

    await User_detail.create(
      [
        {
          user_master: user[0]._id,
          cash_amount: "0",
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    const createdUser = await User.findById(user[0]._id).select("-password");

    return { user: createdUser };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return { error: error.message };
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { user_name, email, full_name, password, mobileNo } = req.body;

    if (
      [user_name, email, full_name, password, mobileNo].some(
        (item) => item?.trim() === ""
      )
    ) {
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
    let result = null;
    if (profilePic) {
      result = await uploadOnCloudinary(
        profilePic.buffer,
        profilePic.originalname
      );
    }

    const user = await User.create(
      [
        {
          user_name,
          profile_picture: result?.secure_url || "",
          email,
          full_name,
          password,
          mobileNo,
          provider: "credentials",
        },
      ],
      { session }
    );

    const userDetail = await User_detail.create(
      [
        {
          user_master: user[0]._id,
          cash_amount: "0",
        },
      ],
      { session }
    );

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
  const { email, user_name, password, provider, full_name, profile_picture } =
    req.body;

  if (!user_name && !email) {
    return res
      .status(200)
      .json(
        new ApiError(400, "Login Fail", [
          { message: "username or email is required" },
        ])
      );
  }

  let user = await User.findOne({
    $or: [{ user_name,provider }, { email,provider }],
  });

  // Handle Google first-time user
  if (!user && provider === "google") {
    const result = await registerGoogleUser({
      email,
      full_name,
      profile_picture,
      provider,
    });

    if (result.error) {
      return res
        .status(200)
        .json(
          new ApiError(400, "Google Register Fail", [{ message: result.error }])
        );
    }

    user = result.user;
  }
  if (!user) {
    return res
      .status(200)
      .json(new ApiError(400, "Login Fail", [{ message: "User not found" }]));
  }

  if (provider !== "google") {
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
      return res
        .status(200)
        .json(
          new ApiError(400, "Login Fail", [{ message: "Invalid credentials" }])
        );
    }
  }
  // const isPasswordValid = await user.isPasswordCorrect(password);

  // if (!isPasswordValid && provider !== 'google') {
  //   return res
  //     .status(200)
  //     .json(
  //       new ApiError(400, "Login Fail", [
  //         { message: "Invalid user credentials" },
  //       ])
  //     );
  // }

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
const getUserDashDetail = asyncHandler(async (req, res) => {
  const [banks, categories, transactionTypes, paymentTypes] = await Promise.all(
    [
      Bank.find({ user_master: req.user._id }).sort({ createdAt: -1 }).lean(),
      Category.find().sort({ createdAt: -1 }).lean(),
      TransactionType.find().sort({ createdAt: -1 }).lean(),
      PaymentType.find().sort({ createdAt: -1 }).lean(),
    ]
  );
  if (!transactionTypes || !banks || !categories || !paymentTypes) {
    return res
      .status(200)
      .json(
        new ApiError(400, "getTransactionTypes Fail", [
          { message: "Transaction type not found" },
        ])
      );
  }
  const data = {
    banks: banks,
    categories: categories,
    transactionTypes: transactionTypes,
    paymentTypes: paymentTypes,
  };
  return res
    .status(201)
    .json(new ApiResponse(200, data, "TransactionType list retrive"));
});
const editUser = asyncHandler(async (req, res) => {
  const reqBody = await req.body;
  const { _id, full_name,mobileNo,user_name } = reqBody;
  //add customer
  if (_id) {
    // Find the existing bank entry
    const existingUser = await User.findById(_id);
    if (!existingUser) {
      return res
        .status(200)
        .json(
          new ApiError(400, "editUser Fail", [
            {  message: "User not found" },
          ])
        );
    }

    await User.findByIdAndUpdate(_id, {
      full_name,mobileNo,user_name
    });
    const updatetdUser = await User.findById(_id).select("-password");
    return res
      .status(201)
      .json(
      new ApiResponse(
        200,
        {
          user: updatetdUser,
        },
        "User updated Successfully"
      ));

  } else {
      return res
        .status(200)
        .json(
          new ApiError(400, "editUser Fail", [
            {  message: "User id not found" },
          ])
        );
  }
});
export {
  registerUser,
  loginUser,
  logoutUser,  
  getUserDetail,  
  getUserDashDetail,
  editUser,
};
