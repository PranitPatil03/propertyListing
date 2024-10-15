const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { OpenAI } = require("openai");

dotenv.config();

const app = express();

app.use(cors({
  origin: 'https://brochure-pro.vercel.app'
}));
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
      
      Please provide the response in the following format:
      Title: A catchy title for the listing
      Main Description: The main body of the property description
      Property Highlights: A list of key property highlights
      Additional Features: Any additional notable features
      Location Advantages: Advantages of the property's location
      Conclusion: A concluding statement to encourage interest
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
    
    const sections = descriptionText.split('\n\n');
    const description = {
      title: sections[0].replace(/^(?:\*\*)?Title:(?:\*\*)?\s*/, '').trim(),
      mainDescription: sections[1].replace(/^(?:\*\*)?Main Description:(?:\*\*)?\s*/, '').trim(),
      propertyHighlights: sections[2].replace(/^(?:\*\*)?Property Highlights:(?:\*\*)?\s*/, '').trim(),
      additionalFeatures: sections[3].replace(/^(?:\*\*)?Additional Features:(?:\*\*)?\s*/, '').trim(),
      locationAdvantages: sections[4].replace(/^(?:\*\*)?Location Advantages:(?:\*\*)?\s*/, '').trim(),
      conclusion: sections[5].replace(/^(?:\*\*)?Conclusion:(?:\*\*)?\s*/, '').trim(),
    };

    console.log("description", description);
    res.status(200).json({ description }); 
  } catch (error) {
    console.error("Error generating property description:", error);
    res.status(500).json({ message: "Error generating property description", error: error.message });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`server listening http://localhost:${PORT}`);
});
