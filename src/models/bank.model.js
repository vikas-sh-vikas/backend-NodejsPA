import mongoose from "mongoose";

const bankSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a Name"],
    // unique: true,
  },
  balance: {
    type: String,
    required: [true, "Please provide Balance"],
    // unique: true,
  },
  address: {
    type: String,
    // required: [true, "Please provide a team name"],
    // unique: true,
  },
},
{ timestamps: true }

);
const Bank = mongoose.models.banks || mongoose.model("banks", bankSchema);

export default Bank;
