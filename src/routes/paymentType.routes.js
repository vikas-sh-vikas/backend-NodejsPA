import { Router } from "express";
import {
  getPaymentTypes,
  getPaymentTypeById,
  addEditPaymentType,
} from "../controllers/paymentType.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

//secured routes
router.route("/getPaymentTypes").post(verifyJWT, getPaymentTypes);
router.route("/getPaymentTypeById").post(verifyJWT, getPaymentTypeById);
// router.route("/getRecentTransaction").get(verifyJWT,getRecentTransaction)
router.route("/addEditPaymentType").post(verifyJWT, addEditPaymentType);

export default router;
