import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a Name"],
    // unique: true,
  },
  type: {
    type: String,
    required: [true, "Please provide type"],
    // unique: true,
  },
},
{ timestamps: true }

);
const Category = mongoose.models.categorys || mongoose.model("categorys", categorySchema);

export default Category;
