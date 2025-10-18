import React, { useState } from 'react';
import { AbiClient } from '../../api/AbiClient';
import FileUpload from '../../components/FileUpload';
import Layout from '../../components/Layout';

interface UploadModelPageProps {
  api: AbiClient;
}

export default function UploadModelPage({ api }: UploadModelPageProps) {
  const [isUploading, setIsUploading] = useState(false);

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
    } catch (error) {
      console.error('Error uploading model:', error);
      alert('Error uploading model');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Layout api={api}>
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Upload ML Model</h2>
        <FileUpload
          uploadType="model"
          onUpload={handleModelUpload}
          isUploading={isUploading}
        />
      </div>
    </Layout>
  );
}
