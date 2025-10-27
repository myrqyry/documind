import { GoogleGenAI } from '@google/genai';
import type { ParsedDocument, SemanticAnalysis, KnowledgeGraph } from '../types.js';
import { DocumentProcessingError } from '../utils/errors.js';

export class SemanticAnalyzer {
  constructor(private gemini: GoogleGenAI) {}

  async analyze(document: ParsedDocument): Promise<SemanticAnalysis> {
    const model = this.gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Analyze this document and extract entities, relationships, and concepts:
    ${document.content.substring(0, 8000)}...`;

    try {
      const result = await model.generateContent(prompt);
      const response = result.response.text();
      // Parse AI response into structured format
      return this.parseAnalysisResponse(response, document);
    } catch (error) {
      throw new DocumentProcessingError(
        'Failed to analyze document semantics',
        'SEMANTIC_ANALYSIS_FAILED',
        error
      );
    }
  }

  private parseAnalysisResponse(response: string, document: ParsedDocument): SemanticAnalysis {
    try {
      const parsed = JSON.parse(response);
      return {
        entities: parsed.entities || [],
        relationships: parsed.relationships || [],
        concepts: parsed.concepts || [],
        dependencies: parsed.dependencies || [],
        learningPath: parsed.learningPath || [],
      };
    } catch (error) {
      throw new DocumentProcessingError(
        'Failed to parse semantic analysis response',
        'SEMANTIC_ANALYSIS_PARSE_FAILED',
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
