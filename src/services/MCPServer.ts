import { DocuMind } from '../DocuMind.js';

export class MCPServer {
  constructor(private documind: DocuMind, private port: number) {}

  async start(): Promise<void> {
    // TODO: Implement MCP server
    console.log(`MCP Server starting on port ${this.port}`);
  }
}