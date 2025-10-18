import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@calimero-network/mero-ui';
import { AbiClient, ModelFile, ScanFile } from '../api/AbiClient';
import FileUpload from './FileUpload';
import ModelList from './ModelList';
import ScanList from './ScanList';

interface DashboardProps {
  api: AbiClient;
}

export default function Dashboard({ api }: DashboardProps) {
  const [activeTab, setActiveTab] = useState('models');
  const [models, setModels] = useState<ModelFile[]>([]);
  const [scans, setScans] = useState<ScanFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadingModelId, setDownloadingModelId] = useState<string | null>(null);
  const [downloadingScanId, setDownloadingScanId] = useState<string | null>(null);
  const [stats, setStats] = useState<string>('');

  const loadModels = async () => {
    try {
      const publicModels = await api.getPublicModels();
      setModels(publicModels);
    } catch (error) {
      console.error('Error loading models:', error);
    }
  };

  const loadScans = async () => {
    try {
      // For demo purposes, we'll load all scans
      // In a real app, you might want to filter by patient or user
      const allMetadata = await api.getAllMetadata();
      const scanMetadata = allMetadata.filter(m => m.file_type === 'scan');
      
      const scanPromises = scanMetadata.map(async (metadata) => {
        try {
          const scan = await api.getScan({ scan_id: metadata.file_id });
          return scan;
        } catch (error) {
          console.error(`Error loading scan ${metadata.file_id}:`, error);
          return null;
        }
      });
      
      const scanResults = await Promise.all(scanPromises);
      const validScans = scanResults.filter((scan): scan is ScanFile => scan !== null);
      setScans(validScans);
    } catch (error) {
      console.error('Error loading scans:', error);
    }
  };

  const loadStats = async () => {
    try {
      const statsResult = await api.getStats();
      setStats(statsResult);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  useEffect(() => {
    loadModels();
    loadScans();
    loadStats();
  }, []);

  const handleModelUpload = async (fileData: any) => {
    setIsUploading(true);
    try {
      await api.uploadModel({
        name: fileData.name,
        description: fileData.description,
        model_type: fileData.modelType,
        version: fileData.version,
        file_data: fileData.fileData,
        uploader: fileData.uploader,
        is_public: fileData.isPublic
      });
      await loadModels();
      await loadStats();
    } catch (error) {
      console.error('Error uploading model:', error);
      alert('Error uploading model');
    } finally {
      setIsUploading(false);
    }
  };

  const handleScanUpload = async (fileData: any) => {
    setIsUploading(true);
    try {
      await api.uploadScan({
        patient_id: fileData.patientId,
        scan_type: fileData.scanType,
        body_part: fileData.bodyPart,
        file_data: fileData.fileData,
        uploader: fileData.uploader
      });
      await loadScans();
      await loadStats();
    } catch (error) {
      console.error('Error uploading scan:', error);
      alert('Error uploading scan');
    } finally {
      setIsUploading(false);
    }
  };

  const handleModelDownload = async (modelId: string) => {
    setIsDownloading(true);
    setDownloadingModelId(modelId);
    try {
      const model = await api.downloadModel({ model_id: modelId, downloader: 'current_user' });
      
      // Create download link
      const blob = new Blob([model.file_data], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${model.name}_v${model.version}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      await loadStats();
    } catch (error) {
      console.error('Error downloading model:', error);
      alert('Error downloading model');
    } finally {
      setIsDownloading(false);
      setDownloadingModelId(null);
    }
  };

  const handleScanDownload = async (scanId: string) => {
    setIsDownloading(true);
    setDownloadingScanId(scanId);
    try {
      const scan = await api.downloadScan({ scan_id: scanId, downloader: 'current_user' });
      
      // Create download link
      const blob = new Blob([scan.file_data], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `scan_${scan.id}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      await loadStats();
    } catch (error) {
      console.error('Error downloading scan:', error);
      alert('Error downloading scan');
    } finally {
      setIsDownloading(false);
      setDownloadingScanId(null);
    }
  };

  const handleModelDelete = async (modelId: string) => {
    if (confirm('Are you sure you want to delete this model?')) {
      try {
        await api.deleteFile({ file_id: modelId, file_type: 'model' });
        await loadModels();
        await loadStats();
      } catch (error) {
        console.error('Error deleting model:', error);
        alert('Error deleting model');
      }
    }
  };

  const handleScanDelete = async (scanId: string) => {
    if (confirm('Are you sure you want to delete this scan?')) {
      try {
        await api.deleteFile({ file_id: scanId, file_type: 'scan' });
        await loadScans();
        await loadStats();
      } catch (error) {
        console.error('Error deleting scan:', error);
        alert('Error deleting scan');
      }
    }
  };

  const handleAddAnnotation = async (scanId: string, label: string) => {
    try {
      await api.addAnnotation({ scan_id: scanId, _label: label });
      await loadScans();
    } catch (error) {
      console.error('Error adding annotation:', error);
      alert('Error adding annotation');
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Medical AI File Transfer</h1>
        <Badge variant="outline" className="text-sm">
          {stats}
        </Badge>
      </div>

      <div className="w-full">
        {/* Navigation */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            onClick={() => setActiveTab('models')}
            variant={activeTab === 'models' ? 'primary' : 'secondary'}
          >
            ML Models
          </Button>
          <Button
            onClick={() => setActiveTab('scans')}
            variant={activeTab === 'scans' ? 'primary' : 'secondary'}
          >
            Medical Scans
          </Button>
          <Button
            onClick={() => setActiveTab('upload-model')}
            variant={activeTab === 'upload-model' ? 'primary' : 'secondary'}
          >
            Upload Model
          </Button>
          <Button
            onClick={() => setActiveTab('upload-scan')}
            variant={activeTab === 'upload-scan' ? 'primary' : 'secondary'}
          >
            Upload Scan
          </Button>
        </div>

        {/* Content */}
        {activeTab === 'models' && (
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
        )}

        {activeTab === 'scans' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Medical Scans</h2>
              <Button onClick={loadScans} variant="secondary">
                Refresh
              </Button>
            </div>
            <ScanList
              scans={scans}
              onDownload={handleScanDownload}
              onDelete={handleScanDelete}
              onAddAnnotation={handleAddAnnotation}
              isDownloading={isDownloading}
              downloadingScanId={downloadingScanId}
            />
          </div>
        )}

        {activeTab === 'upload-model' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Upload ML Model</h2>
            <FileUpload
              uploadType="model"
              onUpload={handleModelUpload}
              isUploading={isUploading}
            />
          </div>
        )}

        {activeTab === 'upload-scan' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Upload Medical Scan</h2>
            <FileUpload
              uploadType="scan"
              onUpload={handleScanUpload}
              isUploading={isUploading}
            />
          </div>
        )}
      </div>
    </div>
  );
}
