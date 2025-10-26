import { GoogleGenAI } from '@google/genai';
import type { ParsedDocument, SemanticAnalysis, KnowledgeGraph } from '../types.js';

export class SemanticAnalyzer {
  constructor(private gemini: GoogleGenAI) {}

  async analyze(document: ParsedDocument): Promise<SemanticAnalysis> {
    const model = this.gemini.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `Analyze the following document and extract key entities, relationships, and concepts. Return the result as a JSON object with the following structure: { "entities": [], "relationships": [], "concepts": [] }.\n\nDocument: ${document.content}`;

    try {
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      const parsed = JSON.parse(text);
      return {
        entities: parsed.entities || [],
        relationships: parsed.relationships || [],
        concepts: parsed.concepts || [],
        dependencies: [],
        learningPath: [],
      };
    } catch (error) {
      console.error("Error analyzing document:", error);
      return { entities: [], relationships: [], concepts: [], dependencies: [], learningPath: [] };
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