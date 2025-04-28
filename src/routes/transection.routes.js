import { Router } from "express";
import {getTransaction,getTransactionById, getRecentTransaction,addEditTransaction,  exportUser,
    selfTransfer,
    addEditCash,
    depositCash,
    withdrawCash} from '../controllers/transection.controller.js';
import { verifyJWT } from "../middlewares/auth.middleware.js";



const router = Router()

//secured routes
router.route("/getTransaction").get(verifyJWT,getTransaction)
router.route("/getTransactionById").post(verifyJWT,getTransactionById)
router.route("/getRecentTransaction").post(verifyJWT,getRecentTransaction)
router.route("/addEditTransaction").post(verifyJWT,addEditTransaction)
router.route("/selfTransfer").post(verifyJWT,selfTransfer)
router.route("/addEditCash").post(verifyJWT,addEditCash)
router.route("/depositCash").post(verifyJWT,depositCash)
router.route("/withdrawCash").post(verifyJWT,withdrawCash)

export default router