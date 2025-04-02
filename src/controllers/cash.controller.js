import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Transaction } from "../models/transaction.model.js";
import { ApiError } from "../utils/ApiError.js";
import Cash from "../models/cash.model.js"

const getCash = asyncHandler(async (req, res) => {
  const cash = await Cash.find().limit(1);
  // console.log("Customers", player);
  return res
    .status(201)
    .json(new ApiResponse(200, cash, "Bank list retrive"));
});
const getCashById = asyncHandler(async (req, res) => {
  const reqBody = await request.json();
  // console.log("object", reqBody);
  const cash = await Cash.findOne({ _id: reqBody.id });

  if (!cash) {
    return new ApiError(400, "cash Not Found");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, bank, "Cash Found"));
});
const addEditCash = asyncHandler(async (req, res) => {
  const reqBody = await request.json();
    const { _id, amount,deposit,withdraw } = reqBody;
    //add customer
    if (_id) {
      // Find the existing bank entry
      const existingCash = await Cash.findById(_id);
      if (!existingCash) {
        return new ApiError(400, "Bank not found");
      }

      // Convert deposit to a number and add to balance if deposit is provided
      if(deposit){
        const currentCash = parseFloat(existingCash.amount) || 0;
        const depositCash = deposit ? parseFloat(deposit) : 0;
        const updatedCash = (currentCash + depositCash).toFixed(2); // Keep 2 decimal places
        await Cash.findByIdAndUpdate(
          _id,
          {
            amount: updatedCash.toString(), // Convert back to string
          },
          { new: true }
        );
        
      }
      else if(withdraw){
        const currentCash = parseFloat(existingCash.balance) || 0;
        const withdrawCash = withdraw ? parseFloat(withdraw) : 0;
        const updatedCash = (currentCash - withdrawCash).toFixed(2); // Keep 2 decimal places
        await Cash.findByIdAndUpdate(
          _id,
          {
            amount: updatedCash.toString(), // Convert back to string
          },
          { new: true }
        );
        
      }
      else{
        await Cash.findByIdAndUpdate(
          _id,
          {
            amount,
          },
          { new: true }
        );
      }
      return res
      .status(201)
      .json(new ApiResponse(200, "", "Cash Updated"));
    } else {
      const cash = await Cash.create({
        amount,
      });
      return res
      .status(201)
      .json(new ApiResponse(200, "", "Cash saved"));
    }
});
export { getCash,getCashById, addEditCash };
