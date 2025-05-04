import mongoose, { Schema } from "mongoose";
import Bank from "../models/bank.model.js";
import Category from "./category,model.js";
import TransactionType from "./transactionType.model.js";
import PaymentType from "./paymentType.model.js";
const transactionSchema = new Schema(
  {
    amount: {
      type: String,
      required: [true, "Please provide amount"],
      // unique: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: Category,
      required: true,
    },
    transaction_type: {
      type: Schema.Types.ObjectId,
      ref: TransactionType,
      required: true,
    },
    payment_type: {
      type: Schema.Types.ObjectId,
      ref: PaymentType,
      required: true,
    },
    bank: {
      type: Schema.Types.ObjectId,
      ref: Bank,
      // required: true,
    },
    date: {
      type: Date,
      // required: [true, "Please provide date"],
      // unique: true,
    },
    description: {
      type: String,
      // required: [true, "Please provide description"],
      // unique: true,
    },
    created_on: {
      type: Date,
    },
    created_by: {
      type: Schema.Types.ObjectId,
    },
    is_deleted: {
      type: Boolean,
    },
    deleted_by: {
      type: Schema.Types.ObjectId,
    },
    deleted_on: {
      type: Date,
    },
        user_master: {
          type: Schema.Types.ObjectId,
          required: true,
        },
  },
  { timestamps: true }
);
// const Transaction =
//   mongoose.models.transactions ||
//   mongoose.model("transaction", transactionSchema);
export const Transaction = mongoose.model("Transaction", transactionSchema);
// export default Transaction;
