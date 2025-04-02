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
import transactionRouter from "./routes/transection.routes.js";
import bankRouter from "./routes/bank.routes.js";
import cashRouter from "./routes/cash.routes.js";

app.get("/", (req, res) => {
  res.json("Personal Acount App Node Js");
});
// app.use("/user", userRouter);
app.use("/api/users/", userRouter);
app.use("/api/transection", transactionRouter);
app.use("/api/bank", bankRouter);
app.use("/api/cash", cashRouter);

export { app };
