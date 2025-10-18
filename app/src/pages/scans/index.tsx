import React, { useState } from 'react';
import { AbiClient } from '../../api/AbiClient';
import ScanList from '../../components/ScanList';
import Layout from '../../components/Layout';
import { useScans, useDownloadScan, useDeleteScan } from '../../hooks/useScans';
import { isRateLimitError, getRateLimitMessage } from '../../utils/errorHandling';

interface ScansPageProps {
  api: AbiClient;
}

export default function ScansPage({ api }: ScansPageProps) {
  const [downloadingScanId, setDownloadingScanId] = useState<string | null>(null);

  // React Query hooks
  const { data: scans = [], isLoading, error, refetch } = useScans(api);
  const downloadScanMutation = useDownloadScan(api);
  const deleteScanMutation = useDeleteScan(api);

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

  const handleScanDownload = async (scanId: string) => {
    setDownloadingScanId(scanId);
    try {
      console.log('=== SCAN DOWNLOAD DEBUG ===');
      console.log('Downloading scan ID:', scanId);

      const scan = await downloadScanMutation.mutateAsync({
        scanId,
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
      setDownloadingScanId(null);
    }
  };

  const handleScanDelete = async (scanId: string) => {
    if (confirm('Are you sure you want to delete this scan?')) {
      try {
        await deleteScanMutation.mutateAsync({ scanId });
      } catch (error) {
        console.error('Error deleting scan:', error);
        alert('Error deleting scan');
      }
    }
  };


  return (
    <Layout api={api}>
      <div className="calimero-container">
        <div className="professional-header">
          <div className="professional-header__content">
            <div>
              <h1 className="professional-header__title">Medical Scans</h1>
              <p className="professional-header__subtitle">
                Secure, peer-to-peer medical imaging data with full privacy protection and local storage
              </p>
            </div>
            <div className="professional-header__actions">
              <button 
                className="button button-secondary"
                onClick={() => refetch()}
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Refresh Data'}
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
              {isRateLimitError(error) ? 'Rate Limit Exceeded' : 'Error Loading Scans'}
            </h3>
            <p className="empty-state__description">
              {isRateLimitError(error) 
                ? getRateLimitMessage(error)
                : (error instanceof Error ? error.message : 'Failed to load medical scans')
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
            <h3 className="empty-state__title">Loading Medical Scans...</h3>
            <p className="empty-state__description">
              Fetching the latest medical imaging data from the network
            </p>
          </div>
        )}
        
        {!isLoading && !error && (
          <ScanList
            scans={scans}
            onDownload={handleScanDownload}
            onDelete={handleScanDelete}
            isDownloading={downloadScanMutation.isPending}
            downloadingScanId={downloadingScanId}
          />
        )}
      </div>
    </Layout>
  );
}
