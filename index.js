const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const OpenAIApi = require("openai");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const openai = new OpenAIApi(process.env.OPENAI_API_KEY);

app.get("/", (req, res) => {
  res.send("server is healthy");
});
// Route to generate the property listing description
app.post("/generate-description", async (req, res) => {
  try {
    const { listingType, location, propertyDetails, keySellingPoints } =
      req.body;

    // Ensure all required fields are provided
    if (!listingType || !location || !propertyDetails || !keySellingPoints) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Create the prompt based on the input
    const prompt = `
      Create a detailed and compelling property listing description based on the following inputs:
      Type of listing: ${listingType}.
      Property Location: ${location}.
      Property Details: ${propertyDetails}.
      Key Selling Points: ${keySellingPoints}.
      
      The description should be professional, optimized for attracting potential buyers or renters, and should include any inferred details where appropriate. It should also include relevant area information.
    `;

    // Call OpenAI to generate the description
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Or whichever model you prefer
      messages: [{
        role: "user",
        content: prompt,
      }],
    });

    // Send the AI-generated description back to the client
    const description = response.choices[0].message.content
    res.status(200).json({ description });
  } catch (error) {
    console.error("Error generating property description:", error);
    res.status(500).json({ message: "Error generating property description" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`server listening http://localhost:${PORT}`);
});
