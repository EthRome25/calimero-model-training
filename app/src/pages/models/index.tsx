import React, { useState, useEffect } from 'react';
import { Button } from '@calimero-network/mero-ui';
import { AbiClient, ModelFile } from '../../api/AbiClient';
import ModelList from '../../components/ModelList';
import Layout from '../../components/Layout';

interface ModelsPageProps {
  api: AbiClient;
}

export default function ModelsPage({ api }: ModelsPageProps) {
  const [models, setModels] = useState<ModelFile[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadingModelId, setDownloadingModelId] = useState<string | null>(null);

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

  const loadModels = async () => {
    try {
      const publicModels = await api.getPublicModels();
      setModels(publicModels);
    } catch (error) {
      console.error('Error loading models:', error);
    }
  };

  useEffect(() => {
    loadModels();
  }, []);

  const handleModelDownload = async (modelId: string) => {
    setIsDownloading(true);
    setDownloadingModelId(modelId);
    try {
      console.log('=== MODEL DOWNLOAD DEBUG ===');
      console.log('Downloading model ID:', modelId);

      const model = await api.downloadModel({
        model_id: modelId,
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
      setIsDownloading(false);
      setDownloadingModelId(null);
    }
  };

  const handleModelDelete = async (modelId: string) => {
    if (confirm('Are you sure you want to delete this model?')) {
      try {
        await api.deleteFile({ file_id: modelId, file_type: 'model' });
        await loadModels();
      } catch (error) {
        console.error('Error deleting model:', error);
        alert('Error deleting model');
      }
    }
  };

  return (
    <Layout api={api}>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Available ML Models</h2>
          <Button onClick={loadModels} variant="secondary">
            Refresh
          </Button>
        </div>
        <ModelList
          models={models}
          onDownload={handleModelDownload}
          onDelete={handleModelDelete}
          isDownloading={isDownloading}
          downloadingModelId={downloadingModelId}
        />
      </div>
    </Layout>
  );
}
