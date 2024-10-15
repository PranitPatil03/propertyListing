const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { OpenAI } = require("openai");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const openai = new OpenAI(process.env.OPENAI_API_KEY);

app.get("/", (req, res) => {
  res.send("server is healthy");
});

app.post("/generate-description", async (req, res) => {
  try {
    const {
      listingType,
      propertyAddress,
      propertyType,
      locationAmenities,
      propertyDescription,
      interiorFeatures,
      exteriorFeatures,
    } = req.body;

    console.log("req.body", req.body);

    const prompt = `
      Create a detailed and compelling property listing description based on the following inputs:
      Type of listing: ${listingType}.
      Property Address: ${propertyAddress}.
      Property Type: ${propertyType}.
      Location and Nearby Amenities: ${locationAmenities}.
      Property Description: ${propertyDescription}.
      Interior Features: ${interiorFeatures}.
      Exterior Features: ${exteriorFeatures}.
      
      The description should be professional, optimized for attracting potential buyers or renters, and should include any inferred details where appropriate. It should also include relevant area information.
      
      Please provide the response in JSON format with the following fields:
      {
        "title": "A catchy title for the listing",
        "mainDescription": "The main body of the property description",
        "propertyHighlights": "A list of key property highlights",
        "additionalFeatures": "Any additional notable features",
        "locationAdvantages": "Advantages of the property's location",
        "conclusion": "A concluding statement to encourage interest"
      }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const descriptionText = response.choices[0].message.content;
    let description;

    try {
      description = JSON.parse(descriptionText);
    } catch (parseError) {
      console.error("Error parsing JSON response:", parseError);
      description = {
        title: "",
        mainDescription: descriptionText,
        propertyHighlights: "",
        additionalFeatures: "",
        locationAdvantages: "",
        conclusion: "",
      };
    }

    const requiredFields = [
      "title",
      "mainDescription",
      "propertyHighlights",
      "additionalFeatures",
      "locationAdvantages",
      "conclusion",
    ];
    for (const field of requiredFields) {
      if (!description[field]) {
        description[field] = "";
      }
    }

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
