import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponce.js";
import { Transaction } from "../models/transaction.model.js";
import { ApiError } from "../utils/apiErrors.js";
import PaymentType from "../models/paymentType.model.js";

const getPaymentTypes = asyncHandler(async (req, res) => {
  const paymentType = await PaymentType.find().sort({ createdAt: -1 });
  if(!paymentType) {
    return res
    .status(200)
    .json(
      new ApiError(400, "getPaymentTypes fail", [
        { message: "Payment type not found" },
      ])
    );

  }
  return res
    .status(201)
    .json(new ApiResponse(200, paymentType, "PaymentType list retrive"));
});
const getPaymentTypeById = asyncHandler(async (req, res) => {
  const reqBody = await req.body;
  const paymentType = await PaymentType.findOne({ _id: reqBody._id });

  if (!paymentType) {
    return res
    .status(200)
    .json(
      new ApiError(400, "getPaymentTypes fail", [
        { message: "Payment type not found" },
      ])
    );
  }
  return res.status(201).json(new ApiResponse(200, paymentType, "PaymentType Found"));
});
const addEditPaymentType = asyncHandler(async (req, res) => {
  const reqBody = await req.body;
  const { _id, name, description } = reqBody;
  //add customer
  if (_id) {
    // Find the existing bank entry
    const existingPaymentType = await PaymentType.findById(_id);
    if (!existingPaymentType) {
      return res
      .status(200)
      .json(
        new ApiError(400, "addEditPaymentType fail", [
          { message: "PaymentType not found" },
        ])
      );
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
