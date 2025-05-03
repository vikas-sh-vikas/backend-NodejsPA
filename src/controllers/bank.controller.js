import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponce.js";
import { Transaction } from "../models/transaction.model.js";
import { ApiError } from "../utils/apiErrors.js";
import Bank from "../models/bank.model.js";

const getBanks = asyncHandler(async (req, res) => {
  const bank = await Bank.find().sort({ createdAt: -1 });
  return res.status(201).json(new ApiResponse(200, bank, "Bank list retrive"));
});
const getBankById = asyncHandler(async (req, res) => {
  const reqBody = await req.body;
  const bank = await Bank.findOne({ _id: reqBody._id });

  if (!bank) {
    return new ApiError(400, "Bank Not Found");
  }
  return res.status(201).json(new ApiResponse(200, bank, "Bank Found"));
});
const addEditBanks = asyncHandler(async (req, res) => {
  const reqBody = await req.body;
  const {
    _id,
    bank_name,
    branch,
    current_balance,
    opening_balance,
    address,
    ifsc_code,
  } = reqBody;
  //add customer
  if (_id) {
    // Find the existing bank entry
    const existingBank = await Bank.findById(_id);
    if (!existingBank) {
      return ApiError(400, "Bank not found");
    } else {
      await Bank.findByIdAndUpdate(
        _id,
        {
          bank_name,
          branch,
          current_balance,
          opening_balance,
          address,
          ifsc_code,
        },
        { new: true }
      );
    }
    return res.status(201).json(new ApiResponse(200, "", "Bank Updated"));
  } else {
    const bank = await Bank.create({
      bank_name,
      branch,
      current_balance,
      opening_balance,
      address,
      ifsc_code,
      user_master: req.user._id,
    });
    return res.status(201).json(new ApiResponse(200, "", "Bank Saved"));
  }
});
export { getBanks, getBankById, addEditBanks };
