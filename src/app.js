import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: "16Kb" }));
app.use(express.urlencoded({ extended: true, limit: "16Kb" }));
app.use(express.static("public"));
app.use(cookieParser());
//route
import userRouter from "./routes/user.routes.js";
import transactionRouter from "./routes/transaction.routes.js";
import bankRouter from "./routes/bank.routes.js";
import categoryRouter from "./routes/category.routes.js";
import transactionTypeRouter from "./routes/transactionType.routes.js";
import paymentTypeRouter from "./routes/paymentType.routes.js";

app.get("/", (req, res) => {
  res.json("Personal Acount App Node Js");
});
// app.use("/user", userRouter);
app.use("/api/users", userRouter);
app.use("/api/transaction", transactionRouter);
app.use("/api/bank", bankRouter);
app.use("/api/category", categoryRouter);
app.use("/api/transactionType", transactionTypeRouter);
app.use("/api/paymentType", paymentTypeRouter);

export { app };
