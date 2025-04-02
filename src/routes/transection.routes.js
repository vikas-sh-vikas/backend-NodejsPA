import { Router } from "express";
import {getTransaction,getTransactionById, getRecentTransaction,addEditTransaction} from '../controllers/transection.controller.js';
import { verifyJWT } from "../middlewares/auth.middleware.js";



const router = Router()

//secured routes
router.route("/gettransetion").get(verifyJWT,getTransaction)
router.route("/getTransactionById").post(verifyJWT,getTransactionById)
router.route("/getRecentTransaction").get(verifyJWT,getRecentTransaction)
router.route("/addEditTransaction").post(verifyJWT,addEditTransaction)

export default router