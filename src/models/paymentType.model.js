import mongoose, { Schema } from "mongoose";

const paymentTypeSchema = new mongoose.Schema(
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
const PaymentType =
  mongoose.models.payment_types ||
  mongoose.model("payment_types", paymentTypeSchema);

export default PaymentType;
