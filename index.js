import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { OpenAI } from "openai";
import nodemailer from "nodemailer";
import { addMultipleUsers } from "./active.js"; // Ensure to add .js extension
import { createListAndAddContacts } from "./new.js";
// import { createListAndAddContacts } from "./new.js";

dotenv.config();

const app = express();
app.use(express.json());

const openai = new OpenAI(process.env.OPENAI_API_KEY);

const allowedOrigins = [
  "https://brochure-pro.vercel.app",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);

app.get("/api/list/send-user-data", async (req, res) => {
  const response = await createListAndAddContacts();
  res.status(200).json(response);
});

app.get("/", (req, res) => {
  res.send("Server is healthy");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
