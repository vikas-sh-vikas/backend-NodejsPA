import mongoose,{Schema}from "mongoose";
import Bank from "../models/bank.model.js";

const transactionSchema = new Schema({
  type: {
    type: String,
    required: [true, "Please provide type"],
    // unique: true,
  },
  amount: {
    type: String,
    required: [true, "Please provide amount"],
    // unique: true,
  },
  category_id: {
    type: Number,
    required: [true, "Please provide a category"],
    // unique: true,
  },
  payment_method: {
    type: String,
    required: [true, "Please provide a payment method"],
    // unique: true,
  },
  bank_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Bank,
    required: false,
    default: null,
    set: (value) => (value === "" ? null : value), // Convert empty string to null
  },
  date: {
    type: Date,
    required: [true, "Please provide date"],
    // unique: true,
  },
  description: {
    type: String,
    required: [true, "Please provide description"],
    // unique: true,
  },
},
{ timestamps: true }
);
// const Transaction =
//   mongoose.models.transactions ||
//   mongoose.model("transaction", transactionSchema);
export const Transaction = mongoose.model("Transaction", transactionSchema)
// export default Transaction;
