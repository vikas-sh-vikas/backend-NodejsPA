import mongoose from "mongoose";

const cashSchema = new mongoose.Schema({
  amount: {
    type: String,
    required: [true, "Please provide amount"],
    // unique: true,
  }
},
{ timestamps: true }
);
const Cash =
  mongoose.models.cashs ||
  mongoose.model("cashs", cashSchema);

export default Cash;
