import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponce.js";
import { Transaction } from "../models/transaction.model.js";
import { ApiError } from "../utils/apiErrors.js";
import Category from "../models/category,model.js";

const getCategorys = asyncHandler(async (req, res) => {
  const category = await Category.find().sort({ createdAt: -1 });
  if(!category){
    return res
    .status(200)
    .json(
      new ApiError(400, "getCategorys fail", [
        { message: "Category not found" },
      ])
    );

  }
  return res
    .status(201)
    .json(new ApiResponse(200, category, "Category list retrive"));
});
const getCategoryById = asyncHandler(async (req, res) => {
  const reqBody = await req.body;
  const category = await Category.findOne({ _id: reqBody._id });

  if (!category) {
    return res
    .status(200)
    .json(
      new ApiError(400, "getCategorys fail", [
        { message: "Category Not Found" },
      ])
    );
  }
  return res.status(201).json(new ApiResponse(200, category, "Category Found"));
});
const addEditCategory = asyncHandler(async (req, res) => {
  const reqBody = await req.body;
  const { _id, name, description } = reqBody;
  //add customer
  if (_id) {
    // Find the existing bank entry
    const existingCategory = await Category.findById(_id);
    if (!existingCategory) {
      return res
      .status(200)
      .json(
        new ApiError(400, "addEditCategory fail", [
          { message: "Category not found" },
        ])
      );
    }

    await Category.findByIdAndUpdate(_id, {
      name,
      description,
    });
    return res.status(201).json(new ApiResponse(200, "", "Category Updated"));
  } else {
    const bank = await Category.create({
      name,
      description,
    });
    return res.status(201).json(new ApiResponse(200, "", "Category Saved"));
  }
});
export { getCategorys, getCategoryById, addEditCategory };
