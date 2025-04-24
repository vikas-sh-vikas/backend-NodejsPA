import mongoose, { Schema } from "mongoose";

const transactionTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a Name"],
      // unique: true,
    },
    description: {
      type: String,
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
  },
  { timestamps: true }
);
const TransectionType =
  mongoose.models.transaction_types ||
  mongoose.model("transaction_types", transactionTypeSchema);

export default TransectionType;
