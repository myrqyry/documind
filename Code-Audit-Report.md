## 📝 Code Audit Report

### 🐞 Bugs & Potential Errors

**1. Unimplemented Core Services**
* **Location:** `DocumentParser.ts`, `SemanticAnalyzer.ts`
* **Severity:** Critical
* **Description:** The `DocumentParser` and `SemanticAnalyzer` services, which are fundamental to the document processing pipeline, are currently stubs with no actual implementation.
* **Suggestion & Rationale:**
```typescript
// src/services/DocumentParser.ts
export class DocumentParser {
  async parse(source: DocumentSource): Promise<ParsedDocument> {
    // Implement parsing logic based on the source type (URL, file, etc.)
    // For example, for a file, you might use a library like 'mammoth' for .docx or 'pdf-parse' for .pdf
    // This is a placeholder for the actual implementation.
    const content = await this.extractContent(source);
    return {
      id: '1', // Generate a unique ID
      content,
      // ... populate other fields
    };
  }

  private async extractContent(source: DocumentSource): Promise<string> {
    // ... implementation details
  }
}

// src/services/SemanticAnalyzer.ts
export class SemanticAnalyzer {
  constructor(private gemini: GoogleGenAI) {}

  async analyze(document: ParsedDocument): Promise<SemanticAnalysis> {
    // Use the Gemini API to perform semantic analysis on the document's content
    const result = await this.gemini.getGenerativeModel({ model: "gemini-pro" }).generateContent(
      `Analyze the following document and extract key entities, relationships, and concepts: ${document.content}`
    );
    // ... parse the result and return a SemanticAnalysis object
  }

  async buildKnowledgeGraph(analysis: SemanticAnalysis): Promise<KnowledgeGraph> {
    // Build a knowledge graph from the semantic analysis
    // This could involve using a graph library like 'vis-network' or a custom implementation
  }
}
```
*Why this is better:* The application will not function without these core services. Implementing them is the first priority.

**2. Inaccurate Token Counting**
* **Location:** `ContextOptimizer.ts`, `FormatGenerator.ts`
* **Severity:** Medium
* **Description:** The `countTokens` method in `ContextOptimizer` and the token counting in `FormatGenerator` use a naive `text.length / 4` approximation. This is inaccurate and can lead to unexpected behavior when interacting with token-based models.
* **Suggestion & Rationale:**
```typescript
// src/services/ContextOptimizer.ts
import { GoogleGenerativeAI } from '@google/genai';

export class ContextOptimizer {
  constructor(private gemini: GoogleGenerativeAI) {} // Pass the gemini instance

  // ...

  private async countTokens(text: string): Promise<number> {
    const model = this.gemini.getGenerativeModel({ model: "gemini-pro" });
    const { totalTokens } = await model.countTokens(text);
    return totalTokens;
  }
}
```
*Why this is better:* Using the official `countTokens` method from the Gemini API provides an accurate token count, which is crucial for cost estimation, and for staying within model context limits.

**3. Hardcoded Numbering in `generateAgentsMd`**
* **Location:** `FormatGenerator.ts`, Line 106
* **Severity:** Low
* **Description:** The `generateAgentsMd` method hardcodes the number `1.` for each step in the learning path, resulting in an incorrectly formatted list.
* **Suggestion & Rationale:**
```typescript
// src/services/FormatGenerator.ts
    analysis.learningPath.forEach((step, index) => {
        content += `${index + 1}. **${step.title}**: ${step.description}\n`
    });
```
*Why this is better:* This change dynamically generates the correct number for each step in the learning path, improving the readability and correctness of the generated `AGENTS.md` file.

### ✨ Quick Wins & Refinements

**1. Unnecessary Constructors**
* **Location:** `ContextOptimizer.ts`, `FormatGenerator.ts`
* **Impact:** Low
* **Description:** Both `ContextOptimizer` and `FormatGenerator` have empty constructors that serve no purpose.
* **Suggestion & Rationale:**
```typescript
// src/services/ContextOptimizer.ts
export class ContextOptimizer {
  // No constructor needed
  // ...
}

// src/services/FormatGenerator.ts
export class FormatGenerator {
  // No constructor needed
  // ...
}
```
*Why this is better:* Removing unnecessary constructors makes the code cleaner and more concise.

**2. Hardcoded Model in `GeminiChat`**
* **Location:** `GeminiChat.ts`, Line 11
* **Impact:** Medium
* **Description:** The `GeminiChat` service hardcodes the `gemini-2.5-pro` model. This makes it difficult to switch to a different model without modifying the code.
* **Suggestion & Rationale:**
```typescript
// src/services/GeminiChat.ts
export class GeminiChat {
  private genAI: GoogleGenerativeAI;
  private model: string;

  constructor(config: DocuMindConfig) {
    this.genAI = new GoogleGenerativeAI(config.geminiApiKey);
    this.model = config.model || 'gemini-2.5-pro'; // Allow overriding the model
  }

  async sendMessage(history: ChatMessage[], newMessage: string): Promise<ChatMessage> {
    const model = this.genAI.getGenerativeModel({ model: this.model });
    // ...
  }
}
```
*Why this is better:* This change allows the model to be configured through the `DocuMindConfig`, making the chat service more flexible and easier to maintain.

**3. Unsafe ID Generation in `GeminiChat`**
* **Location:** `GeminiChat.ts`, Line 24
* **Impact:** Low
* **Description:** The `GeminiChat` service uses `Date.now()` to generate message IDs, which is not guaranteed to be unique, especially in high-concurrency scenarios.
* **Suggestion & Rationale:**
```typescript
// src/services/GeminiChat.ts
import { randomUUID } from 'crypto';

// ...

    return {
      id: `msg-${randomUUID()}`,
      // ...
    };
```
*Why this is better:* Using `randomUUID` from the `crypto` module ensures that each message has a unique ID, which is important for tracking and managing chat history.

**4. Hardcoded Port in `MCPServer`**
* **Location:** `MCPServer.ts`, Line 8
* **Impact:** Low
* **Description:** The `MCPServer` hardcodes the fallback port to `8080`, which could conflict with other services running on the same machine.
* **Suggestion & Rationale:**
```typescript
// src/services/MCPServer.ts
    this.mcpServer = new MCPServer({
      port: config.mcpPort || 0, // Use 0 to let the system assign an available port
      logLevel: 'info',
    });
```
*Why this is better:* Setting the port to `0` allows the operating system to assign a random, available port, which prevents potential port conflicts.
