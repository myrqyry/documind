import { GoogleGenAI } from '@google/genai';

export class GeminiChat {
  constructor(private gemini: GoogleGenAI) {}

  async sendMessage(message: string, documentId?: string): Promise<string> {
    // TODO: Implement chat functionality
    return 'Response from Gemini Chat';
  }
}