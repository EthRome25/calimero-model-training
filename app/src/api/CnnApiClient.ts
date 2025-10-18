import axios, { AxiosResponse } from 'axios';
import { CNN_API_URL, CNN_ENDPOINTS } from '../constants/api';

export interface CnnPredictionResponse {
  predicted_label: string;
  probabilities: {
    [key: string]: number;
  };
  plot_base64_png: string;
}

export interface CnnRetrainResponse {
  message: string;
  details: {
    classes: string[];
    final_epoch: number;
    history: {
      accuracy: number[];
      loss: number[];
      precision: number[];
      recall: number[];
      val_accuracy: number[];
      val_loss: number[];
      val_precision: number[];
      val_recall: number[];
    };
    output_model_path: string;
    test_score: {
      compile_metrics: number;
      loss: number;
    };
    train_score: {
      compile_metrics: number;
      loss: number;
    };
    used_params: {
      base_model_name: string;
      batch_size: number;
      data_dir: string;
      epochs: number;
      img_size: [number, number];
      learning_rate: number;
      output_model_path: string;
      per_class_limit: number | null;
      test_subdir: string;
      train_subdir: string;
      validation_split_from_test: number;
    };
    valid_score: {
      compile_metrics: number;
      loss: number;
    };
  };
}

export interface CnnHealthResponse {
  status: string;
  message: string;
}

export class CnnApiClient {
  private baseURL: string;

  constructor(baseURL: string = CNN_API_URL) {
    this.baseURL = baseURL;
  }

  /**
   * Check if the CNN API is healthy and available
   */
  async checkHealth(): Promise<CnnHealthResponse> {
    try {
      const response: AxiosResponse<CnnHealthResponse> = await axios.get(
        `${this.baseURL}${CNN_ENDPOINTS.HEALTH}`
      );
      return response.data;
    } catch (error) {
      throw new Error(`CNN API health check failed: ${error}`);
    }
  }

  /**
   * Predict brain tumor type from uploaded medical image
   */
  async predict(file: File): Promise<CnnPredictionResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response: AxiosResponse<CnnPredictionResponse> = await axios.post(
        `${this.baseURL}${CNN_ENDPOINTS.PREDICT}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 30000, // 30 second timeout for prediction
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          throw new Error('Invalid image file. Please ensure the file is a valid medical image (JPEG/PNG).');
        } else if (error.response?.status === 500) {
          throw new Error('Model prediction failed. Please try again or contact support.');
        } else if (error.code === 'ECONNABORTED') {
          throw new Error('Prediction request timed out. Please try again.');
        } else if (error.code === 'ECONNREFUSED') {
          throw new Error('CNN API is not available. Please check if the service is running.');
        }
      }
      throw new Error(`Prediction failed: ${error}`);
    }
  }

  /**
   * Retrain the CNN model with new parameters
   */
  async retrain(params?: {
    data_dir?: string;
    train_subdir?: string;
    test_subdir?: string;
    img_size?: [number, number];
    batch_size?: number;
    epochs?: number;
    learning_rate?: number;
    base_model_name?: 'MobileNetV2' | 'EfficientNetB0';
    output_model_path?: string;
    per_class_limit?: number | null;
    validation_split_from_test?: number;
  }): Promise<CnnRetrainResponse> {
    try {
      const response: AxiosResponse<CnnRetrainResponse> = await axios.post(
        `${this.baseURL}${CNN_ENDPOINTS.RETRAIN}`,
        params || {},
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 600000, // 10 minute timeout for training
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          throw new Error('Training request timed out. Training may still be in progress.');
        } else if (error.code === 'ECONNREFUSED') {
          throw new Error('CNN API is not available. Please check if the service is running.');
        }
      }
      throw new Error(`Model retraining failed: ${error}`);
    }
  }
}

// Export a default instance
export const cnnApiClient = new CnnApiClient();
