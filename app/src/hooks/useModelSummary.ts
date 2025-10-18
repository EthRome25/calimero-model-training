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

// Mock data for model summary
// @ts-ignore
const mockModelSummary: Model = {
  id: 'model-123',
  name: 'Medical Image Classifier v1',
  version: '1.0.0',
  status: 'completed',
  accuracy: 72.5,
  precision: 92.3,
  recall: 0.912,
  f1Score: 0.917,
  trainingProgress: 100,
  epochsCompleted: 50,
  totalEpochs: 50,
  loss: 0.0234,
  validationLoss: 0.0456,
  trainingTime: '2h 34m',
  lastUpdated: '2025-10-18T14:30:00Z',
  datasetSize: 10000,
  modelSize: '234MB',
  architecture: 'ResNet-50',
  optimizer: 'Adam',
  learningRate: 0.001,
  batchSize: 32,
};

export function useModelSummary(api: AbiClient | null) {
  return useQuery({
    queryKey: ['modelSummary'],
    queryFn: async (): Promise<Model> => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (!api) throw new Error('API not available');

      // return api.getCurrentModel();
      return mockModelSummary;
    },
    enabled: !!api,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
