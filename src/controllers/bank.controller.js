import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponce.js";
import { Transaction } from "../models/transaction.model.js";
import { ApiError } from "../utils/apiErrors.js";
import Bank from "../models/bank.model.js";

const getBanks = asyncHandler(async (req, res) => {
  // const reqBody = await req.body;
  const bank = await Bank.find({ user_master: req.user._id }).sort({ createdAt: -1 });
  if(!bank) {
          return res
          .status(200)
          .json(
            new ApiError(400, "getBanks fail", [
              { message: "Bank not found" },
            ])
          );
  }
  // const bank = await Bank.find().sort({ createdAt: -1 });
  return res.status(201).json(new ApiResponse(200, bank, "Bank list retrive"));
});
const getBankById = asyncHandler(async (req, res) => {
  const reqBody = await req.body;
  const bank = await Bank.findOne({ _id: reqBody._id,user_master: req.user._id });

  if (!bank) {
    return res
          .status(200)
          .json(
            new ApiError(400, "getBanks fail", [
              { message: "Bank not found" },
            ])
          );
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
    const existingBank = await Bank.findOne({ _id, user_master: req.user._id });
    if (!existingBank) {
      return res
      .status(200)
      .json(
        new ApiError(400, "adddEdditBank fail", [
          { message: "Bank not found" },
        ])
      );
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
const deleteBank = asyncHandler(async (req, res) => {
  const reqBody = await req.body;
  const {
    _id,
  } = reqBody;
  //add customer

    const bank = await Bank.findOne({_id,user_master:req.user._id});
    if(!bank){
      return res
      .status(200)
      .json(
        new ApiError(400, "deleteBank fail", [
          { message: "Bank not found" },
        ])
      );
    }
    const transactionExists = await Transaction.exists({ bank: bank._id });
    if(transactionExists){

    }

    return res.status(201).json(new ApiResponse(200, "", "Bank Saved"));
  
});
export { getBanks, getBankById, addEditBanks,deleteBank };
  