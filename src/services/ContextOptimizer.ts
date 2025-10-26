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
  async optimize(
    document: ParsedDocument,
    analysis: SemanticAnalysis,
    graph: KnowledgeGraph,
    options: ProcessingOptions
  ): Promise<OptimizedContext> {
    const chunks = await this.performSemanticChunking(document);
    this.enrichChunks(chunks, analysis, graph);
    await this.applyModelOptimizations(chunks, options);

    const totalTokens = chunks.reduce((sum, chunk) => sum + chunk.tokens, 0);
    const compressionRatio = await this.calculateCompression(document, totalTokens);

    return {
      chunks,
      totalTokens,
      compressionRatio,
      modelOptimizations: [],
      qualityScore: this.calculateQualityScore(chunks),
    };
  }

  private async performSemanticChunking(document: ParsedDocument): Promise<ContextChunk[]> {
    const chunks: ContextChunk[] = [];
    if (document.structure.sections.length > 0) {
      for (const section of document.structure.sections) {
        chunks.push(await this.createChunkFromSection(section));
      }
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
          tokens: await this.countTokens(chunkContent),
          importance: 0.5,
          prerequisites: [],
          relatedChunks: [],
          metadata: {},
        });
      }
    }
    return chunks;
  }

  private async createChunkFromSection(section: Section): Promise<ContextChunk> {
    const content = `${section.title}\n${section.content}`;
    return {
      id: `chunk-sec-${section.id}`,
      content: content,
      type: 'content',
      tokens: await this.countTokens(content),
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

  private async applyModelOptimizations(
    chunks: ContextChunk[],
    options: ProcessingOptions
  ) {
    // Example: Add special tokens or formatting for a specific model
    if (options.targetModel === 'gemini-2.5-pro') {
      for (const chunk of chunks) {
        chunk.content = `[START_CHUNK]\n${chunk.content}\n[END_CHUNK]`;
        chunk.tokens = await this.countTokens(chunk.content);
      }
    }
  }

  private async countTokens(text: string): Promise<number> {
    const model = this.gemini.getGenerativeModel({ model: "gemini-pro" });
    const { totalTokens } = await model.countTokens(text);
    return totalTokens;
  }

  private async calculateCompression(
    document: ParsedDocument,
    optimizedTokens: number
  ): Promise<number> {
    const originalTokens = await this.countTokens(document.content);
    return originalTokens > 0 ? optimizedTokens / originalTokens : 0;
  }

  private calculateQualityScore(chunks: ContextChunk[]): number {
      const totalImportance = chunks.reduce((sum, chunk) => sum + chunk.importance, 0);
      return chunks.length > 0 ? totalImportance / chunks.length : 0;
  }
}
