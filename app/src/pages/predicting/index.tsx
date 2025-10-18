import React, { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { AbiClient } from '../../api/AbiClient';
import Layout from '../../components/Layout';
import { useCnnPrediction } from '../../hooks/useCnnPrediction';
import { formatFileSize } from '../../schemas/scanUpload';
import { isRateLimitError, getRateLimitMessage } from '../../utils/errorHandling';
import { formatFormError } from '../../utils/formErrorHandling';
import { CnnPredictionResponse } from '../../api/CnnApiClient';

interface PredictingPageProps {
  api: AbiClient;
}

interface PredictionInput {
  file: File | null;
  scanType: 'MRI' | 'CT' | 'PET' | 'Ultrasound' | 'X-Ray' | '';
  bodyPart: 'brain' | 'chest' | 'abdomen' | 'spine' | 'pelvis' | 'extremities' | '';
}

export default function PredictingPage({ api }: PredictingPageProps) {
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
      file: null,
      scanType: '',
      bodyPart: '',
    } as PredictionInput,
    validators: {
      onChange: ({ value }) => {
        if (!value.file) {
          return 'Please select a medical image file';
        }
        if (!value.scanType) {
          return 'Please select a scan type';
        }
        if (!value.bodyPart) {
          return 'Please select a body part';
        }
        return undefined;
      },
    },
    onSubmitInvalid: () => {
      console.log('Form is invalid');
    },
    onSubmit: async ({ value }) => {
      try {
        if (!value.file || !value.scanType || !value.bodyPart) {
          alert('Please fill in all required fields');
          return;
        }
        console.log({value})
        // Check if it's a brain MRI scan for AI analysis
          // Clear previous prediction results
          setPredictionResults([]);
          setShowPredictions(true);
          
          // Run CNN prediction
          await cnnPredictionMutation.mutateAsync(value.file);
      } catch (error) {
        console.error('Error running prediction:', error);
        if (isRateLimitError(error)) {
          alert(getRateLimitMessage(error));
        } else {
          alert('Error running prediction. Please try again.');
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
              <h1 className="professional-header__title">AI Medical Prediction</h1>
              <p className="professional-header__subtitle">
                Analyze medical imaging data with AI-powered brain tumor detection
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
            {/* Prediction Section */}
            <div className="form-section">
              <div className="form-section__header">
                <div>
                  <h3 className="form-section__title">🧠 AI Brain Tumor Analysis</h3>
                  <p className="form-section__description">
                    Upload a brain MRI scan for AI-powered tumor detection and analysis.
                  </p>
                </div>
              </div>
              
              <form.Field
                name="file"
                validators={{
                  onChange: ({ value }) => {
                    if (!value) {
                      return 'Please select a medical image file';
                    }
                    return undefined;
                  }
                }}
                children={(field) => (
                  <div className="form-field">
                    <label className="form-label">
                      Brain MRI Image File *
                    </label>
                    <input
                      type="file"
                      accept=".dcm,.nii,.nii.gz,.jpg,.png,.tiff"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        field.handleChange(file);
                        if (file) {
                          console.log('File selected:', file);
                        }
                      }}
                      className="form-input form-input--file"
                    />
                    {field.state.value && (
                      <div className="file-info">
                        <div className="file-info__name">
                          📄 {field.state.value.name}
                        </div>
                        <div className="file-info__size">
                          📊 {formatFileSize(field.state.value.size)}
                        </div>
                      </div>
                    )}
                    {field.state.meta.errors.length > 0 && (
                      <div className="form-error">
                        {formatFormError(field.state.meta.errors[0])}
                      </div>
                    )}
                  </div>
                )}
              />

              <form.Field
                name="scanType"
                validators={{
                  onChange: ({ value }) => {
                    if (!value) {
                      return 'Please select a scan type';
                    }
                    return undefined;
                  }
                }}
                children={(field) => (
                  <div className="form-field">
                    <label className="form-label">
                      Scan Type *
                    </label>
                    <select
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value as any)}
                      className="form-select"
                    >
                      <option value="">Select scan type</option>
                      <option value="MRI">🧠 MRI (Magnetic Resonance Imaging)</option>
                      <option value="CT">🔬 CT (Computed Tomography)</option>
                      <option value="PET">⚛️ PET (Positron Emission Tomography)</option>
                      <option value="Ultrasound">📡 Ultrasound</option>
                      <option value="X-Ray">📷 X-Ray</option>
                    </select>
                    {field.state.meta.errors.length > 0 && (
                      <div className="form-error">
                        {formatFormError(field.state.meta.errors[0])}
                      </div>
                    )}
                  </div>
                )}
              />

              <form.Field
                name="bodyPart"
                validators={{
                  onChange: ({ value }) => {
                    if (!value) {
                      return 'Please select a body part';
                    }
                    return undefined;
                  }
                }}
                children={(field) => (
                  <div className="form-field">
                    <label className="form-label">
                      Body Part *
                    </label>
                    <select
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value as any)}
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
                disabled={cnnPredictionMutation.isPending || !form.state.canSubmit}
                className="button button-primary button--large"
              >
                {cnnPredictionMutation.isPending ? (
                  <>
                    <div className="loading-spinner" style={{ width: '20px', height: '20px', marginRight: '8px' }}></div>
                    Analyzing with AI...
                  </>
                ) : (
                  '🧠 Analyze with AI'
                )}
              </button>
              
              {form.state.errors.length > 0 && (
                <div className="form-error form-error--global">
                  {formatFormError(form.state.errors[0])}
                </div>
              )}
              
              {cnnPredictionMutation.error && (
                <div className="form-error form-error--global">
                  {isRateLimitError(cnnPredictionMutation.error) 
                    ? getRateLimitMessage(cnnPredictionMutation.error)
                    : cnnPredictionMutation.error instanceof Error 
                      ? cnnPredictionMutation.error.message 
                      : 'Failed to analyze scan. Please try again.'
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
                    AI-powered analysis of your brain MRI scan using deep learning models.
                  </p>
                </div>
              </div>
              
              {cnnPredictionMutation.isPending && (
                <div className="prediction-loading">
                  <div className="loading-spinner" style={{ width: '24px', height: '24px', marginRight: '12px' }}></div>
                  <span>Analyzing brain MRI scan with AI...</span>
                </div>
              )}
              
              {predictionResults.length > 0 && (
                <div className="prediction-results">
                  {predictionResults.map((result, index) => (
                    <div key={index} className="prediction-result">
                      <div className="prediction-header">
                        <h4>Scan Analysis</h4>
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
                <button
                  type="button"
                  onClick={() => {
                    form.reset();
                    setPredictionResults([]);
                    setShowPredictions(false);
                  }}
                  className="button button--primary"
                >
                  Analyze Another Scan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
