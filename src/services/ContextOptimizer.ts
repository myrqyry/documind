import {
  ParsedDocument,
  SemanticAnalysis,
  KnowledgeGraph,
  OptimizedContext,
  ContextChunk,
  ProcessingOptions,
  Section,
} from '../types';

export class ContextOptimizer {
  constructor() {}

  async optimize(
    document: ParsedDocument,
    analysis: SemanticAnalysis,
    graph: KnowledgeGraph,
    options: ProcessingOptions
  ): Promise<OptimizedContext> {
    const chunks = this.performSemanticChunking(document);
    this.enrichChunks(chunks, analysis, graph);
    this.applyModelOptimizations(chunks, options);

    const totalTokens = chunks.reduce((sum, chunk) => sum + chunk.tokens, 0);
    const compressionRatio = this.calculateCompression(document, totalTokens);

    return {
      chunks,
      totalTokens,
      compressionRatio,
      modelOptimizations: [],
      qualityScore: this.calculateQualityScore(chunks),
    };
  }

  private performSemanticChunking(document: ParsedDocument): ContextChunk[] {
    const chunks: ContextChunk[] = [];
    if (document.structure.sections.length > 0) {
      document.structure.sections.forEach(section => {
        chunks.push(this.createChunkFromSection(section));
      });
    } else {
      // Fallback for documents with no clear section structure
      const content = document.content;
      const chunkSize = 1500; // Increased chunk size
      for (let i = 0; i < content.length; i += chunkSize) {
        const chunkContent = content.substring(i, i + chunkSize);
        chunks.push({
          id: `chunk-fallback-${i}`,
          content: chunkContent,
          type: 'content',
          tokens: this.countTokens(chunkContent),
          importance: 0.5,
          prerequisites: [],
          relatedChunks: [],
          metadata: {},
        });
      }
    }
    return chunks;
  }

  private createChunkFromSection(section: Section): ContextChunk {
    const content = `${section.title}\n${section.content}`;
    return {
      id: `chunk-sec-${section.id}`,
      content: content,
      type: 'content',
      tokens: this.countTokens(content),
      importance: 1.0 - (section.level * 0.2), // Higher level = more important
      prerequisites: section.parent ? [`chunk-sec-${section.parent}`] : [],
      relatedChunks: section.children.map(childId => `chunk-sec-${childId}`),
      metadata: {
        title: section.title,
        level: section.level,
      },
    };
  }

  private enrichChunks(
    chunks: ContextChunk[],
    analysis: SemanticAnalysis,
    graph: KnowledgeGraph
  ) {
    chunks.forEach(chunk => {
      const chunkEntities = analysis.entities.filter(entity =>
        chunk.content.includes(entity.name)
      );
      chunk.metadata.entities = chunkEntities.map(e => e.id);
      chunk.importance += chunkEntities.length * 0.05; // Boost importance based on entity count
    });
  }

  private applyModelOptimizations(
    chunks: ContextChunk[],
    options: ProcessingOptions
  ) {
    // Example: Add special tokens or formatting for a specific model
    if (options.targetModel === 'gemini-2.5-pro') {
      chunks.forEach(chunk => {
        chunk.content = `[START_CHUNK]\n${chunk.content}\n[END_CHUNK]`;
        chunk.tokens = this.countTokens(chunk.content);
      });
    }
  }

  private countTokens(text: string): number {
      return Math.ceil(text.length / 4);
  }

  private calculateCompression(
    document: ParsedDocument,
    optimizedTokens: number
  ): number {
    const originalTokens = this.countTokens(document.content);
    return originalTokens > 0 ? optimizedTokens / originalTokens : 0;
  }

  private calculateQualityScore(chunks: ContextChunk[]): number {
      const totalImportance = chunks.reduce((sum, chunk) => sum + chunk.importance, 0);
      return chunks.length > 0 ? totalImportance / chunks.length : 0;
  }
}
