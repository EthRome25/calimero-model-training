import React, { useState, useEffect } from 'react';
import { Button } from '@calimero-network/mero-ui';
import { AbiClient, ScanFile } from '../../api/AbiClient';
import ScanList from '../../components/ScanList';
import Layout from '../../components/Layout';

interface ScansPageProps {
  api: AbiClient;
}

export default function ScansPage({ api }: ScansPageProps) {
  const [scans, setScans] = useState<ScanFile[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadingScanId, setDownloadingScanId] = useState<string | null>(null);

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

  useEffect(() => {
    loadScans();
  }, []);

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
    } catch (error) {
      console.error('Error downloading scan:', error);
      alert('Error downloading scan');
    } finally {
      setIsDownloading(false);
      setDownloadingScanId(null);
    }
  };

  const handleScanDelete = async (scanId: string) => {
    if (confirm('Are you sure you want to delete this scan?')) {
      try {
        await api.deleteFile({ file_id: scanId, file_type: 'scan' });
        await loadScans();
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
    <Layout api={api}>
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
    </Layout>
  );
}
