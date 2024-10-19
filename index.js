import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { OpenAI } from "openai";
import { createListAndAddContacts } from "./new.js";
import { getAllUsersController } from "./init.js";

dotenv.config();

const app = express();
app.use(express.json());

const openai = new OpenAI(process.env.OPENAI_API_KEY);

const allowedOrigins = [
  "*",
  "https://www.agentcoach.ai",
  "https://brochure-pro.vercel.app",
  "http://localhost:3000",
  "http://localhost:3001",
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

app.get("/api/users", getAllUsersController);


app.post("/api/list/send-user-data", async (req, res) => {
  const { listName } = req.body;
  const response = await createListAndAddContacts(listName);
  res.status(200).json(response);
});

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
As an expert real estate copywriter with deep knowledge of local markets, create an exceptionally detailed and personalized property listing description for the following property:

Property Details:
- Listing Type: ${data.listingType}
- Full Address: ${data.propertyAddress}
- Property Type: ${data.propertyType}
- Location and Amenities: ${data.locationAmenities}
- Property Description: ${data.propertyDescription}
- Interior Features: ${data.interiorFeatures}
- Exterior Features: ${data.exteriorFeatures}

Your task is to craft an engaging, highly detailed, and personalized property listing that showcases this specific property's unique features and its location's benefits. Use the provided information to paint a vivid picture that will resonate with potential buyers.

Guidelines:
1. Thoroughly analyze the property's location, nearby amenities, and local attractions. Incorporate specific details about the neighborhood, highlighting what makes it special.
2. Dive deep into the property's features, emphasizing unique selling points and how they contribute to a desirable lifestyle.
3. Use sensory language to help potential buyers imagine themselves living in the property.
4. Tailor the tone and style to match the property type and likely target audience.
5. Include relevant local market insights if applicable (e.g., "in the highly sought-after [neighborhood name]").

Provide the enhanced brochure content in the following JSON format:

{
  "headline": "An attention-grabbing headline that incorporates a key feature or location benefit (max 12 words)",
  "tagline": "A compelling tagline that complements the headline and adds another layer of appeal (max 20 words)",
  "overview": "A detailed yet concise summary highlighting the property's most impressive features and its location benefits (3-4 sentences)",
  "locationHighlights": [
    "2-3 specific points about the property's location, nearby amenities, or community features (detailed bullet points)"
  ],
  "propertyFeatures": {
    "exterior": "A paragraph detailing the exterior features, architecture, and outdoor spaces (3-4 sentences)",
    "interior": "A paragraph describing the interior layout, key rooms, and standout features (4-5 sentences)",
    "uniqueSellingPoints": [
      "2-3 standout features or selling points that make this property special (detailed bullet points)"
    ]
  },
  "lifestyleDescription": "A paragraph painting a picture of the lifestyle this property offers, incorporating location benefits and property features (3-4 sentences)",
  "marketInsight": "A brief statement about the property's value proposition in the current local market (1-2 sentences)",
  "callToAction": "A compelling call-to-action encouraging potential buyers to take the next step, mentioning a key feature or benefit as motivation (1-2 sentences)"
}

Ensure each section is highly detailed and specific to this property and its location. The description should be vivid, factual, and optimized for marketing purposes while maintaining a professional tone. The output must be a valid JSON object that can be parsed directly.
`;


app.get("/", (req, res) => {
  res.send("Server is healthy");
});

app.post("/generate-description", validateInput, async (req, res) => {
  try {
    const prompt = generateOptimizedBrochurePrompt(req.body);

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: prompt }],
    });

    let brochureContent = response.choices[0].message.content;

    brochureContent = brochureContent
      .replace(/^```json\s*/, "")
      .replace(/\s*```$/, "");

    let jsonResponse;
    try {
      jsonResponse = JSON.parse(brochureContent);
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError);
      return res.status(500).json({ error: "Invalid JSON response from AI" });
    }

    console.log("Parsed jsonResponse", jsonResponse);

    res.status(200).json(jsonResponse);
  } catch (error) {
    console.error("Error generating property brochure content:", error);
    res
      .status(500)
      .json({ error: "Error generating property brochure content" });
  }
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const formatEmailContent = (brochureContent) => {
  const { headline, tagline, overview, keyFeatures, end, callToAction } =
    JSON.parse(brochureContent);

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${headline}</title>
      <style>
        body {
          font-family: 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f4f4f9;
        }
        h1 {
          color: #2c3e50;
          font-size: 28px;
          margin-bottom: 10px;
          text-align: center;
        }
        h2 {
          color: #34495e;
          font-size: 20px;
          font-style: italic;
          margin-bottom: 20px;
          text-align: center;
        }
        h3 {
          color: #2980b9;
          font-size: 22px;
          margin-top: 30px;
          margin-bottom: 10px;
        }
        ul {
          padding-left: 20px;
          list-style-type: none;
        }
        ul li {
          background: #ecf0f1;
          margin: 5px 0;
          padding: 10px;
          border-radius: 5px;
        }
        .cta {
          background-color: #3498db;
          color: white;
          padding: 12px 25px;
          text-decoration: none;
          display: inline-block;
          border-radius: 5px;
          margin-top: 20px;
          text-align: center;
          font-weight: bold;
        }
        .cta:hover {
          background-color: #2980b9;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          font-size: 12px;
          color: #7f8c8d;
        }
        .key-features {
          color: #000000;
        }
      </style>
    </head>
    <body>
      <h1>${headline}</h1>
      <h2>${tagline}</h2>
      <p>${overview}</p>
      <h3 class="key-features">Key Features:</h3>
      <ul>
        ${keyFeatures.map((feature) => `<li>${feature}</li>`).join("")}
      </ul>
      <p>${end}</p>
      <p><strong>${callToAction}</strong></p>
      <div class="footer">
        <p>Thank you for considering our property. We look forward to assisting you.</p>
      </div>
    </body>
    </html>
  `;
};

app.post("/send-email", async (req, res) => {
  const { to, subject, brochureContent } = req.body;

  if (!brochureContent) {
    return res.status(400).json({ error: "Brochure content is required" });
  }

  const emailBody = formatEmailContent(brochureContent);

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    html: emailBody,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
