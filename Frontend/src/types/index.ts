export enum UploadStatus {
  Idle = 'idle',
  Uploading = 'uploading',
  Processing = 'processing',
  Error = 'error',
}

export interface TableSchema {
  headers: string[];
  rows: string[][];
}

export interface SectionSchema {
  level: number;
  title: string;
  content: string;
  subsections?: SectionSchema[];
}

export interface DocumentSchema {
  title: string;
  metadata: Record<string, unknown>;
  sections: SectionSchema[];
  tables: TableSchema[];
}

export interface ConversionResult {
  format: 'json' | 'markdown';
  token_count_before: number;
  token_count_after: number;
  savings_percent: number;
  content: DocumentSchema;
}

export interface ConversionOptions {
  output_format: 'json' | 'markdown';
  llm_enhance: boolean;
}

export interface HistoryEntry {
  id: string;
  filename: string;
  timestamp: string;
  format: 'json' | 'markdown';
  llm_enhance: boolean;
  token_count_before: number;
  token_count_after: number;
  savings_percent: number;
  result: ConversionResult;
}
