import React, { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { AbiClient } from '../../api/AbiClient';
import Layout from '../../components/Layout';
import { useScanUpload } from '../../hooks/useScanUpload';
import { useCnnPrediction } from '../../hooks/useCnnPrediction';
import { formatFileSize } from '../../schemas/scanUpload';
import { isRateLimitError, getRateLimitMessage } from '../../utils/errorHandling';
import { formatFormError } from '../../utils/formErrorHandling';
import { CnnPredictionResponse } from '../../api/CnnApiClient';

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
  const [predictionResults, setPredictionResults] = useState<CnnPredictionResponse[]>([]);
  const [showPredictions, setShowPredictions] = useState(false);
  
  const cnnPredictionMutation = useCnnPrediction({
    onSuccess: (data) => {
      setPredictionResults(prev => [...prev, data]);
    },
    onError: (error) => {
      console.error('CNN prediction failed:', error);
      alert(`AI Analysis failed: ${error.message}`);
    }
  });

  const form = useForm({
    defaultValues: {
      scans: [
        { id: 1, file: null, scanType: '', bodyPart: '' }
      ] as Array<{
        id: number;
        file: File | null;
        scanType: 'MRI' | 'CT' | 'PET' | 'Ultrasound' | 'X-Ray' | '';
        bodyPart: 'brain' | 'chest' | 'abdomen' | 'spine' | 'pelvis' | 'extremities' | '';
      }>,
    },
    validators: {
      onChange: ({ value }) => {
        const validScans = value.scans.filter(scan => scan.file && scan.scanType && scan.bodyPart);
        if (validScans.length === 0) {
          return 'Please add at least one scan';
        }
        return undefined;
      },
    },
    onSubmitInvalid: () => {
      console.log('Form is invalid');
    },
    onSubmit: async ({ value }) => {
      try {
        // Filter out invalid scans and transform to the expected format
        const validScans = value.scans
          .filter(scan => scan.file && scan.scanType && scan.bodyPart)
          .map(scan => ({
            file: scan.file!,
            scanType: scan.scanType as 'MRI' | 'CT' | 'PET' | 'Ultrasound' | 'X-Ray',
            bodyPart: scan.bodyPart as 'brain' | 'chest' | 'abdomen' | 'spine' | 'pelvis' | 'extremities',
          }));
        
        await uploadMutation.mutateAsync({ scans: validScans });
        
        // Reset form on success
        form.reset();
        
        // Clear previous prediction results
        setPredictionResults([]);
        setShowPredictions(true);
        
        // Run CNN predictions on uploaded brain MRI scans
        const brainMriScans = validScans.filter(scan => 
          scan.scanType === 'MRI' && scan.bodyPart === 'brain'
        );
        
        if (brainMriScans.length > 0) {
          // Run predictions for all brain MRI scans
          for (const scan of brainMriScans) {
            try {
              await cnnPredictionMutation.mutateAsync(scan.file);
            } catch (error) {
              console.error(`Failed to analyze scan ${scan.file.name}:`, error);
            }
          }
        } else {
          alert('Scans uploaded successfully! Note: AI brain tumor analysis is only available for brain MRI scans.');
        }
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

  const addScanInput = () => {
    const currentScans = form.getFieldValue('scans');
    const newId = Math.max(...currentScans.map((scan: any) => scan.id)) + 1;
    form.setFieldValue('scans', [
      ...currentScans,
      { id: newId, file: null, scanType: '', bodyPart: '' }
    ]);
    // Trigger validation after adding
    form.validateField('scans', 'change');
  };

  const removeScanInput = (id: number) => {
    const currentScans = form.getFieldValue('scans');
    if (currentScans.length > 1) {
      form.setFieldValue('scans', currentScans.filter((scan: any) => scan.id !== id));
      // Trigger validation after removing
      form.validateField('scans', 'change');
    }
  };

  const updateScanInput = (id: number, updates: Partial<Omit<ScanInput, 'id'>>) => {
    const currentScans = form.getFieldValue('scans');
    form.setFieldValue('scans', currentScans.map((scan: any) => 
      scan.id === id ? { ...scan, ...updates } : scan
    ));
    // Trigger validation after updating
    form.validateField('scans', 'change');
  };

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
                    Upload your medical scan files with their details.
                  </p>
                </div>
              </div>
              
              <form.Field
                name="scans"
                validators={{
                  onChange: ({ value }) => {
                    const errors: string[] = [];
                    value.forEach((scan, index) => {
                      if (!scan.file) {
                        errors.push(`Scan #${index + 1}: Please select a file`);
                      }
                      if (!scan.scanType) {
                        errors.push(`Scan #${index + 1}: Please select a scan type`);
                      }
                      if (!scan.bodyPart) {
                        errors.push(`Scan #${index + 1}: Please select a body part`);
                      }
                    });
                    return errors.length > 0 ? errors.join(', ') : undefined;
                  }
                }}
                children={(field) => (
                  <div className="form-field">
                    {field.state.value.map((scanInput, index) => (
                      <div key={scanInput.id} className={`scan-input-container ${index > 0 ? 'scan-input-container--with-border' : ''}`}>
                        
                        <div className="scan-input-header">
                          <h4 className="scan-input-title">Scan #{index + 1}</h4>
                        </div>
                        
                        {/* Remove Button - Positioned at top-right */}
                        {field.state.value.length > 1 && (
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
                                <div className="file-info__size">
                                  📊 {formatFileSize(scanInput.file.size)}
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

        {/* AI Analysis Results */}
        {showPredictions && (
          <div className="upload-form-container upload-form-container--wide">
            <div className="form-section">
              <div className="form-section__header">
                <div>
                  <h3 className="form-section__title">🧠 AI Brain Tumor Analysis Results</h3>
                  <p className="form-section__description">
                    AI-powered analysis of your brain MRI scans using deep learning models.
                  </p>
                </div>
              </div>
              
              {cnnPredictionMutation.isPending && (
                <div className="prediction-loading">
                  <div className="loading-spinner" style={{ width: '24px', height: '24px', marginRight: '12px' }}></div>
                  <span>Analyzing brain MRI scans with AI...</span>
                </div>
              )}
              
              {predictionResults.length > 0 && (
                <div className="prediction-results">
                  {predictionResults.map((result, index) => (
                    <div key={index} className="prediction-result">
                      <div className="prediction-header">
                        <h4>Scan #{index + 1} Analysis</h4>
                        <div className="prediction-confidence">
                          Confidence: {Math.round(result.probabilities[result.predicted_label] * 100)}%
                        </div>
                      </div>
                      
                      <div className="prediction-main">
                        <div className="prediction-label">
                          <strong>Predicted Diagnosis:</strong>
                          <span className={`prediction-diagnosis prediction-diagnosis--${result.predicted_label.toLowerCase()}`}>
                            {result.predicted_label}
                          </span>
                        </div>
                        
                        <div className="prediction-probabilities">
                          <h5>Probability Breakdown:</h5>
                          <div className="probability-bars">
                            {Object.entries(result.probabilities)
                              .sort(([,a], [,b]) => b - a)
                              .map(([label, probability]) => (
                                <div key={label} className="probability-bar">
                                  <div className="probability-label">
                                    <span className="probability-name">{label}</span>
                                    <span className="probability-percentage">
                                      {Math.round(probability * 100)}%
                                    </span>
                                  </div>
                                  <div className="probability-track">
                                    <div 
                                      className={`probability-fill ${label === result.predicted_label ? 'probability-fill--primary' : ''}`}
                                      style={{ width: `${probability * 100}%` }}
                                    />
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                        
                        {result.plot_base64_png && (
                          <div className="prediction-visualization">
                            <h5>Analysis Visualization:</h5>
                            <img 
                              src={`data:image/png;base64,${result.plot_base64_png}`}
                              alt="Brain tumor analysis visualization"
                              className="prediction-plot"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  <div className="prediction-disclaimer">
                    <p>
                      <strong>Medical Disclaimer:</strong> This AI analysis is for research and educational purposes only. 
                      It should not be used as a substitute for professional medical diagnosis, treatment, or advice. 
                      Always consult with qualified healthcare professionals for medical decisions.
                    </p>
                  </div>
                </div>
              )}
              
              <div className="prediction-actions">
                <button
                  type="button"
                  onClick={() => setShowPredictions(false)}
                  className="button button--secondary"
                >
                  Hide Results
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
