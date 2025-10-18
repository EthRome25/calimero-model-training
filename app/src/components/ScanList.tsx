import React from 'react';
import { ScanFile } from '../api/AbiClient';

interface ScanListProps {
  scans: ScanFile[];
  onDownload: (scanId: string) => void;
  onDelete: (scanId: string) => void;
  isDownloading: boolean;
  downloadingScanId: string | null;
}

export default function ScanList({
  scans,
  onDownload,
  onDelete,
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

  const getScanTypeIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      MRI: '🧠',
      CT: '🔬',
      PET: '⚛️',
      Ultrasound: '📡',
      'X-Ray': '📷',
    };
    return icons[type] || '🏥';
  };

  const getBodyPartIcon = (part: string) => {
    const icons: { [key: string]: string } = {
      brain: '🧠',
      chest: '🫁',
      abdomen: '🫀',
      spine: '🦴',
      pelvis: '🦴',
      extremities: '🦵',
    };
    return icons[part] || '🏥';
  };

  if (scans.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state__icon">🏥</div>
        <h3 className="empty-state__title">No Medical Scans Available</h3>
        <p className="empty-state__description">
          Upload your first medical scan to get started with secure,
          peer-to-peer medical data sharing.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {scans.map((scan) => (
        <div key={scan.id} className="horizontal-card__background">
          <div className="horizontal-card__content">
            <div className="horizontal-card__icon">
              {getScanTypeIcon(scan.scan_type)}
            </div>

            <div className="horizontal-card__main">
              <h3 className="horizontal-card__title">
                {scan.scan_type} Scan - {scan.body_part}
              </h3>

              <p className="horizontal-card__description">
                Medical scan for patient {scan.patient_id}. Uploaded by{' '}
                {scan.uploader} on {formatDate(scan.created_at)}. This scan
                contains detailed imaging data for diagnostic analysis and
                medical research.
              </p>

              <div className="horizontal-card__meta">
                <span className="horizontal-card__badge horizontal-card__badge--primary">
                  {scan.scan_type}
                </span>
                <span className="horizontal-card__badge horizontal-card__badge--secondary">
                  {scan.body_part}
                </span>
                <span className="horizontal-card__badge">
                  {formatFileSize(scan.file_size)}
                </span>
              </div>

              <div className="horizontal-card__actions">
                <button
                  className="button button-primary"
                  onClick={() => onDownload(scan.id)}
                  disabled={isDownloading && downloadingScanId === scan.id}
                >
                  {isDownloading && downloadingScanId === scan.id
                    ? 'Downloading...'
                    : 'Download'}
                </button>
                <button
                  className="button button-secondary"
                  onClick={() => onDelete(scan.id)}
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
                  {formatFileSize(scan.file_size)}
                </div>
                <div className="horizontal-card__stat-label">File Size</div>
              </div>
              <div className="horizontal-card__stat">
                <div className="horizontal-card__stat-label">Created</div>
                <div className="horizontal-card__stat-value">
                  {formatDate(scan.created_at)}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
