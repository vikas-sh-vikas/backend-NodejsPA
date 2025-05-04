import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiErrors.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/apiResponce.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User_detail } from "../models/userDetail.model.js";
const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();

    return { accessToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating referesh and access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const {
    user_name,
    email,
    full_name,
    profile_picture,
    password,
    cash_amount,
  } = req.body;
  if (
    [user_name, email, full_name, password].some((item) => item?.trim() === "")
  ) {
    throw new ApiError(400, "All Fields Required");
  }
  const existedUser = await User.findOne({
    $or: [{ user_name }, { email }],
  });
  if (existedUser) {
    res.status(400).json(new ApiError(400, "Username or Email already exists"));
  }

  const profilePic = req.files?.profilepic?.[0];

if (!profilePic) {
  return res.status(400).json({ error: "No profile picture uploaded" });
}

const result = await uploadOnCloudinary(profilePic.buffer, profilePic.originalname);
  // const profilePic = await req.files?.profilepic[0]?.path;
  // const profile = await uploadOnCloudinary(profilePic);

  const user = await User.create({
    user_name,
    profile_picture: result?.secure_url  || "",
    email,
    full_name,
    password,
  });
  const createdUser = await User.findById(user._id).select("-password");

  if (!createdUser) {
    throw new ApiError(500, "something went wrong while saving");
  } else {
    const userDetail = await User_detail.create({
      cash_amount,
      // profilepic: profile?.url || "",
      user_master: createdUser._id,
    });
    const createdUserDetail = await User_detail.findById(userDetail._id).select(
      "-password"
    );
    console.log("Details", createdUserDetail);
    if (!createdUserDetail) {
      throw new ApiError(500, "something went wrong while saving");
    }
  }
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, user_name, password } = req.body;

  if (!user_name && !email) {
    throw new ApiError(400, "username or email is required");
  }

  const user = await User.findOne({
    $or: [{ user_name }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
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
