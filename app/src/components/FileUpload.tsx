import React, { useState } from 'react';
import {
  Button,
  Input,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@calimero-network/mero-ui';

interface FileUploadProps {
  onUpload: (fileData: {
    name: string;
    description: string;
    modelType?: string;
    version?: string;
    isPublic?: boolean;
    patientId?: string;
    scanType?: string;
    bodyPart?: string;
    fileData: string;
    uploader: string;
  }) => void;
  uploadType: 'model' | 'scan';
  isUploading: boolean;
}

export default function FileUpload({
  onUpload,
  uploadType,
  isUploading,
}: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [modelType, setModelType] = useState('');
  const [version, setVersion] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [patientId, setPatientId] = useState('');
  const [scanType, setScanType] = useState('');
  const [bodyPart, setBodyPart] = useState('');
  const [uploader, setUploader] = useState('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (!name) {
        setName(selectedFile.name);
      }
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!file) {
      alert('Please select a file');
      return;
    }

    try {
      console.log('=== FILE UPLOAD DEBUG ===');
      console.log('Original file:', {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
      });

      const fileData = await fileToBase64(file);

      console.log('Base64 conversion result:', {
        base64Length: fileData.length,
        base64Preview: fileData.substring(0, 100) + '...',
        base64End: '...' + fileData.substring(fileData.length - 100),
      });

      const uploadData =
        uploadType === 'model'
          ? {
              name,
              description,
              modelType,
              version,
              isPublic,
              fileData,
              uploader,
            }
          : {
              name,
              description,
              patientId,
              scanType,
              bodyPart,
              fileData,
              uploader,
            };

      console.log('Upload data being sent:', {
        ...uploadData,
        fileData: `[Base64 string of length ${fileData.length}]`,
      });

      onUpload(uploadData);
    } catch (error) {
      console.error('Error converting file to base64:', error);
      alert('Error processing file');
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix (e.g., "data:image/png;base64,")
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          Upload {uploadType === 'model' ? 'ML Model' : 'Medical Scans'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">File</label>
            <Input
              type="file"
              onChange={handleFileChange}
              accept={
                uploadType === 'model'
                  ? '.pkl,.joblib,.h5,.pb,.onnx'
                  : '.dcm,.nii,.nii.gz,.jpg,.png,.tiff'
              }
              required
            />
            {file && (
              <p className="text-sm text-gray-600 mt-1">
                Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)}{' '}
                MB)
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`Enter ${uploadType} name`}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={`Describe this ${uploadType}`}
              rows={3}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Uploader</label>
            <Input
              value={uploader}
              onChange={(e) => setUploader(e.target.value)}
              placeholder="Your name or ID"
              required
            />
          </div>

          {uploadType === 'model' ? (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Model Type
                </label>
                <select
                  value={modelType}
                  onChange={(e) => setModelType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select model type</option>
                  <option value="tumor_classifier">Tumor Classifier</option>
                  <option value="segmentation">Segmentation</option>
                  <option value="detection">Detection</option>
                  <option value="regression">Regression</option>
                  <option value="classification">Classification</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Version
                </label>
                <Input
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder="e.g., 1.0.0"
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="isPublic" className="text-sm font-medium">
                  Make this model publicly available
                </label>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Patient ID
                </label>
                <Input
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  placeholder="Patient identifier"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Scan Type
                </label>
                <select
                  value={scanType}
                  onChange={(e) => setScanType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select scan type</option>
                  <option value="MRI">MRI</option>
                  <option value="CT">CT</option>
                  <option value="PET">PET</option>
                  <option value="Ultrasound">Ultrasound</option>
                  <option value="X-Ray">X-Ray</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Body Part
                </label>
                <select
                  value={bodyPart}
                  onChange={(e) => setBodyPart(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select body part</option>
                  <option value="brain">Brain</option>
                  <option value="chest">Chest</option>
                  <option value="abdomen">Abdomen</option>
                  <option value="spine">Spine</option>
                  <option value="pelvis">Pelvis</option>
                  <option value="extremities">Extremities</option>
                </select>
              </div>
            </>
          )}

          <Button
            type="submit"
            disabled={isUploading || !file}
            className="w-full"
          >
            {isUploading
              ? 'Uploading...'
              : `Upload ${uploadType === 'model' ? 'Model' : 'Scan'}`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
