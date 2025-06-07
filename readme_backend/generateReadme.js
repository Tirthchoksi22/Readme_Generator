// generateReadme.js
import { ChatGroq } from "@langchain/groq";
import * as dotenv from "dotenv";

dotenv.config();

if (!process.env.GROQ_API_KEY) {
  console.error("GROQ_API_KEY is not set in environment variables");
  process.exit(1);
}

const chatModel = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  modelName: "llama3-70b-8192",
  temperature: 0.5,
});

export async function generateReadme(files) {
  try {
    console.log("Starting README generation...");
    
    // Format code data for the prompt
    const codeData = Object.entries(files)
      .map(([name, content]) => `### File: ${name}\n\`\`\`\n${content}\n\`\`\``)
      .join("\n\n");

    console.log("Formatted code data for prompt");

    const prompt = `
You are an expert open-source developer and technical writer.

Generate a professional, markdown-formatted README.md file based on the following project files.

README must include:
- Project title
- description of 200 words
- Features
- Tech stack
- Setup & Installation
- Usage
- License
- (Optional) Contribution guidelines

Here is the code:

${codeData}
`;

    console.log("Sending request to Groq...");
    const response = await chatModel.invoke(prompt);
    console.log("Received response from Groq");

    if (!response || !response.content) {
      throw new Error("No content received from Groq");
    }

    return response.content;
  } catch (error) {
    console.error("Error in generateReadme:", error);
    throw error;
  }
}

