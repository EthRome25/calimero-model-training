import React, { useState } from 'react';
import { AbiClient } from '../../api/AbiClient';
import ModelList from '../../components/ModelList';
import Layout from '../../components/Layout';
import { useModels, useDownloadModel, useDeleteModel } from '../../hooks/useModels';
import { isRateLimitError, getRateLimitMessage } from '../../utils/errorHandling';

interface ModelsPageProps {
  api: AbiClient;
}

export default function ModelsPage({ api }: ModelsPageProps) {
  const [downloadingModelId, setDownloadingModelId] = useState<string | null>(null);

  // React Query hooks
  const { data: models = [], isLoading, error, refetch } = useModels(api);
  const downloadModelMutation = useDownloadModel(api);
  const deleteModelMutation = useDeleteModel(api);

  // Helper function to convert base64 string to binary blob
  const base64ToBlob = (
    base64String: string,
    mimeType: string = 'application/octet-stream',
  ): Blob => {
    const binaryString = atob(base64String);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return new Blob([bytes], { type: mimeType });
  };

  const handleModelDownload = async (modelId: string) => {
    setDownloadingModelId(modelId);
    try {
      console.log('=== MODEL DOWNLOAD DEBUG ===');
      console.log('Downloading model ID:', modelId);

      const model = await downloadModelMutation.mutateAsync({
        modelId,
        downloader: 'current_user',
      });

      console.log('Downloaded model data:', {
        id: model.id,
        name: model.name,
        file_size: model.file_size,
        file_data_type: typeof model.file_data,
        file_data_length: model.file_data?.length || 0,
        file_data_preview: model.file_data?.substring(0, 100) + '...',
        file_data_end:
          '...' + model.file_data?.substring(model.file_data.length - 100),
      });

      // Convert base64 string back to binary data and create download link
      const blob = base64ToBlob(model.file_data);
      console.log('Created blob:', {
        size: blob.size,
        type: blob.type,
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${model.name}_v${model.version}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      console.log('Model download completed');
    } catch (error) {
      console.error('Error downloading model:', error);
      alert('Error downloading model');
    } finally {
      setDownloadingModelId(null);
    }
  };

  const handleModelDelete = async (modelId: string) => {
    if (confirm('Are you sure you want to delete this model?')) {
      try {
        await deleteModelMutation.mutateAsync({ modelId });
      } catch (error) {
        console.error('Error deleting model:', error);
        alert('Error deleting model');
      }
    }
  };

  return (
    <Layout api={api}>
      <div className="calimero-container">
        <div className="professional-header">
          <div className="professional-header__content">
            <div>
              <h1 className="professional-header__title">Machine Learning Models</h1>
              <p className="professional-header__subtitle">
                Advanced AI models for medical imaging analysis, secure peer-to-peer sharing with full privacy protection
              </p>
            </div>
            <div className="professional-header__actions">
              <button 
                className="button button-secondary"
                onClick={() => refetch()}
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Refresh Models'}
              </button>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="empty-state">
            <div className="empty-state__icon">
              {isRateLimitError(error) ? '⏱️' : '⚠️'}
            </div>
            <h3 className="empty-state__title">
              {isRateLimitError(error) ? 'Rate Limit Exceeded' : 'Error Loading Models'}
            </h3>
            <p className="empty-state__description">
              {isRateLimitError(error) 
                ? getRateLimitMessage(error)
                : (error instanceof Error ? error.message : 'Failed to load models')
              }
            </p>
            <button 
              className="button button-primary"
              onClick={() => refetch()}
              disabled={isRateLimitError(error)}
            >
              {isRateLimitError(error) ? 'Please Wait...' : 'Try Again'}
            </button>
          </div>
        )}
        
        {isLoading && (
          <div className="empty-state">
            <div className="loading-spinner" style={{ margin: '0 auto' }}></div>
            <h3 className="empty-state__title">Loading Models...</h3>
            <p className="empty-state__description">
              Fetching the latest machine learning models from the network
            </p>
          </div>
        )}
        
        {!isLoading && !error && (
          <ModelList
            models={models}
            onDownload={handleModelDownload}
            onDelete={handleModelDelete}
            isDownloading={downloadModelMutation.isPending}
            downloadingModelId={downloadingModelId}
          />
        )}
      </div>
    </Layout>
  );
}
