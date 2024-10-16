const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { OpenAI } = require("openai");
const nodemailer = require("nodemailer");

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
