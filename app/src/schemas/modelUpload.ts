import { z } from 'zod';

// File size limit: 40KB = 40 * 1024 bytes
const MAX_FILE_SIZE = 40 * 1024;

export const modelUploadSchema = z.object({
  file: z
    .instanceof(File, { message: 'Please select a file' })
    .refine((file) => file.size <= MAX_FILE_SIZE, {
      message: `File size must be less than ${MAX_FILE_SIZE / 1024}KB (${(MAX_FILE_SIZE / 1024).toFixed(1)}KB)`,
    })
    .refine((file) => {
      const allowedTypes = [
        'application/octet-stream',
        'application/x-python-code',
        'application/json',
        'text/plain',
      ];
      return allowedTypes.includes(file.type) || 
             file.name.toLowerCase().endsWith('.pkl') ||
             file.name.toLowerCase().endsWith('.joblib') ||
             file.name.toLowerCase().endsWith('.h5') ||
             file.name.toLowerCase().endsWith('.pb') ||
             file.name.toLowerCase().endsWith('.onnx') ||
             file.name.toLowerCase().endsWith('.pt') ||
             file.name.toLowerCase().endsWith('.pth');
    }, {
      message: 'Please select a valid ML model file (.pkl, .joblib, .h5, .pb, .onnx, .pt, .pth)',
    }),
  
  name: z
    .string()
    .min(1, 'Name is required')
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Name can only contain letters, numbers, spaces, hyphens, and underscores'),
  
  description: z
    .string()
    .min(1, 'Description is required')
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must be less than 500 characters'),
  
  modelType: z
    .enum(['tumor_classifier', 'segmentation', 'detection', 'regression', 'classification'], {
      errorMap: () => ({ message: 'Please select a valid model type' }),
    }),
  
  version: z
    .string()
    .min(1, 'Version is required')
    .min(1, 'Version must be at least 1 character')
    .max(20, 'Version must be less than 20 characters')
    .regex(/^[a-zA-Z0-9\.\-_]+$/, 'Version can only contain letters, numbers, dots, hyphens, and underscores'),
  
  isPublic: z
    .boolean()
    .default(true),
  
  uploader: z
    .string()
    .min(1, 'Uploader name is required')
    .min(2, 'Uploader name must be at least 2 characters')
    .max(50, 'Uploader name must be less than 50 characters')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Uploader name can only contain letters, numbers, spaces, hyphens, and underscores'),
});

export type ModelUploadFormData = z.infer<typeof modelUploadSchema>;

// Helper function to format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Helper function to get file size in KB
export const getFileSizeInKB = (bytes: number): number => {
  return Math.round(bytes / 1024);
};
