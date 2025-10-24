# DocuMind: Intelligent Document Scraper

## Quick Start Guide

### Prerequisites
- Node.js 20+ 
- npm or yarn package manager
- Gemini API key from Google AI Studio

### Installation

1. **Clone and Install Dependencies**
```bash
git clone <your-repo-url>
cd documind
npm install
```

2. **Environment Setup**
```bash
cp .env.example .env
# Edit .env with your API keys
```

3. **Start Development Server**
```bash
npm run dev
```

### Environment Variables
```
GEMINI_API_KEY=your_gemini_api_key_here
MONGODB_URI=mongodb://localhost:27017/documind
REDIS_URL=redis://localhost:6379
PORT=3000
NODE_ENV=development
```

### Basic Usage

```javascript
import { DocuMind } from './src/core/DocuMind.js';

const documind = new DocuMind({
  geminiApiKey: process.env.GEMINI_API_KEY
});

// Process a document
const result = await documind.processDocument({
  source: 'https://example.com/docs',
  targetModel: 'gemini-2.5-flash',
  outputFormat: 'agents.md'
});

console.log(result.generatedContext);
```

### API Endpoints

- `POST /api/documents/upload` - Upload document files
- `POST /api/documents/url` - Process URL/website  
- `GET /api/documents/:id/status` - Check processing status
- `GET /api/documents/:id/download` - Download processed results
- `POST /api/chat/message` - Interactive Gemini chat

### Features Overview

1. **Document Processing**: Multi-format support with intelligent parsing
2. **Semantic Analysis**: AI-powered content understanding
3. **Context Optimization**: RAG-enhanced chunking and formatting
4. **MCP Integration**: Universal AI agent compatibility
5. **Real-time Chat**: Interactive assistance and refinement

### Project Structure
```
documind/
├── src/
│   ├── core/           # Core processing logic
│   ├── services/       # External service integrations
│   ├── api/           # REST API routes
│   ├── utils/         # Utility functions
│   └── types/         # TypeScript definitions
├── public/            # Static frontend files
├── docs/             # Documentation
└── tests/            # Test suites
```

### Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

### License

MIT License - see LICENSE file for details

### Support

- Documentation: `./docs/`
- Issues: GitHub Issues
- Discussions: GitHub Discussions