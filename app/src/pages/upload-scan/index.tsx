import React, { useState } from 'react';
import { AbiClient } from '../../api/AbiClient';
import FileUpload from '../../components/FileUpload';
import Layout from '../../components/Layout';

interface UploadScanPageProps {
  api: AbiClient;
}

export default function UploadScanPage({ api }: UploadScanPageProps) {
  const [isUploading, setIsUploading] = useState(false);

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
    } catch (error) {
      console.error('Error uploading scan:', error);
      alert('Error uploading scan');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Layout api={api}>
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Upload Medical Scan</h2>
        <FileUpload
          uploadType="scan"
          onUpload={handleScanUpload}
          isUploading={isUploading}
        />
      </div>
    </Layout>
  );
}
