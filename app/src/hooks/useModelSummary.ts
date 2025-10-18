import { useQuery } from '@tanstack/react-query';
import { AbiClient } from '../api/AbiClient';

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

// Mock data for model summary
const mockModelSummary: ModelSummary = {
  id: 'model_001',
  name: 'Medical Image Classification Model',
  version: 'v2.1.0',
  status: 'completed',
  accuracy: 94.7,
  precision: 93.2,
  recall: 95.1,
  f1Score: 94.1,
  trainingProgress: 100,
  epochsCompleted: 50,
  totalEpochs: 50,
  loss: 0.156,
  validationLoss: 0.189,
  trainingTime: '2h 34m',
  lastUpdated: '2024-01-15T14:30:00Z',
  datasetSize: 12500,
  modelSize: '45.2 MB',
  architecture: 'ResNet-50',
  optimizer: 'Adam',
  learningRate: 0.001,
  batchSize: 32,
};

export function useModelSummary(api: AbiClient | null) {
  return useQuery({
    queryKey: ['modelSummary'],
    queryFn: async (): Promise<ModelSummary> => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Return mock data for now
      // TODO: Replace with actual API call when backend is ready
      // return await api.getModelSummary();
      return mockModelSummary;
    },
    enabled: !!api,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
