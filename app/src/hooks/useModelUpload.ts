import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AbiClient } from '../api/AbiClient';
import { ModelUploadFormData } from '../schemas/modelUpload';
import {
  isRateLimitError,
  createRateLimitError,
  getRetryDelay,
} from '../utils/errorHandling';

export const useModelUpload = (api: AbiClient | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: ModelUploadFormData) => {
      if (!api) throw new Error('API not available');

      try {
        // Convert file to base64
        const fileData = await fileToBase64(formData.file);

        const uploadData = {
          name: formData.name,
          description: formData.description,
          model_type: formData.modelType,
          version: formData.version,
          file_data: fileData,
          uploader: formData.uploader,
          is_public: formData.isPublic,
        };

        console.log('=== MODEL UPLOAD API CALL ===');
        console.log('Upload parameters:', {
          name: uploadData.name,
          description: uploadData.description,
          model_type: uploadData.model_type,
          version: uploadData.version,
          file_data_length: uploadData.file_data?.length || 0,
          uploader: uploadData.uploader,
          is_public: uploadData.is_public,
        });

        const result = await api.uploadModel(uploadData);
        console.log('Model upload result:', result);

        return result;
      } catch (error) {
        if (isRateLimitError(error)) {
          throw createRateLimitError(
            'Rate limit exceeded while uploading model',
          );
        }
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate models query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['models'] });
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
