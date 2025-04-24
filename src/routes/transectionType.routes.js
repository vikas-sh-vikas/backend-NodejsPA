import { Router } from "express";
import {
  getTransectionTypes,
  getTransectionTypeById,
  addEditTransectionType,
} from "../controllers/transectionType.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

//secured routes
router.route("/getTransectionTypes").get(verifyJWT, getTransectionTypes);
router.route("/getTransectionTypeById").post(verifyJWT, getTransectionTypeById);
// router.route("/getRecentTransaction").get(verifyJWT,getRecentTransaction)
router.route("/addEditTransectionType").post(verifyJWT, addEditTransectionType);

export default router;
