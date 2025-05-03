import { Router } from "express";
import {
  getTransaction,
  getTransactionById,
  getRecentTransaction,
  addEditTransaction,
  selfTransfer,
  addEditCash,
  depositCash,
  deleteTransaction,
  withdrawCash,
  getCashBankAmount,
} from "../controllers/transaction.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

//secured routes
router.route("/getTransaction").post(verifyJWT, getTransaction);
router.route("/getTransactionById").post(verifyJWT, getTransactionById);
router.route("/getRecentTransaction").post(verifyJWT, getRecentTransaction);
router.route("/deleteTransaction").post(verifyJWT, deleteTransaction);
router.route("/addEditTransaction").post(verifyJWT, addEditTransaction);
router.route("/selfTransfer").post(verifyJWT, selfTransfer);
router.route("/addEditCash").post(verifyJWT, addEditCash);
router.route("/depositCash").post(verifyJWT, depositCash);
router.route("/withdrawCash").post(verifyJWT, withdrawCash);
router.route("/getCashBankAmount").post(verifyJWT, getCashBankAmount);

export default router;
