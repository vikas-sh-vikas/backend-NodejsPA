import { Router } from "express";
import {getCash,getCashById, addEditCash} from '../controllers/cash.controller.js';
import { verifyJWT } from "../middlewares/auth.middleware.js";



const router = Router()

//secured routes
router.route("/getCash").get(verifyJWT,getCash)
router.route("/getCashById").post(verifyJWT,getCashById)
router.route("/addEditCash").post(verifyJWT,addEditCash)

export default router