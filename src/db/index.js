import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    const connectinstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    console.log(`Connected on HOST: ${connectinstance.connection.host}`)
    console.log("MongoDB connected...");
  } catch (error) {
    console.log("Error", error);
    process.exit(1);
  }
};
export default connectDB;
