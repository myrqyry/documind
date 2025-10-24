import { GoogleGenAI } from '@google/genai';
import type { OptimizedContext } from '../types.js';

export class FormatGenerator {
  constructor(private gemini: GoogleGenAI) {}

  async generate(context: OptimizedContext, formats: string[]): Promise<any> {
    // TODO: Implement format generation
    return {};
  }
}