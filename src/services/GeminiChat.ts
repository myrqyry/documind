import { GoogleGenerativeAI } from '@google/genai';
import { ChatMessage } from '../types';
import { randomUUID } from 'crypto';

export class GeminiChat {
  private genAI: GoogleGenerativeAI;
  private model: string;

  constructor(genAI: GoogleGenerativeAI, model: string = 'gemini-2.5-pro') {
    this.genAI = genAI;
    this.model = model;
  }

  async sendMessage(history: ChatMessage[], newMessage: string): Promise<ChatMessage> {
    const model = this.genAI.getGenerativeModel({ model: this.model });

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
      id: `msg-${randomUUID()}`,
      role: 'assistant',
      content: text,
      timestamp: new Date(),
    };
  }
}
