import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AbiClient, ScanFile } from '../api/AbiClient';
import { isRateLimitError, createRateLimitError, getRetryDelay } from '../utils/errorHandling';

export const useScans = (api: AbiClient | null) => {
  return useQuery({
    queryKey: ['scans'],
    queryFn: async () => {
      if (!api) throw new Error('API not available');
      
      try {
        // Get all metadata and filter for scans
        const allMetadata = await api.getAllMetadata();
        const scanMetadata = allMetadata.filter((m) => m.file_type === 'scan');

        // Load each scan with rate limit handling
        const scanPromises = scanMetadata.map(async (metadata) => {
          try {
            const scan = await api.getScan({ scan_id: metadata.file_id });
            return scan;
          } catch (error) {
            if (isRateLimitError(error)) {
              console.warn(`Rate limit exceeded for scan ${metadata.file_id}, skipping`);
              return null;
            }
            console.error(`Error loading scan ${metadata.file_id}:`, error);
            return null;
          }
        });

        const scanResults = await Promise.all(scanPromises);
        const validScans = scanResults.filter((scan): scan is ScanFile => scan !== null);
        
        // Sort scans by created_at timestamp (latest first)
        return validScans.sort((a, b) => {
          const timestampA = typeof a.created_at === 'string' ? parseFloat(a.created_at) : a.created_at || 0;
          const timestampB = typeof b.created_at === 'string' ? parseFloat(b.created_at) : b.created_at || 0;
          return timestampB - timestampA; // Descending order (latest first)
        });
      } catch (error) {
        if (isRateLimitError(error)) {
          throw createRateLimitError('Rate limit exceeded while fetching scans');
        }
        throw error;
      }
    },
    enabled: !!api,
    staleTime: 2 * 60 * 1000, // 2 minutes for scans
    retry: (failureCount, error) => {
      if (isRateLimitError(error)) {
        return false; // Don't retry rate limit errors
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => getRetryDelay(attemptIndex),
  });
};

export const useDownloadScan = (api: AbiClient | null) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ scanId, downloader }: { scanId: string; downloader: string }) => {
      if (!api) throw new Error('API not available');
      try {
        return await api.downloadScan({ scan_id: scanId, downloader });
      } catch (error) {
        if (isRateLimitError(error)) {
          throw createRateLimitError('Rate limit exceeded while downloading scan');
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
    retryDelay: (attemptIndex) => getRetryDelay(attemptIndex, 2000), // Longer delay for downloads
  });
};

export const useDeleteScan = (api: AbiClient | null) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ scanId }: { scanId: string }) => {
      if (!api) throw new Error('API not available');
      try {
        return await api.deleteFile({ file_id: scanId, file_type: 'scan' });
      } catch (error) {
        if (isRateLimitError(error)) {
          throw createRateLimitError('Rate limit exceeded while deleting scan');
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
    retryDelay: (attemptIndex) => getRetryDelay(attemptIndex),
  });
};

export const useAddAnnotation = (api: AbiClient | null) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ scanId, label }: { scanId: string; label: string }) => {
      if (!api) throw new Error('API not available');
      try {
        return await api.addAnnotation({ scan_id: scanId, _label: label });
      } catch (error) {
        if (isRateLimitError(error)) {
          throw createRateLimitError('Rate limit exceeded while adding annotation');
        }
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate scans query to refresh the list with updated annotation count
      queryClient.invalidateQueries({ queryKey: ['scans'] });
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
