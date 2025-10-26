import { Express, Request, Response } from 'express';
import { DocuMind } from '../DocuMind';
import { Multer } from 'multer';

export function setupRoutes(app: Express, documind: DocuMind, upload: Multer) {
  app.post('/process', upload.single('file'), async (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
      const result = await documind.processFile(req.file.buffer, req.file.originalname);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Error processing file' });
    }
  });

  app.post('/process-url', async (req: Request, res: Response) => {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'No URL provided' });
    }

    try {
      const result = await documind.processURL(url);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Error processing URL' });
    }
  });
}