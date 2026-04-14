import { GoogleGenAI } from "@google/genai";
import { SystemSettings } from "../store/settingsStore";

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export async function getAIChatResponse(
  messages: ChatMessage[],
  settings: SystemSettings,
  context?: string
) {
  if (settings.AI_PROVIDER === 'gemini') {
    const apiKey = settings.AI_API_KEY || (process.env.GEMINI_API_KEY as string);
    
    if (!apiKey) {
      throw new Error("AI API Key is not configured.");
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const systemInstruction = `
      ${settings.AI_SYSTEM_PROMPT}
      
      Dưới đây là kiến thức chuyên môn bổ sung:
      ${settings.AI_KNOWLEDGE_BASE}
      
      ${context ? `Bối cảnh hiện tại (Kết quả khảo sát của người dùng): ${context}` : ''}
      
      Hãy trả lời bằng ngôn ngữ của người dùng (mặc định là tiếng Việt).
    `;

    const history = messages.slice(0, -1).map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    const lastMessage = messages[messages.length - 1].text;

    try {
      const response = await ai.models.generateContent({
        model: settings.AI_MODEL || "gemini-3-flash-preview",
        contents: [
          ...history,
          { role: 'user', parts: [{ text: lastMessage }] }
        ],
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        },
      });

      return response.text || "Xin lỗi, tôi không thể trả lời lúc này.";
    } catch (error) {
      console.error("AI Error:", error);
      throw error;
    }
  } else if (settings.AI_PROVIDER === 'openai') {
    // Placeholder for OpenAI integration if needed later
    return "Tích hợp OpenAI đang được phát triển.";
  }

  return "AI Provider không được hỗ trợ.";
}
