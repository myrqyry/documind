import { Express, Request, Response } from 'express';
import { DocuMind } from '../DocuMind.js';
import { Multer } from 'multer';
import { z } from 'zod';
import { createSuccessResponse, createErrorResponse } from '../utils/response.js';

const urlSchema = z.object({
  url: z.string().url().refine((url) => {
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol) &&
             !['localhost', '127.0.0.1', '0.0.0.0'].includes(parsed.hostname);
    } catch (error) {
      return false;
    }
  }, "Invalid or unsafe URL")
});

export function setupRoutes(app: Express, documind: DocuMind, upload: Multer) {
  app.post('/process', upload.single('file'), async (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json(createErrorResponse('NO_FILE_UPLOADED', 'No file uploaded'));
    }

    try {
      const result = await documind.processFile(req.file.buffer, req.file.originalname);
      res.json(createSuccessResponse(result));
    } catch (error) {
      res.status(500).json(createErrorResponse('FILE_PROCESSING_ERROR', 'Error processing file', error));
    }
  });

  app.post('/process-url', async (req: Request, res: Response) => {
    try {
      const { url } = urlSchema.parse(req.body);
      const result = await documind.processURL(url);
      res.json(createSuccessResponse(result));
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(createErrorResponse('INVALID_URL', 'Invalid URL format', error.errors));
      }
      res.status(500).json(createErrorResponse('URL_PROCESSING_ERROR', 'Error processing URL', error));
    }
  });
}
