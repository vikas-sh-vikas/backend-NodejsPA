import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponce.js";
import { Transaction } from "../models/transaction.model.js";
import { ApiError } from "../utils/apiErrors.js";
import TransectionType from "../models/transactionType.model.js";

const getTransectionTypes = asyncHandler(async (req, res) => {
  const transectionType = await TransectionType.find();
  // console.log("Customers", player);
  return res
    .status(201)
    .json(
      new ApiResponse(200, transectionType, "TransectionType list retrive")
    );
});
const getTransectionTypeById = asyncHandler(async (req, res) => {
  const reqBody = await req.body;
  const bank = await TransectionType.findOne({ _id: reqBody._id });

  if (!bank) {
    return new ApiError(400, "TransectionType Not Found");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, bank, "TransectionType Found"));
});
const addEditTransectionType = asyncHandler(async (req, res) => {
  const reqBody = await req.body;
  const { _id, name, description } = reqBody;
  //add customer
  if (_id) {
    // Find the existing bank entry
    const existingTransectionType = await TransectionType.findById(_id);
    if (!existingTransectionType) {
      return ApiError(400, "TransectionType not found");
    }

    await TransectionType.findByIdAndUpdate(_id, {
      name,
      description,
    });
    return res
      .status(201)
      .json(new ApiResponse(200, "", "TransectionType Updated"));
  } else {
    const bank = await TransectionType.create({
      name,
      description,
    });
    return res
      .status(201)
      .json(new ApiResponse(200, "", "TransectionType Saved"));
  }
});
export { getTransectionTypes, getTransectionTypeById, addEditTransectionType };
