import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase payload limits for sending file codebases
app.use(express.json({ limit: "10mb" }));

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
} else {
  console.warn("WARNING: GEMINI_API_KEY environment variable is not set. AI Copilot features will be inactive.");
}

// 1. Health check API
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    aiEnabled: !!ai,
    timestamp: new Date().toISOString()
  });
});

// 2. Power BI Custom Visual Copilot API (using Gemini)
app.post("/api/copilot", async (req, res) => {
  try {
    if (!ai) {
      return res.status(400).json({
        error: "AI service is not configured. Please add GEMINI_API_KEY in Settings."
      });
    }

    const { prompt, files, templateType } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "No prompt was provided." });
    }

    const systemInstruction = `You are an elite Power BI Custom Visuals developer specializing in typescript and d3.js visual design, utilizing the powerbi-visuals-api standard structures.
Given a user prompt explaining an enhancement or modification they want to apply to their Power BI custom visual project, your objective is to modify the files: \`src/visual.ts\`, \`capabilities.json\` and \`style/visual.less\` if needed, to achieve the objective perfectly.

Keep your edits clean, professional, and strictly compliant with standard pbiviz formatting.
Return the updated code block files in a JSON format.

Your output MUST be a JSON object containing:
{
  "explanation": "A concise explanation of the changes made",
  "files": {
    "src/visual.ts": "The entire, correct and compilable TypeScript code for the visual. It must implement any requested visual elements using d3.js or manual DOM injection. Address options.dataViews inside update().",
    "capabilities.json": "The corrected capabilities configuration including updated dataRoles, dataViewMappings and objects options.",
    "style/visual.less": "The LESS style file content"
  }
}`;

    const contents = `
Theme/Template Type: ${templateType || "Generic"}
Current files provided:

--- capabilities.json ---
${files["capabilities.json"] || ""}

--- src/visual.ts ---
${files["src/visual.ts"] || ""}

--- style/visual.less ---
${files["style/visual.less"] || ""}

User Request: "${prompt}"

Provide the updated visual.ts, capabilities.json, and style/visual.less in the requested JSON structure. Ensure you write clean, compilable, complete, non-truncated TypeScript and JSON. Avoid placeholders like "// ...rest of code remains the same...". Write full complete files.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            explanation: {
              type: Type.STRING,
              description: "A friendly and professional summary of the changes."
            },
            files: {
              type: Type.OBJECT,
              properties: {
                "src/visual.ts": { type: Type.STRING },
                "capabilities.json": { type: Type.STRING },
                "style/visual.less": { type: Type.STRING }
              },
              required: ["src/visual.ts", "capabilities.json", "style/visual.less"]
            }
          },
          required: ["explanation", "files"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No response text received from the Gemini model.");
    }

    const data = JSON.parse(resultText);
    res.json(data);
  } catch (error: any) {
    console.error("Gemini Copilot Error:", error);
    res.status(500).json({
      error: "Failed to generate visual modifications.",
      details: error.message || error
    });
  }
});

// Configure Vite middleware in development vs static hosting in production
async function mountViteMiddleware() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development server middleware mounted.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving static production assets from:", distPath);
  }
}

mountViteMiddleware().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server successfully started. Running on port ${PORT}`);
  });
}).catch((err) => {
  console.error("Critical server startup error:", err);
});
