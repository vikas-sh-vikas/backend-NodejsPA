import { Router } from "express";
import {
  getCategorys,
  getCategoryById,
  addEditCategory,
} from "../controllers/category.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

//secured routes
router.route("/getCategorys").get(verifyJWT, getCategorys);
router.route("/getCategoryById").post(verifyJWT, getCategoryById);
// router.route("/getRecentTransaction").get(verifyJWT,totalBankBalace)
router.route("/addEditCategory").post(verifyJWT, addEditCategory);

export default router;
