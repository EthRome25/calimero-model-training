import { useMutation } from '@tanstack/react-query';
import { cnnApiClient, CnnPredictionResponse, CnnRetrainResponse } from '../api/CnnApiClient';

export interface UseCnnPredictionOptions {
  onSuccess?: (data: CnnPredictionResponse) => void;
  onError?: (error: Error) => void;
}

export interface UseCnnRetrainOptions {
  onSuccess?: (data: CnnRetrainResponse) => void;
  onError?: (error: Error) => void;
}

export function useCnnPrediction(options?: UseCnnPredictionOptions) {
  return useMutation({
    mutationFn: async (file: File): Promise<CnnPredictionResponse> => {
      return await cnnApiClient.predict(file);
    },
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
}

export function useCnnRetrain(options?: UseCnnRetrainOptions) {
  return useMutation({
    mutationFn: async (file: File): Promise<CnnRetrainResponse> => {
      // Use the retrainWithFile method that accepts a ZIP file
      return await cnnApiClient.retrainWithFile(file);
    },
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
}

export function useCnnHealthCheck() {
  return useMutation({
    mutationFn: async () => {
      return await cnnApiClient.checkHealth();
    },
  });
}
