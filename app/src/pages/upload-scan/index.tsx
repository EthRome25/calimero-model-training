import React, { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { AbiClient } from '../../api/AbiClient';
import Layout from '../../components/Layout';
import { useScanUpload } from '../../hooks/useScanUpload';
import { scanUploadSchema, formatFileSize, getFileSizeInKB } from '../../schemas/scanUpload';
import { isRateLimitError, getRateLimitMessage } from '../../utils/errorHandling';
import { formatFormError } from '../../utils/formErrorHandling';

interface UploadScanPageProps {
  api: AbiClient;
}

interface ScanInput {
  id: number;
  file: File | null;
  scanType: 'MRI' | 'CT' | 'PET' | 'Ultrasound' | 'X-Ray' | '';
  bodyPart: 'brain' | 'chest' | 'abdomen' | 'spine' | 'pelvis' | 'extremities' | '';
}

export default function UploadScanPage({ api }: UploadScanPageProps) {
  const uploadMutation = useScanUpload(api);
  const [scanInputs, setScanInputs] = useState<ScanInput[]>([
    { id: 1, file: null, scanType: '', bodyPart: '' }
  ]);

  const addScanInput = () => {
    const newId = Math.max(...scanInputs.map(input => input.id)) + 1;
    setScanInputs([...scanInputs, { id: newId, file: null, scanType: '', bodyPart: '' }]);
  };

  const removeScanInput = (id: number) => {
    if (scanInputs.length > 1) {
      setScanInputs(scanInputs.filter(input => input.id !== id));
      updateFormScans();
    }
  };

  const updateScanInput = (id: number, updates: Partial<Omit<ScanInput, 'id'>>) => {
    setScanInputs(scanInputs.map(input => 
      input.id === id ? { ...input, ...updates } : input
    ));
    updateFormScans();
  };

  const updateFormScans = () => {
    const validScans = scanInputs
      .filter(input => input.file && input.scanType && input.bodyPart)
      .map(input => ({
        file: input.file!,
        scanType: input.scanType as 'MRI' | 'CT' | 'PET' | 'Ultrasound' | 'X-Ray',
        bodyPart: input.bodyPart as 'brain' | 'chest' | 'abdomen' | 'spine' | 'pelvis' | 'extremities',
      }));
    form.setFieldValue('scans', validScans);
  };

  const form = useForm({
    defaultValues: {
      scans: [] as Array<{
        file: File;
        scanType: 'MRI' | 'CT' | 'PET' | 'Ultrasound' | 'X-Ray';
        bodyPart: 'brain' | 'chest' | 'abdomen' | 'spine' | 'pelvis' | 'extremities';
      }>,
    },
    validators: {
      onChange: scanUploadSchema,
    },
    onSubmitInvalid: () => {
      console.log('Form is invalid');
    },
    onSubmit: async ({ value }) => {
      try {
        await uploadMutation.mutateAsync(value);
        // Reset form on success
        form.reset();
        setScanInputs([{ id: 1, file: null, scanType: '', bodyPart: '' }]);
        alert('Scans uploaded successfully!');
      } catch (error) {
        console.error('Error uploading scans:', error);
        if (isRateLimitError(error)) {
          alert(getRateLimitMessage(error));
        } else {
          alert('Error uploading scans. Please try again.');
        }
      }
    },
  });

  return (
    <Layout api={api}>
      <div className="calimero-container">
        <div className="professional-header">
          <div className="professional-header__content">
            <div>
              <h1 className="professional-header__title">Upload Medical Scan</h1>
              <p className="professional-header__subtitle">
                Securely upload medical imaging data with full privacy protection and peer-to-peer storage
              </p>
            </div>
          </div>
        </div>

        <div className="upload-form-container upload-form-container--wide">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="upload-form"
          >
            {/* Scans Section */}
            <div className="form-section">
              <div className="form-section__header">
                <div>
                  <h3 className="form-section__title">📁 Medical Scans</h3>
                  <p className="form-section__description">
                    Upload your medical scan files with their details. Maximum size per file: 40KB.
                  </p>
                </div>
              </div>
              
              <form.Field
                name="scans"
                children={(field) => (
                  <div className="form-field">
                    {scanInputs.map((scanInput, index) => (
                      <div key={scanInput.id} className={`scan-input-container ${index > 0 ? 'scan-input-container--with-border' : ''}`}>
                        
                        <div className="scan-input-header">
                          <h4 className="scan-input-title">Scan #{index + 1}</h4>
                        </div>
                        
                        {/* Remove Button - Positioned at top-right */}
                        {scanInputs.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeScanInput(scanInput.id)}
                            className="button button--remove-file"
                            title="Remove this scan"
                          >
                            ✕
                          </button>
                        )}
                        
                        <div className="scan-input-grid">
                          {/* File Upload */}
                          <div className="form-field">
                            <label className="form-label">
                              Medical Image File *
                            </label>
                            <input
                              type="file"
                              accept=".dcm,.nii,.nii.gz,.jpg,.png,.tiff"
                              onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                updateScanInput(scanInput.id, { file });
                                if (file) {
                                  console.log('File selected:', file);
                                }
                              }}
                              className="form-input form-input--file"
                            />
                            {scanInput.file && (
                              <div className="file-info">
                                <div className="file-info__name">
                                  📄 {scanInput.file.name}
                                </div>
                                <div className={`file-info__size ${getFileSizeInKB(scanInput.file.size) > 40 ? 'file-info__size--error' : ''}`}>
                                  📊 {formatFileSize(scanInput.file.size)}
                                  {getFileSizeInKB(scanInput.file.size) > 40 && (
                                    <span className="file-info__warning"> (Exceeds 40KB limit)</span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* Scan Type */}
                          <div className="form-field">
                            <label className="form-label">
                              Scan Type *
                            </label>
                            <select
                              value={scanInput.scanType}
                              onChange={(e) => updateScanInput(scanInput.id, { scanType: e.target.value as any })}
                              className="form-select"
                            >
                              <option value="">Select scan type</option>
                              <option value="MRI">🧠 MRI (Magnetic Resonance Imaging)</option>
                              <option value="CT">🔬 CT (Computed Tomography)</option>
                              <option value="PET">⚛️ PET (Positron Emission Tomography)</option>
                              <option value="Ultrasound">📡 Ultrasound</option>
                              <option value="X-Ray">📷 X-Ray</option>
                            </select>
                          </div>
                          
                          {/* Body Part */}
                          <div className="form-field">
                            <label className="form-label">
                              Body Part *
                            </label>
                            <select
                              value={scanInput.bodyPart}
                              onChange={(e) => updateScanInput(scanInput.id, { bodyPart: e.target.value as any })}
                              className="form-select"
                            >
                              <option value="">Select body part</option>
                              <option value="brain">🧠 Brain</option>
                              <option value="chest">🫁 Chest</option>
                              <option value="abdomen">🫀 Abdomen</option>
                              <option value="spine">🦴 Spine</option>
                              <option value="pelvis">🦴 Pelvis</option>
                              <option value="extremities">🦵 Extremities</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Add Button */}
                    <div className="scan-add-button-container">
                      <button
                        type="button"
                        onClick={addScanInput}
                        className="button button--add-file"
                        title="Add another scan"
                      >
                        ➕ Add Scan
                      </button>
                    </div>
                    
                    {field.state.meta.errors.length > 0 && (
                      <div className="form-error">
                        {formatFormError(field.state.meta.errors[0])}
                      </div>
                    )}
                  </div>
                )}
              />
            </div>

            {/* Submit Section */}
            <div className="form-section form-section--submit">
              <button
                type="submit"
                disabled={uploadMutation.isPending || !form.state.canSubmit}
                className="button button-primary button--large"
              >
                {uploadMutation.isPending ? (
                  <>
                    <div className="loading-spinner" style={{ width: '20px', height: '20px', marginRight: '8px' }}></div>
                    Uploading Scan...
                  </>
                ) : (
                  '🚀 Upload Medical Scan'
                )}
              </button>
              
              {uploadMutation.error && (
                <div className="form-error form-error--global">
                  {isRateLimitError(uploadMutation.error) 
                    ? getRateLimitMessage(uploadMutation.error)
                    : uploadMutation.error instanceof Error 
                      ? uploadMutation.error.message 
                      : 'Failed to upload scan. Please try again.'
                  }
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
