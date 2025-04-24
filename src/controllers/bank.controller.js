import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponce.js";
import { Transaction } from "../models/transaction.model.js";
import { ApiError } from "../utils/apiErrors.js";
import Bank from "../models/bank.model.js";

const getBanks = asyncHandler(async (req, res) => {
  const bank = await Bank.find();
  // console.log("Customers", player);
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
const totalBankBalace = asyncHandler(async (req, res) => {
  const banks = await Bank.find();
  const totalBalance = banks.reduce(
    (total, bank) => total + parseFloat(bank.current_balance),
    0
  );
  return res
    .status(201)
    .json(new ApiResponse(200, totalBalance, "Total Balance"));
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
    iFsc_code,
    user_master,
  } = reqBody;
  //add customer
  if (_id) {
    // Find the existing bank entry
    const existingBank = await Bank.findById(_id);
    if (!existingBank) {
      return ApiError(400, "Bank not found");
    }

    // Convert deposit to a number and add to balance if deposit is provided
    if (deposit) {
      const currentBalance = parseFloat(existingBank.balance) || 0;
      const depositAmount = deposit ? parseFloat(deposit) : 0;
      const updatedBalance = (currentBalance + depositAmount).toFixed(2); // Keep 2 decimal places
      await Bank.findByIdAndUpdate(
        _id,
        {
          name,
          balance: updatedBalance.toString(), // Convert back to string
          address,
        },
        { new: true }
      );
    } else if (withdraw) {
      const currentBalance = parseFloat(existingBank.balance) || 0;
      const withdrawAmount = withdraw ? parseFloat(withdraw) : 0;
      const updatedBalance = (currentBalance - withdrawAmount).toFixed(2); // Keep 2 decimal places
      await Bank.findByIdAndUpdate(
        _id,
        {
          name,
          balance: updatedBalance.toString(), // Convert back to string
          address,
        },
        { new: true }
      );
    } else {
      await Bank.findByIdAndUpdate(
        _id,
        {
          name,
          balance,
          address,
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
      iFsc_code,
      user_master,
    });
    return res.status(201).json(new ApiResponse(200, "", "Bank Saved"));
  }
});
export { getBanks, getBankById, totalBankBalace, addEditBanks };
