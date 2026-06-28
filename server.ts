import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const PORT = 3000;

async function startServer() {
  const app = express();
  
  // Middleware to parse JSON bodies up to 10MB (for base64 images)
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ limit: "10mb", extended: true }));

  // Helper to lazily initialize GoogleGenAI client
  let aiClient: GoogleGenAI | null = null;
  function getGeminiClient(): GoogleGenAI {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === "MY_GEMINI_API_KEY") {
      throw new Error("GEMINI_API_KEY environment variable is required but is missing or not configured. Please add your Gemini API key in the AI Studio Settings menu.");
    }
    if (!aiClient) {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
    return aiClient;
  }

  // API endpoint for analyzing a reported civic issue
  app.post("/api/analyze-issue", async (req, res) => {
    const { description, location, image } = req.body;

    if (!description || !location) {
      return res.status(400).json({ error: "Description and Location are required." });
    }

    try {
      const ai = getGeminiClient();

      const parts: any[] = [];
      if (image && typeof image === "string" && image.includes("base64,")) {
        const partsArr = image.split("base64,");
        const header = partsArr[0];
        const mimeTypeMatch = header.match(/data:([^;]+);/);
        const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : "image/jpeg";
        const base64Data = partsArr[1];
        parts.push({
          inlineData: {
            mimeType,
            data: base64Data,
          },
        });
      }
      
      parts.push({
        text: `Location: ${location}. Note: ${description}`,
      });

      // Call Gemini 3.5 Flash with standard system instructions and search grounding tools
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: parts,
        config: {
          systemInstruction: `Act as an advanced global urban infrastructure assessor. Analyze uploaded multi-modal media of civic issues from any location worldwide. Execute four tasks: 1. Critical Assessment (category/threat level). 2. Grounded Routing (Use Google Search Grounding to find the official department name). 3. Predictive Insight (7-day risk forecast). 4. Gamification Logic (Calculate XP tokens and award a badge name). Output the final result strictly as a structured JSON object matching the keys: category, severity_level, official_department, predictive_insight, xp_reward, badge_awarded, formal_manifesto.

Example Interaction:
User: [Image] Location: Bandra West, Mumbai. Note: Water flooding.
Model: {"category": "Public Utilities", "severity_level": "Critical", "official_department": "BMC", "predictive_insight": "Erosion in 48 hours.", "xp_reward": 250, "badge_awarded": "Hydro Hero", "formal_manifesto": "OFFICIAL ALERT..."}`,
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              category: {
                type: Type.STRING,
                description: "Categorization of the civic issue (e.g. Road Hazards, Public Utilities, Sanitation, Water Infrastructure, Vandalism & Safety, or Public Parks)",
              },
              severity_level: {
                type: Type.STRING,
                description: "Severity tier of the issue (One of: Low, Medium, High, Critical)",
              },
              official_department: {
                type: Type.STRING,
                description: "Name of the responsible official department or municipality found using Search Grounding, e.g., BMC for Mumbai, Department of Transportation for NY, etc.",
              },
              predictive_insight: {
                type: Type.STRING,
                description: "A 7-day risk forecast detailing what compound hazards occur if neglected.",
              },
              xp_reward: {
                type: Type.INTEGER,
                description: "XP score (integer 40 to 250) reflecting the civic effort",
              },
              badge_awarded: {
                type: Type.STRING,
                description: "The name of a fitting custom badge earned for reporting this specific hazard, e.g. 'Hydro Hero', 'Pothole Patrol', etc.",
              },
              formal_manifesto: {
                type: Type.STRING,
                description: "An official alert manifesto summarizing the threat details and remediation steps.",
              },
            },
            required: [
              "category",
              "severity_level",
              "official_department",
              "predictive_insight",
              "xp_reward",
              "badge_awarded",
              "formal_manifesto"
            ],
          },
        },
      });

      const textResponse = response.text?.trim() || "{}";
      const result = JSON.parse(textResponse);
      return res.json(result);
    } catch (error: any) {
      console.error("Gemini API Error:", error.message || error);
      return res.status(500).json({ error: error.message || "Failed to analyze issue with Gemini AI." });
    }
  });

  // Serve static assets in production; run Vite in development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Community Hero Server] Active on http://0.0.0.0:${PORT} (Production: ${process.env.NODE_ENV === "production"})`);
  });
}

startServer().catch((err) => {
  console.error("Critical error starting Community Hero server:", err);
});
