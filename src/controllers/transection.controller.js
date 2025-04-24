import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponce.js";
import { Transaction } from "../models/transaction.model.js";
import Cash from "../models/cash.model.js";
import Bank from "../models/bank.model.js";
import { ApiError } from "../utils/apiErrors.js";
import mongoose from "mongoose";

const getTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.find().populate([
    { path: "bank" },
    { path: "category" },
    { path: "transection_type" },
    { path: "payment_type" },
  ]);
  return res
    .status(201)
    .json(new ApiResponse(200, transaction, "Transaction list retrive"));
});
const getTransactionById = asyncHandler(async (req, res) => {
  const reqBody = await req.body;
  const transaction = await Transaction.findOne({ _id: reqBody._id }).populate([
    { path: "bank" },
    { path: "category" },
    { path: "transection_type" },
    { path: "payment_type" },
  ]);
  if (!transaction) {
    return NextResponse.json({
      message: "Transaction Not Found",
      data: transaction,
    });
  }
  return res
    .status(201)
    .json(new ApiResponse(200, transaction, "Transaction Found"));
});
const getRecentTransaction = asyncHandler(async (req, res) => {
  const { count } = await req.body;
  const transaction = await Transaction.find()
    .populate("bank")
    .sort({ createdAt: -1 }) // Sort by createdAt in descending order (newest first)
    .limit(count); // Limit to 10 results;
  return res
    .status(201)
    .json(new ApiResponse(200, transaction, "Transaction Found"));
});
const addEditTransaction = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  const reqBody = await req.body;
  const {
    _id,
    amount,
    category,
    transection_type,
    payment_type,
    bank,
    date,
    description,
  } = reqBody;

  // Update existing transaction
  if (_id) {
    const transaction = await Transaction.findOne({ _id }).session(session);
    const oldAmount = transaction.amount;
    await Transaction.findOneAndUpdate({ _id }, { ...reqBody }, { session });
    if (type === "debit") {
      if (payment_method === "cash") {
        const cashAccount = await Cash.findOne().session(session);
        if (!cashAccount) {
          throw new ApiError(400, "Cash account not found");
        }
        if (parseFloat(cashAccount.amount) < parseFloat(amount)) {
          throw new ApiError(400, "Cash account can not be negative");
        }
        cashAccount.amount =
          parseFloat(cashAccount.amount) +
          parseFloat(oldAmount) -
          parseFloat(amount); // Update the cash balance
        await cashAccount.save({ session });
      } else if (payment_method == "bank") {
        const bankAmount = await Bank.findOne({ _id: bank_id }).session(
          session
        );
        if (!bankAmount) {
          throw new ApiError(400, "Cash account not found");
        }
        if (parseFloat(bankAmount.amount) < parseFloat(amount)) {
          throw new ApiError(400, "Bank account can not be negative");
        }

        bankAmount.balance =
          parseFloat(bankAmount.balance) +
          parseFloat(oldAmount) -
          parseFloat(amount);
        await bankAmount.save({ session });
      }
    } else if (type === "credit") {
      if (payment_method === "cash") {
        const cashAccount = await Cash.findOne().session(session);
        if (!cashAccount) {
          throw new ApiError(400, "Cash account not found");
        }
        if (parseFloat(cashAccount.amount) < parseFloat(amount)) {
          throw new ApiError(400, "Cash account can not be negative");
        }

        cashAccount.amount =
          parseFloat(cashAccount.amount) -
          parseFloat(oldAmount) +
          parseFloat(amount); // Update the cash balance
        await cashAccount.save({ session });
      } else if (payment_method == "bank") {
        const bankAmount = await Bank.findOne({ _id: bank_id }).session(
          session
        );
        if (!bankAmount) {
          throw new ApiError(400, "Cash account not found");
        }
        if (parseFloat(bankAmount.amount) < parseFloat(amount)) {
          throw new ApiError(400, "Bank account can not be negative");
        }

        bankAmount.balance =
          parseFloat(bankAmount.balance) -
          parseFloat(oldAmount) +
          parseFloat(amount);
        await bankAmount.save({ session });
      }
    }
    await session.commitTransaction();
    session.endSession();

    // return NextResponse.json({
    //   message: "Transaction Updated",
    //   success: true,
    // });
    return res
      .status(201)
      .json(new ApiResponse(200, "", "Transaction Updated"));
  } else {
    // Create a new transaction
    const transaction = await Transaction.create(
      [
        {
          amount,
          category,
          transection_type,
          payment_type,
          bank,
          date,
          description,
        },
      ]
      // { session }
    );
    if (transection_type === "debit") {
      // Update Cash balance if payment method is "cash"
      if (payment_type === "cash") {
        const cashAccount = await Cash.findOne().session(session);
        if (!cashAccount) {
          throw new ApiError(400, "Cash account not found");
        }
        if (parseFloat(cashAccount.amount) < parseFloat(amount)) {
          throw new ApiError(400, "Cash account can not be negative");
        }

        cashAccount.amount =
          parseFloat(cashAccount.amount) - parseFloat(amount); // Update the cash balance
        await cashAccount.save({ session });
      } else if (payment_type == "bank") {
        const bankAmount = await Bank.findOne({ _id: bank_id }).session(
          session
        );
        if (!bankAmount) {
          throw new ApiError(400, "Cash account not found");
        }
        if (parseFloat(bankAmount.amount) < parseFloat(amount)) {
          throw new ApiError(400, "Bank account can not be negative");
        }

        bankAmount.balance =
          parseFloat(bankAmount.balance) - parseFloat(amount);
        await bankAmount.save({ session });
      }
    } else if (transection_type === "credit") {
      if (payment_type === "cash") {
        const cashAccount = await Cash.findOne().session(session);
        if (!cashAccount) {
          throw new ApiError(400, "Cash account not found");
        }
        if (parseFloat(cashAccount.amount) < parseFloat(amount)) {
          throw new ApiError(400, "Cash account can not be negative");
        }

        cashAccount.amount =
          parseFloat(cashAccount.amount) + parseFloat(amount); // Update the cash balance
        await cashAccount.save({ session });
      } else if (payment_type == "bank") {
        const bankAmount = await Bank.findOne({ _id: bank_id }).session(
          session
        );
        if (!bankAmount) {
          throw new ApiError(400, "Cash account not found");
        }
        if (parseFloat(bankAmount.amount) < parseFloat(amount)) {
          throw new ApiError(400, "Bank account can not be negative");
        }

        bankAmount.balance =
          parseFloat(bankAmount.balance) + parseFloat(amount);
        await bankAmount.save({ session });
      }
    }

    await session.commitTransaction(); // Commit the transaction
    session.endSession();

    return res.status(201).json(new ApiResponse(200, "", "Transaction saved"));
  }
});

export {
  getTransaction,
  getTransactionById,
  getRecentTransaction,
  addEditTransaction,
};
