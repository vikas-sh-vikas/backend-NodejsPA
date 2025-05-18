import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponce.js";
import { Transaction } from "../models/transaction.model.js";
import { ApiError } from "../utils/apiErrors.js";
import TransactionType from "../models/transactionType.model.js";

const getTransactionTypes = asyncHandler(async (req, res) => {
  const transactionType = await TransactionType.find().sort({ createdAt: -1 });
  if(!transactionType) {
    return res
    .status(200)
    .json(
      new ApiError(400, "getTransactionTypes Fail", [
        {  message: "Transaction type not found" },
      ])
    );
  }
  return res
    .status(201)
    .json(
      new ApiResponse(200, transactionType, "TransactionType list retrive")
    );
});
const getTransactionTypeById = asyncHandler(async (req, res) => {
  const reqBody = await req.body;
  const bank = await TransactionType.findOne({ _id: reqBody._id });

  if (!bank) {
    return res
        .status(200)
        .json(
          new ApiError(400, "getTransactionTypeById Fail", [
            {  message: "TransactionType Not Found" },
          ])
        );
  }
  return res
    .status(201)
    .json(new ApiResponse(200, bank, "TransactionType Found"));
});
const addEditTransactionType = asyncHandler(async (req, res) => {
  const reqBody = await req.body;
  const { _id, name, description } = reqBody;
  //add customer
  if (_id) {
    // Find the existing bank entry
    const existingTransactionType = await TransactionType.findById(_id);
    if (!existingTransactionType) {
      return res
        .status(200)
        .json(
          new ApiError(400, "addEditTransactionType Fail", [
            {  message: "TransactionType not found" },
          ])
        );
    }

    await TransactionType.findByIdAndUpdate(_id, {
      name,
      description,
    });
    return res
      .status(201)
      .json(new ApiResponse(200, "", "TransactionType Updated"));
  } else {
    const bank = await TransactionType.create({
      name,
      description,
    });
    return res
      .status(201)
      .json(new ApiResponse(200, "", "TransactionType Saved"));
  }
});
export { getTransactionTypes, getTransactionTypeById, addEditTransactionType };
