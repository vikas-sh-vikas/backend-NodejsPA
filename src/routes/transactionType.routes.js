import { Router } from "express";
import {
  getTransactionTypes,
  getTransactionTypeById,
  addEditTransactionType,
} from "../controllers/transactionType.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

//secured routes
router.route("/getTransactionTypes").get(verifyJWT, getTransactionTypes);
router.route("/getTransactionTypeById").post(verifyJWT, getTransactionTypeById);
// router.route("/getRecentTransaction").get(verifyJWT,getRecentTransaction)
router.route("/addEditTransactionType").post(verifyJWT, addEditTransactionType);

export default router;
