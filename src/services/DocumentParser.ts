import { DocumentSource, ParsedDocument } from '../types';
import { randomUUID } from 'crypto';

export class DocumentParser {
  async parse(source: DocumentSource): Promise<ParsedDocument> {
    let content = '';
    let title = '';

    if (source.type === 'file' && source.buffer) {
      content = source.buffer.toString('utf-8');
      title = source.filename || 'Untitled';
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