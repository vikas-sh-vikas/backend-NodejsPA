import { Router } from "express";
import {
  getBanks,
  getBankById,
  addEditBanks,
} from "../controllers/bank.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

//secured routes
router.route("/getBanks").post(verifyJWT, getBanks);
router.route("/getBankById").post(verifyJWT, getBankById);
router.route("/addEditBanks").post(verifyJWT, addEditBanks);

export default router;
