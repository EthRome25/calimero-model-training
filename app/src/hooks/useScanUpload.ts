import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AbiClient } from '../api/AbiClient';
import { ScanUploadFormData } from '../schemas/scanUpload';
import {
  isRateLimitError,
  createRateLimitError,
  getRetryDelay,
} from '../utils/errorHandling';

export const useScanUpload = (api: AbiClient | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: ScanUploadFormData) => {
      if (!api) throw new Error('API not available');

      try {
        // Convert file to base64
        const fileData = await fileToBase64(formData.file);

        const uploadData = {
          patient_id: formData.patientId,
          scan_type: formData.scanType,
          body_part: formData.bodyPart,
          file_data: fileData,
          uploader: formData.uploader,
        };

        console.log('=== SCAN UPLOAD API CALL ===');
        console.log('Upload parameters:', {
          patient_id: uploadData.patient_id,
          scan_type: uploadData.scan_type,
          body_part: uploadData.body_part,
          file_data_length: uploadData.file_data?.length || 0,
          uploader: uploadData.uploader,
        });

        const result = await api.uploadScan(uploadData);
        console.log('Scan upload result:', result);

        return result;
      } catch (error) {
        if (isRateLimitError(error)) {
          throw createRateLimitError(
            'Rate limit exceeded while uploading scan',
          );
        }
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate scans query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['scans'] });
    },
    retry: (failureCount, error) => {
      if (isRateLimitError(error)) {
        return false; // Don't retry rate limit errors
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => getRetryDelay(attemptIndex, 3000), // Longer delay for uploads
  });
};

// Helper function to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/png;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};
