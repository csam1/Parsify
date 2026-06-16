import axios from 'axios';
import type { ConversionResult, ConversionOptions } from '../types';

export async function convertPDF(
  file: File,
  options: ConversionOptions,
  onProgress?: (pct: number) => void
): Promise<ConversionResult> {
  const form = new FormData();
  form.append('file', file);
  form.append('output_format', options.output_format);
  form.append('llm_enhance', String(options.llm_enhance));

  const { data } = await axios.post<ConversionResult>('/convert', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    },
  });

  return data;
}
