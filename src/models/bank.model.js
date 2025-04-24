import mongoose, { Schema } from "mongoose";

const bankSchema = new mongoose.Schema(
  {
    bank_name: {
      type: String,
      required: [true, "Please provide a Name"],
    },
    branch: {
      type: String,
      // required: [true, "Please provide a Name"],
    },
    current_balance: {
      type: String,
      required: [true, "Please provide Balance"],
    },
    opening_balance: {
      type: String,
    },
    address: {
      type: String,
    },
    iFsc_code: {
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
    user_master: {
      type: Schema.Types.ObjectId,
      required: true,
    },
  },
  { timestamps: true }
);
const Bank = mongoose.models.banks || mongoose.model("banks", bankSchema);

export default Bank;
