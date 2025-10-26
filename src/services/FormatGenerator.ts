import {
  ProcessingResult,
  GeneratedFile,
  OutputFormat,
  KnowledgeGraph,
  SemanticAnalysis,
  OptimizedContext,
} from '../types';

export class FormatGenerator {
  async generate(
    result: ProcessingResult,
    formats: OutputFormat[]
  ): Promise<GeneratedFile[]> {
    const generatedFiles: GeneratedFile[] = [];

    for (const format of formats) {
      const file = this.generateFile(format, result);
      if (file) {
        generatedFiles.push(file);
      }
    }

    return generatedFiles;
  }

  private generateFile(
    format: OutputFormat,
    result: ProcessingResult
  ): GeneratedFile | null {
    switch (format) {
      case 'agents.md':
        return this.generateAgentsMd(result);
      case 'copilot-instructions.md':
        return this.generateCopilotInstructions(result);
      case 'json':
        return this.generateJson(result);
      default:
        return null;
    }
  }

  private generateAgentsMd(result: ProcessingResult): GeneratedFile {
    const { analysis, originalDocument } = result;
    const { title } = originalDocument.metadata;
    let content = `# AGENTS.md for ${title}\n\n`;

    content += `## Top-Level Summary\n\nThis document provides a comprehensive overview of ${title}, detailing its core components, functionalities, and intended use cases. It covers key concepts such as ${analysis.concepts.slice(0, 3).map(c => c.name).join(', ')}.\n\n`;

    content += `## Key Concepts & Entities\n\n`;
    analysis.entities.slice(0, 5).forEach(entity => {
      content += `* **${entity.name} (${entity.type}):** ${entity.description}\n`;
    });

    content += `\n## Learning Path\n\n`;
    analysis.learningPath.forEach((step, index) => {
        content += `${index + 1}. **${step.title}**: ${step.description}\n`
    });

    const tokenCount = await this.countTokens(content);
    return {
      filename: 'AGENTS.md',
      content,
      format: 'agents.md',
      size: content.length,
      metadata: {
        generatedAt: new Date(),
        targetModel: 'gemini-2.5-pro',
        qualityScore: 0.8,
        tokenCount,
      },
    };
  }

  private generateCopilotInstructions(result: ProcessingResult): GeneratedFile {
    const { analysis, originalDocument } = result;
    const { title } = originalDocument.metadata;
    let content = `# Copilot Instructions for ${title}\n\n`;

    content += `## Core Purpose\n\nThe primary goal of this codebase is to implement a ${title}. It focuses on ${analysis.concepts.slice(0, 2).map(c => c.name).join(' and ')}.\n\n`;

    content += `## Key Files & Components\n\n`;
    analysis.entities.filter(e => e.type === 'class' || e.type === 'function').slice(0, 4).forEach(entity => {
        content += `* \`${entity.name}\`: A key ${entity.type} that is responsible for ${entity.description}.\n`
    })

    const tokenCount = await this.countTokens(content);
    return {
      filename: 'copilot-instructions.md',
      content,
      format: 'copilot-instructions.md',
      size: content.length,
      metadata: {
        generatedAt: new Date(),
        targetModel: 'gemini-2.5-pro',
        qualityScore: 0.75,
        tokenCount,
      },
    };
  }

  private generateJson(result: ProcessingResult): GeneratedFile {
    const content = JSON.stringify(result, null, 2);
    const tokenCount = await this.countTokens(content);
    return {
      filename: 'documind-result.json',
      content,
      format: 'json',
      size: content.length,
      metadata: {
        generatedAt: new Date(),
        targetModel: 'gemini-2.5-pro',
        qualityScore: 0.9,
        tokenCount,
      },
    };
  }

  private async countTokens(text: string): Promise<number> {
    const model = this.gemini.getGenerativeModel({ model: "gemini-pro" });
    const { totalTokens } = await model.countTokens(text);
    return totalTokens;
  }
}
