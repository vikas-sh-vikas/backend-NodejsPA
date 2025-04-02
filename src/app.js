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

app.get("/", (req, res) => {
  res.json("Personal Acount App Node Js");
});
app.use("/user", userRouter);

export { app };
