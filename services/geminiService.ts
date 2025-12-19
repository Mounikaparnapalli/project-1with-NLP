
import { GoogleGenAI, Type } from "@google/genai";
import { ChatMessage, AnalysisResult, ThreatLevel } from "../types";

const API_KEY = process.env.API_KEY || '';

export const analyzeMessages = async (messages: ChatMessage[]): Promise<AnalysisResult[]> => {
  if (!API_KEY) {
    throw new Error("API Key is missing. Please ensure process.env.API_KEY is set.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  // To optimize, we send batches of messages
  // We'll limit the prompt size for stability
  const promptData = messages.map(m => ({
    id: m.id,
    sender: m.sender,
    text: m.content
  }));

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze these WhatsApp messages for cyber threats (phishing, financial fraud, social engineering, identity theft, malicious links, urgency tactics). 
    Messages: ${JSON.stringify(promptData)}`,
    config: {
      systemInstruction: `You are a world-class Cybersecurity Analyst and NLP specialist. 
      Your task is to identify fraudulent or threatening messages in a chat history.
      High-risk indicators: 
      - Requests for passwords, OTPs, or banking details.
      - Suspicious external links (especially shortened ones).
      - Extreme urgency or fear-based tactics.
      - "Too good to be true" offers or lottery wins.
      - Impersonation of officials or support.
      
      Respond ONLY with a JSON array of AnalysisResult objects matching the schema.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            messageId: { type: Type.STRING, description: "The ID of the message being analyzed" },
            isThreat: { type: Type.BOOLEAN, description: "True if any threat is detected" },
            threatLevel: { 
              type: Type.STRING, 
              enum: Object.values(ThreatLevel),
              description: "The severity of the threat"
            },
            threatType: { type: Type.STRING, description: "Short label like 'Phishing', 'Social Engineering', etc." },
            explanation: { type: Type.STRING, description: "Concise explanation of why this is a threat" }
          },
          required: ["messageId", "isThreat", "threatLevel", "threatType", "explanation"]
        }
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    console.error("Failed to parse Gemini response:", e);
    return [];
  }
};
