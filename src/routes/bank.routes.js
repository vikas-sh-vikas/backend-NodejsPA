import { Router } from "express";
import {
  getBanks,
  getBankById,
  totalBankBalace,
  addEditBanks,
} from "../controllers/bank.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

//secured routes
router.route("/getBanks").get(verifyJWT, getBanks);
router.route("/getBankById").post(verifyJWT, getBankById);
router.route("/totalBankBalace").get(verifyJWT, totalBankBalace);
router.route("/addEditBanks").post(verifyJWT, addEditBanks);

export default router;
