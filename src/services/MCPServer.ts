import { MCP, MCPServer, Tool, Resource } from '@modelcontextprotocol/sdk';
import { DocuMindConfig, ProcessingResult } from '../types';

export class DocuMindMCPServer {
  private mcpServer: MCPServer;

  constructor(config: DocuMindConfig) {
    this.mcpServer = new MCPServer({
      port: config.mcpPort || 8080,
      logLevel: 'info',
    });
  }

  start(processingResult: ProcessingResult) {
    this.registerTools(processingResult);
    this.registerResources(processingResult);
    this.mcpServer.start();
    console.log(`MCP Server started on port ${this.mcpServer.options.port}`);
  }

  stop() {
    this.mcpServer.stop();
    console.log('MCP Server stopped');
  }

  private registerTools(result: ProcessingResult) {
    const tools: Tool[] = [
      {
        name: 'getDocumentTitle',
        description: 'Get the title of the processed document',
        run: async () => result.originalDocument.metadata.title,
      },
      {
        name: 'getEntities',
        description: 'Get a list of extracted entities',
        run: async () => result.analysis.entities,
      },
    ];

    tools.forEach(tool => this.mcpServer.registerTool(tool));
  }

  private registerResources(result: ProcessingResult) {
    const resources: Resource[] = [
      {
        uri: `documind://document/${result.id}`,
        content: result.originalDocument.content,
        description: 'The full content of the processed document',
        mimeType: 'text/plain',
      },
    ];

    resources.forEach(resource => this.mcpServer.registerResource(resource));
  }
}
