// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { generateReadme } from "./generateReadme.js";

dotenv.config();
const app = express();

// Enable CORS with specific options
app.use(cors({
  origin: 'https://readme-generator-ecru.vercel.app/',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

// Increase JSON payload limit and add raw body logging
app.use(express.json({ 
  limit: "10mb",
  verify: (req, res, buf) => {
    try {
      console.log("Raw request body:", buf.toString());
    } catch (e) {
      console.error("Error parsing request body:", e);
    }
  }
}));

// Handle file uploads
app.post("/api/generate-from-files", async (req, res) => {
  try {
    console.log("Headers:", req.headers);
    console.log("Request body type:", typeof req.body);
    console.log("Request body:", JSON.stringify(req.body, null, 2));

    const { files } = req.body;

    if (!files) {
      console.log("No files object in request body");
      return res.status(400).json({ error: "No files object in request body" });
    }

    if (typeof files !== 'object') {
      console.log("Files is not an object:", typeof files);
      return res.status(400).json({ error: "Files must be an object" });
    }

    if (Object.keys(files).length === 0) {
      console.log("Files object is empty");
      return res.status(400).json({ error: "No files provided" });
    }

    console.log("Files received:", Object.keys(files));
    console.log("Generating README from files...");
    const readme = await generateReadme(files);
    console.log("README generated successfully");
    res.json({ readme });
  } catch (err) {
    console.error("Error generating README:", err);
    res.status(500).json({ 
      error: err.message || "Something went wrong",
      details: err.stack
    });
  }
});

// Handle GitHub repository
app.post("/api/generate-from-github", async (req, res) => {
  try {
    console.log("GitHub request body:", req.body);
    const { owner, repo } = req.body;

    if (!owner || !repo) {
      console.log("Missing owner or repo in request");
      return res.status(400).json({ error: "Owner and repository name are required." });
    }

    console.log("Generating README from GitHub...");
    const readme = await generateReadme({ owner, repo });
    console.log("README generated successfully");
    res.json({ readme });
  } catch (err) {
    console.error("Error generating README:", err);
    res.status(500).json({ 
      error: err.message || "Something went wrong",
      details: err.stack
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log("CORS enabled for:", 'http://localhost:3000');
});
