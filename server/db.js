// db.js
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const uri = process.env.MONGO_URI;
if (!uri) throw new Error("Falta MONGO_URI en .env");

export async function connectMongo() {
  await mongoose.connect(uri);
  console.log("✅ MongoDB conectado");
}
