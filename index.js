import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createListAndAddContacts } from "./new.js";
import { getAllUsersController } from "./init.js";

dotenv.config();

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "*",
  })
);

app.get("/api/users", getAllUsersController);

app.post("/api/list/send-user-data", async (req, res) => {
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
