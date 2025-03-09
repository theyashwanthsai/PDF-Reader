export interface AIResponse {
  content: string;
  isLoading: boolean;
  error: string | null;
}

export interface PDFDocument {
  file: File | null;
  url: string | null;
  name: string;
}