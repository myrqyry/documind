export class DocumentProcessingError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'DocumentProcessingError';
  }
}
