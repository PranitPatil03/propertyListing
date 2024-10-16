const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { OpenAI } = require("openai");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI(process.env.OPENAI_API_KEY);

const allowedOrigins = ['https://brochure-pro.vercel.app', 'http://localhost:3001'];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
}));

const validateInput = (req, res, next) => {
  const requiredFields = [
    "listingType",
    "propertyAddress",
    "propertyType",
    "locationAmenities",
    "propertyDescription",
    "interiorFeatures",
    "exteriorFeatures",
  ];

  for (const field of requiredFields) {
    if (!req.body[field]) {
      return res
        .status(400)
        .json({ error: `Missing required field: ${field}` });
    }
  }
  next();
};

const generateOptimizedBrochurePrompt = (data) => `
As an expert real estate copywriter, create compelling and concise brochure content for the following property:

Property Details:
- Listing Type: ${data.listingType}
- Address: ${data.propertyAddress}
- Property Type: ${data.propertyType}
- Location and Amenities: ${data.locationAmenities}
- Property Description: ${data.propertyDescription}
- Interior Features: ${data.interiorFeatures}
- Exterior Features: ${data.exteriorFeatures}

Create engaging, balanced content for a professional property brochure. The content should be concise yet impactful, highlighting the property's key features and appeal. Focus on the most attractive aspects and unique selling points.

Provide the brochure content in the following JSON format:

{
  "headline": "A catchy, attention-grabbing headline (max 10 words)",
  "tagline": "A brief, compelling tagline that complements the headline (max 15 words)",
  "overview": "A concise summary highlighting key features and overall appeal (2-3 sentences)",
  "keyFeatures": [
    "5-6 standout features or selling points of the property (bullet points)"
  ],
  "end": "A concise yet comprehensive description combining location highlights, interior features, exterior and outdoor amenities, and any additional perks. Focus on the most impressive and unique aspects of each category. (3-4 sentences)",
  "callToAction": "A compelling call-to-action statement encouraging potential buyers to take the next step (1 sentence)"
}

Use vivid, descriptive language to create desire for the property. Be concise but impactful, focusing on the most attractive aspects. Ensure the content is factual, professional, and optimized for marketing purposes. The output should be a valid JSON object that can be parsed directly.
`;

app.get("/", (req, res) => {
  res.send("Server is healthy");
});

app.post("/generate-description", validateInput, async (req, res) => {
  try {
    const prompt = generateOptimizedBrochurePrompt(req.body);
    console.log("Optimized prompt:", prompt);

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 800,
    });

    const brochureContent = response.choices[0].message.content;

    const jsonResponse = JSON.parse(brochureContent);

    res.status(200).json(jsonResponse);
  } catch (error) {
    console.error("Error generating property brochure content:", error);
    res
      .status(500)
      .json({ error: "Error generating property brochure content" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
