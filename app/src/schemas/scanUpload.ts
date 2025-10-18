import { z } from 'zod';

// File size limit: 40KB = 40 * 1024 bytes
const MAX_FILE_SIZE = 40 * 1024;

const scanItemSchema = z.object({
  file: z
    .instanceof(File, { message: 'Please select a file' })
    .refine((file) => file.size <= MAX_FILE_SIZE, {
      message: `File size must be less than ${MAX_FILE_SIZE / 1024}KB (${(MAX_FILE_SIZE / 1024).toFixed(1)}KB)`,
    })
    .refine((file) => {
      const allowedTypes = [
        'image/dicom',
        'image/jpeg',
        'image/png',
        'image/tiff',
        'application/dicom',
        'application/octet-stream', // For .dcm files
      ];
      return allowedTypes.includes(file.type) || 
             file.name.toLowerCase().endsWith('.dcm') ||
             file.name.toLowerCase().endsWith('.nii') ||
             file.name.toLowerCase().endsWith('.nii.gz');
    }, {
      message: 'Please select a valid medical image file (.dcm, .nii, .nii.gz, .jpg, .png, .tiff)',
    }),
  
  scanType: z
    .enum(['MRI', 'CT', 'PET', 'Ultrasound', 'X-Ray'], {
      errorMap: () => ({ message: 'Please select a valid scan type' }),
    }),
  
  bodyPart: z
    .enum(['brain', 'chest', 'abdomen', 'spine', 'pelvis', 'extremities'], {
      errorMap: () => ({ message: 'Please select a valid body part' }),
    }),
});

export const scanUploadSchema = z.object({
  scans: z
    .array(scanItemSchema)
    .min(1, { message: 'Please add at least one scan' }),
});

export type ScanUploadFormData = z.infer<typeof scanUploadSchema>;

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
