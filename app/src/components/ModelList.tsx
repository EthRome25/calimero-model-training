import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@calimero-network/mero-ui';
import { ModelFile } from '../api/AbiClient';

interface ModelListProps {
  models: ModelFile[];
  onDownload: (modelId: string) => void;
  onDelete: (modelId: string) => void;
  isDownloading: boolean;
  downloadingModelId: string | null;
}

export default function ModelList({ 
  models, 
  onDownload, 
  onDelete, 
  isDownloading, 
  downloadingModelId 
}: ModelListProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const getModelTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'tumor_classifier': 'bg-red-100 text-red-800',
      'segmentation': 'bg-blue-100 text-blue-800',
      'detection': 'bg-green-100 text-green-800',
      'regression': 'bg-purple-100 text-purple-800',
      'classification': 'bg-yellow-100 text-yellow-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  if (models.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-500">No models available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {models.map((model) => (
        <Card key={model.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">{model.name}</CardTitle>
              <Badge className={getModelTypeColor(model.model_type)}>
                {model.model_type}
              </Badge>
            </div>
            <p className="text-sm text-gray-600">v{model.version}</p>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 mb-3">{model.description}</p>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Size:</span>
                <span>{formatFileSize(model.file_size)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Uploader:</span>
                <span>{model.uploader}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Created:</span>
                <span>{formatDate(model.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status:</span>
                <Badge variant={model.is_public ? 'default' : 'secondary'}>
                  {model.is_public ? 'Public' : 'Private'}
                </Badge>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button
                onClick={() => onDownload(model.id)}
                disabled={isDownloading && downloadingModelId === model.id}
                size="sm"
                className="flex-1"
              >
                {isDownloading && downloadingModelId === model.id ? 'Downloading...' : 'Download'}
              </Button>
              <Button
                onClick={() => onDelete(model.id)}
                variant="destructive"
                size="sm"
              >
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
