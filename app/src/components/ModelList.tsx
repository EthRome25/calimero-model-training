import React from 'react';
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
  downloadingModelId,
}: ModelListProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (
    timestamp: number | string | undefined | null,
  ): string | React.JSX.Element => {
    try {
      // Handle null/undefined
      if (timestamp === null || timestamp === undefined) {
        return 'No Date';
      }

      // Handle different timestamp formats
      let date: Date;
      let numericTimestamp: number;

      // Convert to number if it's a string
      if (typeof timestamp === 'string') {
        // Try to parse as a number first
        numericTimestamp = parseFloat(timestamp);
        if (isNaN(numericTimestamp)) {
          // If it's not a number, try to parse as a date string
          date = new Date(timestamp);
          if (!isNaN(date.getTime())) {
            const dateStr = date.toLocaleDateString();
            const timeStr = date.toLocaleTimeString();
            return (
              <div>
                <div>{dateStr}</div>
                <div
                  style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}
                >
                  {timeStr}
                </div>
              </div>
            );
          } else {
            return 'Invalid Date';
          }
        }
      } else {
        numericTimestamp = timestamp;
      }

      if (!numericTimestamp || numericTimestamp === 0) {
        return 'No Date';
      }

      if (numericTimestamp < 10000000000) {
        // Unix timestamp in seconds, convert to milliseconds
        date = new Date(numericTimestamp * 1000);
      } else if (numericTimestamp > 1000000000000000000) {
        // Unix timestamp in nanoseconds, convert to milliseconds
        date = new Date(numericTimestamp / 1000000);
      } else {
        // Unix timestamp in milliseconds
        date = new Date(numericTimestamp);
      }

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }

      const dateStr = date.toLocaleDateString();
      const timeStr = date.toLocaleTimeString();
      return (
        <div>
          <div>{dateStr}</div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            {timeStr}
          </div>
        </div>
      );
    } catch (error) {
      console.error('Error formatting date:', error, 'timestamp:', timestamp);
      return 'Error Date';
    }
  };

  const getModelTypeIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      tumor_classifier: '🎯',
      segmentation: '✂️',
      detection: '🔍',
      regression: '📈',
      classification: '🏷️',
    };
    return icons[type] || '🤖';
  };

  const getModelTypeDescription = (type: string) => {
    const descriptions: { [key: string]: string } = {
      tumor_classifier:
        'Advanced AI model for tumor detection and classification in medical imaging',
      segmentation:
        'Deep learning model for precise image segmentation and region identification',
      detection:
        'Computer vision model for object detection and localization tasks',
      regression:
        'Machine learning model for predictive analysis and numerical predictions',
      classification:
        'AI model for categorizing and classifying data into predefined classes',
    };
    return (
      descriptions[type] ||
      'Machine learning model for data analysis and prediction'
    );
  };

  if (models.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state__icon">🤖</div>
        <h3 className="empty-state__title">No ML Models Available</h3>
        <p className="empty-state__description">
          Upload your first machine learning model to get started with secure,
          peer-to-peer AI model sharing.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {models.map((model) => (
        <div key={model.id} className="horizontal-card__background">
          <div className="horizontal-card__content">
            <div className="horizontal-card__icon">
              {getModelTypeIcon(model.model_type)}
            </div>

            <div className="horizontal-card__main">
              <h3 className="horizontal-card__title">
                {model.name} v{model.version}
              </h3>

              <p className="horizontal-card__description">
                {getModelTypeDescription(model.model_type)}. {model.description}
                Uploaded by {model.uploader} on {formatDate(model.created_at)}.
              </p>

              <div className="horizontal-card__meta">
                <span className="horizontal-card__badge horizontal-card__badge--primary">
                  {model.model_type.replace('_', ' ')}
                </span>
                <span
                  className={`horizontal-card__badge ${model.is_public ? 'horizontal-card__badge--secondary' : ''}`}
                >
                  {model.is_public ? 'Public' : 'Private'}
                </span>
                <span className="horizontal-card__badge">
                  {formatFileSize(model.file_size)}
                </span>
                <span className="horizontal-card__badge">v{model.version}</span>
              </div>

              <div className="horizontal-card__actions">
                <button
                  className="button button-primary"
                  onClick={() => onDownload(model.id)}
                  disabled={isDownloading && downloadingModelId === model.id}
                >
                  {isDownloading && downloadingModelId === model.id
                    ? 'Downloading...'
                    : 'Download Model'}
                </button>
                <button
                  className="button button-secondary"
                  onClick={() => onDelete(model.id)}
                  style={{
                    color: '#ef4444',
                    borderColor: '#ef4444',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#ef4444';
                    e.currentTarget.style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#ef4444';
                  }}
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="horizontal-card__stats">
              <div className="horizontal-card__stat">
                <div className="horizontal-card__stat-value">
                  {formatFileSize(model.file_size)}
                </div>
                <div className="horizontal-card__stat-label">Model Size</div>
              </div>
              <div className="horizontal-card__stat">
                <div className="horizontal-card__stat-value">
                  v{model.version}
                </div>
                <div className="horizontal-card__stat-label">Version</div>
              </div>
              <div className="horizontal-card__stat">
                <div className="horizontal-card__stat-value">
                  {model.is_public ? 'Public' : 'Private'}
                </div>
                <div className="horizontal-card__stat-label">Access</div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
