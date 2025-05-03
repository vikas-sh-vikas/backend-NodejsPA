import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponce.js";
import { Transaction } from "../models/transaction.model.js";
import { ApiError } from "../utils/apiErrors.js";
import PaymentType from "../models/paymentType.model.js";

const getPaymentTypes = asyncHandler(async (req, res) => {
  const transactionType = await PaymentType.find().sort({ createdAt: -1 });
  // console.log("Customers", player);
  return res
    .status(201)
    .json(new ApiResponse(200, transactionType, "PaymentType list retrive"));
});
const getPaymentTypeById = asyncHandler(async (req, res) => {
  const reqBody = await req.body;
  const bank = await PaymentType.findOne({ _id: reqBody._id });

  if (!bank) {
    return new ApiError(400, "PaymentType Not Found");
  }
  return res.status(201).json(new ApiResponse(200, bank, "PaymentType Found"));
});
const addEditPaymentType = asyncHandler(async (req, res) => {
  const reqBody = await req.body;
  const { _id, name, description } = reqBody;
  //add customer
  if (_id) {
    // Find the existing bank entry
    const existingPaymentType = await PaymentType.findById(_id);
    if (!existingPaymentType) {
      return ApiError(400, "PaymentType not found");
    }

    await PaymentType.findByIdAndUpdate(_id, {
      name,
      description,
    });
    return res
      .status(201)
      .json(new ApiResponse(200, "", "PaymentType Updated"));
  } else {
    const bank = await PaymentType.create({
      name,
      description,
    });
    return res.status(201).json(new ApiResponse(200, "", "PaymentType Saved"));
  }
});
export { getPaymentTypes, getPaymentTypeById, addEditPaymentType };
