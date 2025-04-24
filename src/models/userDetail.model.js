import mongoose, { Schema, Types } from "mongoose";
import { User } from "./user.model.js";
const user_detail = new Schema(
  {
    cash_amount: {
      type: String,
      required: true,
    },
    bank_amount: {
      type: String,
      // required: true,
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
      ref: User,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
export const User_detail = mongoose.model("user_details", user_detail);
