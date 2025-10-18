import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
} from '@calimero-network/mero-ui';
import { ScanFile } from '../api/AbiClient';

interface ScanListProps {
  scans: ScanFile[];
  onDownload: (scanId: string) => void;
  onDelete: (scanId: string) => void;
  onAddAnnotation: (scanId: string, label: string) => void;
  isDownloading: boolean;
  downloadingScanId: string | null;
}

export default function ScanList({
  scans,
  onDownload,
  onDelete,
  onAddAnnotation,
  isDownloading,
  downloadingScanId,
}: ScanListProps) {
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

  const getScanTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      MRI: 'bg-blue-100 text-blue-800',
      CT: 'bg-green-100 text-green-800',
      PET: 'bg-purple-100 text-purple-800',
      Ultrasound: 'bg-yellow-100 text-yellow-800',
      'X-Ray': 'bg-red-100 text-red-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getBodyPartColor = (part: string) => {
    const colors: { [key: string]: string } = {
      brain: 'bg-pink-100 text-pink-800',
      chest: 'bg-blue-100 text-blue-800',
      abdomen: 'bg-green-100 text-green-800',
      spine: 'bg-purple-100 text-purple-800',
      pelvis: 'bg-yellow-100 text-yellow-800',
      extremities: 'bg-orange-100 text-orange-800',
    };
    return colors[part] || 'bg-gray-100 text-gray-800';
  };

  if (scans.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-500">No scans available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {scans.map((scan) => (
        <Card key={scan.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">
                Scan {scan.id.slice(-8)}
              </CardTitle>
              <div className="flex gap-1">
                <Badge className={getScanTypeColor(scan.scan_type)}>
                  {scan.scan_type}
                </Badge>
                <Badge className={getBodyPartColor(scan.body_part)}>
                  {scan.body_part}
                </Badge>
              </div>
            </div>
            <p className="text-sm text-gray-600">Patient: {scan.patient_id}</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Size:</span>
                <span>{formatFileSize(scan.file_size)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Uploader:</span>
                <span>{scan.uploader}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Created:</span>
                <span>{formatDate(scan.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Annotations:</span>
                <Badge variant="outline">{scan.annotation_count}</Badge>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button
                onClick={() => onDownload(scan.id)}
                disabled={isDownloading && downloadingScanId === scan.id}
                size="sm"
                className="flex-1"
              >
                {isDownloading && downloadingScanId === scan.id
                  ? 'Downloading...'
                  : 'Download'}
              </Button>
              <Button
                onClick={() => onAddAnnotation(scan.id, 'tumor_detected')}
                variant="outline"
                size="sm"
              >
                Annotate
              </Button>
              <Button
                onClick={() => onDelete(scan.id)}
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
