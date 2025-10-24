import { GoogleGenerativeAI } from '@google/genai';
import { ChatMessage, DocuMindConfig } from '../types';

export class GeminiChat {
  private genAI: GoogleGenerativeAI;

  constructor(config: DocuMindConfig) {
    this.genAI = new GoogleGenerativeAI(config.geminiApiKey);
  }

  async sendMessage(history: ChatMessage[], newMessage: string): Promise<ChatMessage> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });

    const chat = model.startChat({
      history: history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }],
      })),
    });

    const result = await chat.sendMessage(newMessage);
    const response = result.response;
    const text = response.text();

    return {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: text,
      timestamp: new Date(),
    };
  }
}
