// Core types for DocuMind
export interface DocumentSource {
  type: 'url' | 'file' | 'text' | 'github';
  url?: string;
  buffer?: Buffer;
  filename?: string;
  text?: string;
  githubRepo?: string;
}

export interface ProcessingOptions {
  source: DocumentSource;
  targetModel: 'gemini-2.5-pro' | 'gemini-2.5-flash' | 'gpt-4' | 'claude-3.5' | 'custom';
  outputFormats: OutputFormat[];
  chunkingStrategy?: 'semantic' | 'fixed' | 'hierarchical';
  contextWindow?: number;
  compressionLevel?: 'none' | 'light' | 'moderate' | 'aggressive';
  customInstructions?: string;
}

export type OutputFormat = 'agents.md' | 'copilot-instructions.md' | 'custom-context' | 'json' | 'xml';

export interface DocumentMetadata {
  id: string;
  title: string;
  author?: string;
  createdAt: Date;
  modifiedAt: Date;
  size: number;
  type: string;
  language?: string;
  tags: string[];
}

export interface ParsedDocument {
  id: string;
  content: string;
  structure: DocumentStructure;
  metadata: DocumentMetadata;
  visuals?: VisualElement[];
  timestamp: number;
}

export interface DocumentStructure {
  headings: Heading[];
  sections: Section[];
  tables: Table[];
  codeBlocks: CodeBlock[];
  links: Link[];
}

export interface Heading {
  level: number;
  text: string;
  id: string;
  position: number;
}

export interface Section {
  id: string;
  title: string;
  content: string;
  level: number;
  parent?: string;
  children: string[];
}

export interface Table {
  id: string;
  headers: string[];
  rows: string[][];
  caption?: string;
}

export interface CodeBlock {
  id: string;
  language: string;
  code: string;
  filename?: string;
  description?: string;
}

export interface Link {
  text: string;
  url: string;
  type: 'internal' | 'external';
}

export interface VisualElement {
  id: string;
  type: 'image' | 'diagram' | 'chart' | 'flowchart';
  description: string;
  extractedText?: string;
  position: number;
}

export interface SemanticAnalysis {
  entities: Entity[];
  relationships: Relationship[];
  concepts: Concept[];
  dependencies: Dependency[];
  learningPath: LearningStep[];
}

export interface Entity {
  id: string;
  name: string;
  type: 'class' | 'function' | 'api' | 'concept' | 'tool' | 'framework';
  description: string;
  importance: number; // 0-1 score
  mentions: number;
  context: string[];
}

export interface Relationship {
  source: string; // Entity ID
  target: string; // Entity ID
  type: 'uses' | 'extends' | 'implements' | 'requires' | 'contains' | 'similar';
  strength: number; // 0-1 score
  description: string;
}

export interface Concept {
  id: string;
  name: string;
  definition: string;
  examples: string[];
  relatedConcepts: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface Dependency {
  id: string;
  name: string;
  type: 'prerequisite' | 'optional' | 'alternative';
  description: string;
  satisfied: boolean;
}

export interface LearningStep {
  id: string;
  title: string;
  description: string;
  prerequisites: string[];
  concepts: string[];
  estimatedTime: number; // minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface KnowledgeGraph {
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
  clusters: Cluster[];
  centralNodes: string[]; // Most important node IDs
}

export interface KnowledgeNode {
  id: string;
  label: string;
  type: string;
  importance: number;
  properties: Record<string, any>;
}

export interface KnowledgeEdge {
  source: string;
  target: string;
  type: string;
  weight: number;
  properties: Record<string, any>;
}

export interface Cluster {
  id: string;
  name: string;
  nodes: string[];
  description: string;
}

export interface OptimizedContext {
  chunks: ContextChunk[];
  totalTokens: number;
  compressionRatio: number;
  modelOptimizations: ModelOptimization[];
  qualityScore: number;
}

export interface ContextChunk {
  id: string;
  content: string;
  type: 'header' | 'content' | 'example' | 'reference';
  tokens: number;
  importance: number;
  prerequisites: string[];
  relatedChunks: string[];
  metadata: Record<string, any>;
}

export interface ModelOptimization {
  targetModel: string;
  adaptations: string[];
  tokenBudget: number;
  formatPreferences: string[];
}

export interface GeneratedFile {
  filename: string;
  content: string;
  format: OutputFormat;
  size: number;
  metadata: {
    generatedAt: Date;
    targetModel: string;
    qualityScore: number;
    tokenCount: number;
  };
}

export interface ProcessingResult {
  id: string;
  status: 'processing' | 'completed' | 'error';
  originalDocument: ParsedDocument;
  analysis: SemanticAnalysis;
  knowledgeGraph: KnowledgeGraph;
  optimizedContext: OptimizedContext;
  generatedFiles: GeneratedFile[];
  metrics: ProcessingMetrics;
  error?: string;
}

export interface ProcessingMetrics {
  processingTime: number; // milliseconds
  tokenCount: number;
  compressionRatio: number;
  qualityScore?: number;
  performanceScore?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  documentContext?: string;
  metadata?: Record<string, any>;
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  documentId?: string;
  createdAt: Date;
  lastActivity: Date;
}

// MCP Types
export interface MCPTool {
  name: string;
  description: string;
  parameters: MCPParameter[];
}

export interface MCPParameter {
  name: string;
  type: string;
  description: string;
  required: boolean;
  default?: any;
}

export interface MCPResource {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
}

// Configuration Types
export interface DocuMindConfig {
  geminiApiKey: string;
  enableMCP?: boolean;
  mcpPort?: number;
  database?: {
    mongodb?: string;
    redis?: string;
  };
  processing?: {
    maxFileSize?: number;
    concurrentJobs?: number;
    timeout?: number;
  };
  security?: {
    rateLimit?: number;
    allowedOrigins?: string[];
  };
}

// API Response Types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    timestamp: Date;
    requestId: string;
    processingTime?: number;
  };
}

export interface UploadResponse {
  documentId: string;
  filename: string;
  size: number;
  status: 'uploaded' | 'processing';
}

export interface StatusResponse {
  documentId: string;
  status: 'queued' | 'processing' | 'completed' | 'error';
  progress: number; // 0-100
  currentPhase: string;
  estimatedCompletion?: Date;
}