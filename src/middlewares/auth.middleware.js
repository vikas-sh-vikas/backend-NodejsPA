import { ApiError } from "../utils/apiErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    // console.log("object",req.cookies?.accessToken)
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      // throw new ApiError(401, "Unauthorized request");
      return res
        .status(401)
        .json(
          new ApiError(401, "Auth Fail", [{ message: "Unauthorized request" }])
        );
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      // throw new ApiError(401, "Invalid Access Token");
            return res
        .status(401)
        .json(
          new ApiError(401, "Auth Fail", [{ message: "Unauthorized request" }])
        );
    }

    req.user = user;
    next();
  } catch (error) {
          return res
        .status(401)
        .json(
          new ApiError(401, "Auth Fail", [{ message: "Unauthorized request" }])
        );
    // throw new ApiError(401, error?.message || "Invalid access token");
  }
});
