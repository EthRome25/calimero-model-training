import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AbiClient, ModelFile } from '../api/AbiClient';
import {
  isRateLimitError,
  createRateLimitError,
  getRetryDelay,
} from '../utils/errorHandling';

export const useModels = (api: AbiClient | null) => {
  return useQuery({
    queryKey: ['models'],
    queryFn: async () => {
      if (!api) throw new Error('API not available');
      return [];
    },
    enabled: !!api,
    staleTime: 2 * 60 * 1000, // 2 minutes for models
    retry: (failureCount, error) => {
      if (isRateLimitError(error)) {
        return false; // Don't retry rate limit errors
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => getRetryDelay(attemptIndex),
  });
};

export const useDownloadModel = (api: AbiClient | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      modelId,
      downloader,
    }: {
      modelId: string;
      downloader: string;
    }) => {
      if (!api) throw new Error('API not available');
      try {
        return await api.downloadModel({ model_id: modelId, downloader });
      } catch (error) {
        if (isRateLimitError(error)) {
          throw createRateLimitError(
            'Rate limit exceeded while downloading model',
          );
        }
        throw error;
      }
    },
    onSuccess: (data) => {
      // Invalidate models query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['models'] });
    },
    retry: (failureCount, error) => {
      if (isRateLimitError(error)) {
        return false; // Don't retry rate limit errors
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => getRetryDelay(attemptIndex, 2000), // Longer delay for downloads
  });
};

export const useDeleteModel = (api: AbiClient | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ modelId }: { modelId: string }) => {
      if (!api) throw new Error('API not available');
      try {
        return await api.deleteFile({ file_id: modelId, file_type: 'model' });
      } catch (error) {
        if (isRateLimitError(error)) {
          throw createRateLimitError(
            'Rate limit exceeded while deleting model',
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
    retryDelay: (attemptIndex) => getRetryDelay(attemptIndex),
  });
};
