import { GoogleGenAI } from '@google/genai';
import { zodToJsonSchema } from 'zod-to-json-schema';
import type { ParsedDocument, SemanticAnalysis, KnowledgeGraph } from '../types.js';
import { DocumentProcessingError } from '../utils/errors.js';
import { semanticAnalysisSchema } from '../schemas.js';

export class SemanticAnalyzer {
  constructor(private gemini: GoogleGenAI) {}

  async analyze(document: ParsedDocument): Promise<SemanticAnalysis> {
    const model = this.gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Analyze this document and extract entities, relationships, and concepts:
    ${document.content.substring(0, 8000)}...`;

    try {
      const result = await model.generateContent({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: zodToJsonSchema(semanticAnalysisSchema),
        },
      });
      const response = result.response;
      const json = JSON.parse(response.candidates[0].content.parts[0].text);
      return semanticAnalysisSchema.parse(json);
    } catch (error) {
      throw new DocumentProcessingError(
        'Failed to analyze document semantics',
        'SEMANTIC_ANALYSIS_FAILED',
        error
      );
    }
  }

  async buildKnowledgeGraph(analysis: SemanticAnalysis): Promise<KnowledgeGraph> {
    const nodes = analysis.entities.map(entity => ({
      id: entity.id,
      label: entity.name,
      type: entity.type,
      importance: entity.importance,
      properties: {},
    }));

    const edges = analysis.relationships.map(rel => ({
      source: rel.source,
      target: rel.target,
      type: rel.type,
      weight: rel.strength,
      properties: {},
    }));

    return { nodes, edges, clusters: [], centralNodes: [] };
  }
}
