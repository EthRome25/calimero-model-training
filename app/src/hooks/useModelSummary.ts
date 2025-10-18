import { useQuery } from '@tanstack/react-query';
import { AbiClient, Model } from '@/api/AbiClient';

export interface ModelSummary {
  id: string;
  name: string;
  version: string;
  status: 'training' | 'completed' | 'failed';
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  trainingProgress: number;
  epochsCompleted: number;
  totalEpochs: number;
  loss: number;
  validationLoss: number;
  trainingTime: string;
  lastUpdated: string;
  datasetSize: number;
  modelSize: string;
  architecture: string;
  optimizer: string;
  learningRate: number;
  batchSize: number;
}

// Mock data for model summary - removed as we now use real API data

export function useModelSummary(api: AbiClient | null) {
  return useQuery({
    queryKey: ['modelSummary'],
    queryFn: async (): Promise<ModelSummary> => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (!api) throw new Error('API not available');

      const model = await api.getCurrentModel();
      
      // Map API Model to ModelSummary
      return {
        id: model.id,
        name: model.name,
        version: model.version,
        status: 'completed' as const,
        accuracy: model.prediction_accuracy || 0,
        precision: 92.3, // Mock data - not available in API
        recall: 91.2, // Mock data - not available in API
        f1Score: 91.7, // Mock data - not available in API
        trainingProgress: 100, // Mock data - not available in API
        epochsCompleted: 50, // Mock data - not available in API
        totalEpochs: 50, // Mock data - not available in API
        loss: 0.0234, // Mock data - not available in API
        validationLoss: 0.0456, // Mock data - not available in API
        trainingTime: '2h 34m', // Mock data - not available in API
        lastUpdated: new Date(model.created_at / 1000000).toISOString(), // Convert from nanoseconds
        datasetSize: 10000, // Mock data - not available in API
        modelSize: `${Math.round(model.file_size / 1024 / 1024)}MB`, // Convert bytes to MB
        architecture: 'ResNet-50', // Mock data - not available in API
        optimizer: 'Adam', // Mock data - not available in API
        learningRate: 0.001, // Mock data - not available in API
        batchSize: 32, // Mock data - not available in API
      };
    },
    enabled: !!api,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for getting current model name for alert
export function useCurrentModelName(api: AbiClient | null) {
  return useQuery({
    queryKey: ['currentModelName'],
    queryFn: async (): Promise<string> => {
      if (!api) throw new Error('API not available');
      
      const model = await api.getCurrentModel();
      return model.name;
    },
    enabled: !!api,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
