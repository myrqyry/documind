import { DocumentSource, ParsedDocument } from '../types';
import { randomUUID } from 'crypto';

const MAX_BUFFER_SIZE = 100 * 1024 * 1024; // 100MB

export class DocumentParser {
  async parse(source: DocumentSource): Promise<ParsedDocument> {
    let content = '';
    let title = '';

    if (source.type === 'file' && source.buffer) {
      if (source.buffer.length > MAX_BUFFER_SIZE) {
        throw new Error(`File too large. Maximum size: ${MAX_BUFFER_SIZE / (1024 * 1024)}MB`);
      }

      try {
        content = source.buffer.toString('utf-8');
      } catch (error) {
        throw new Error('Invalid file encoding. Only UTF-8 files are supported.');
      }

      title = source.filename ? source.filename.replace(/[<>:"/\\|?*]/g, '_') : 'Untitled';
    } else if (source.type === 'text' && source.text) {
      content = source.text;
      title = 'Untitled';
    }

    const id = randomUUID();
    return {
      id,
      content,
      structure: { headings: [], sections: [], tables: [], codeBlocks: [], links: [] },
      metadata: {
        id,
        title,
        createdAt: new Date(),
        modifiedAt: new Date(),
        size: content.length,
        type: source.type,
        tags: [],
      },
      timestamp: Date.now(),
    };
  }
}
