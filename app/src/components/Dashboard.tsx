import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
} from '@calimero-network/mero-ui';
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
  const [downloadingModelId, setDownloadingModelId] = useState<string | null>(
    null,
  );
  const [downloadingScanId, setDownloadingScanId] = useState<string | null>(
    null,
  );
  const [stats, setStats] = useState<string>('');

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

  const loadScans = async () => {
    try {
      // For demo purposes, we'll load all scans
      // In a real app, you might want to filter by patient or user
      const allMetadata = await api.getAllMetadata();
      const scanMetadata = allMetadata.filter((m) => m.file_type === 'scan');

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
      const validScans = scanResults.filter(
        (scan): scan is ScanFile => scan !== null,
      );
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
      console.log('=== MODEL UPLOAD API CALL ===');
      console.log('Upload parameters:', {
        name: fileData.name,
        description: fileData.description,
        model_type: fileData.modelType,
        version: fileData.version,
        file_data_length: fileData.fileData?.length || 0,
        uploader: fileData.uploader,
        is_public: fileData.isPublic,
      });

      const result = await api.uploadModel({
        name: fileData.name,
        description: fileData.description,
        model_type: fileData.modelType,
        version: fileData.version,
        file_data: fileData.fileData,
        uploader: fileData.uploader,
        is_public: fileData.isPublic,
      });

      console.log('Model upload result:', result);
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
      console.log('=== SCAN UPLOAD API CALL ===');
      console.log('Upload parameters:', {
        patient_id: fileData.patientId,
        scan_type: fileData.scanType,
        body_part: fileData.bodyPart,
        file_data_length: fileData.fileData?.length || 0,
        uploader: fileData.uploader,
      });

      const result = await api.uploadScan({
        patient_id: fileData.patientId,
        scan_type: fileData.scanType,
        body_part: fileData.bodyPart,
        file_data: fileData.fileData,
        uploader: fileData.uploader,
      });

      console.log('Scan upload result:', result);
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
      console.log('=== SCAN DOWNLOAD DEBUG ===');
      console.log('Downloading scan ID:', scanId);

      const scan = await api.downloadScan({
        scan_id: scanId,
        downloader: 'current_user',
      });

      console.log('Downloaded scan data:', {
        id: scan.id,
        patient_id: scan.patient_id,
        scan_type: scan.scan_type,
        file_size: scan.file_size,
        file_data_type: typeof scan.file_data,
        file_data_length: scan.file_data?.length || 0,
        file_data_preview: scan.file_data?.substring(0, 100) + '...',
        file_data_end:
          '...' + scan.file_data?.substring(scan.file_data.length - 100),
      });

      // Convert base64 string back to binary data and create download link
      const blob = base64ToBlob(scan.file_data);
      console.log('Created blob:', {
        size: blob.size,
        type: blob.type,
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `scan_${scan.id}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      console.log('Scan download completed');
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
