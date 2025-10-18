import React, { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { AbiClient } from '../../api/AbiClient';
import Layout from '../../components/Layout';
import { useCnnRetrain } from '../../hooks/useCnnPrediction';
import { formatFileSize } from '../../schemas/scanUpload';
import { isRateLimitError, getRateLimitMessage } from '../../utils/errorHandling';
import { formatFormError } from '../../utils/formErrorHandling';
import { CnnRetrainResponse } from '../../api/CnnApiClient';

interface ZipPredictingPageProps {
  api: AbiClient;
}

interface ZipPredictionInput {
  zipFile: File | null;
}

export default function ZipPredictingPage({ api }: ZipPredictingPageProps) {
  const [retrainResults, setRetrainResults] = useState<CnnRetrainResponse[]>([]);
  const [showResults, setShowResults] = useState(false);
  
  const cnnRetrainMutation = useCnnRetrain({
    onSuccess: (data) => {
      setRetrainResults(prev => [...prev, data]);
    },
    onError: (error) => {
      console.error('CNN retraining failed:', error);
      alert(`Model Retraining failed: ${error.message}`);
    }
  });

  const form = useForm({
    defaultValues: {
      zipFile: null,
    } as ZipPredictionInput,
    validators: {
      onChange: ({ value }) => {
        if (!value.zipFile) {
          return 'Please select a zip file';
        }
        return undefined;
      },
    },
    onSubmitInvalid: () => {
      console.log('Form is invalid');
    },
    onSubmit: async ({ value }) => {
      try {
        if (!value.zipFile) {
          alert('Please select a zip file');
          return;
        }
        console.log({value})
        
        // Clear previous retrain results
        setRetrainResults([]);
        setShowResults(true);
        
        // Run CNN retraining with the zip file
        console.log('Starting CNN retraining with file:', value.zipFile.name, 'Size:', value.zipFile.size);
        await cnnRetrainMutation.mutateAsync(value.zipFile);
        console.log('CNN retraining completed successfully');
      } catch (error) {
        console.error('Error running retraining:', error);
        if (isRateLimitError(error)) {
          alert(getRateLimitMessage(error));
        } else {
          alert('Error running retraining. Please try again.');
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
              <h1 className="professional-header__title">AI Model Retraining (ZIP)</h1>
              <p className="professional-header__subtitle">
                Retrain the CNN model with new training data from a ZIP file
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
                  <h3 className="form-section__title">📦 AI Model Retraining (ZIP)</h3>
                  <p className="form-section__description">
                    Upload a ZIP file containing training data to retrain the CNN model.
                  </p>
                </div>
              </div>
              
              <form.Field
                name="zipFile"
                validators={{
                  onChange: ({ value }) => {
                    if (!value) {
                      return 'Please select a zip file';
                    }
                    return undefined;
                  }
                }}
                children={(field) => (
                  <div className="form-field">
                    <label className="form-label">
                      ZIP File with Training Data *
                    </label>
                    <input
                      type="file"
                      accept=".zip"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        field.handleChange(file);
                        if (file) {
                          console.log('ZIP file selected:', file);
                        }
                      }}
                      className="form-input form-input--file"
                    />
                    {field.state.value && (
                      <div className="file-info">
                        <div className="file-info__name">
                          📦 {field.state.value.name}
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
            </div>

            {/* Submit Section */}
            <div className="form-section form-section--submit">
              <button
                type="submit"
                disabled={cnnRetrainMutation.isPending || !form.state.canSubmit}
                className="button button-primary button--large"
              >
                {cnnRetrainMutation.isPending ? (
                  <>
                    <div className="loading-spinner" style={{ width: '20px', height: '20px', marginRight: '8px' }}></div>
                    Retraining Model...
                  </>
                ) : (
                  '🔄 Retrain Model'
                )}
              </button>
              
              {form.state.errors.length > 0 && (
                <div className="form-error form-error--global">
                  {formatFormError(form.state.errors[0])}
                </div>
              )}
              
              {cnnRetrainMutation.error && (
                <div className="form-error form-error--global">
                  {isRateLimitError(cnnRetrainMutation.error) 
                    ? getRateLimitMessage(cnnRetrainMutation.error)
                    : cnnRetrainMutation.error instanceof Error 
                      ? cnnRetrainMutation.error.message 
                      : 'Failed to retrain model. Please try again.'
                  }
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Retraining Results */}
        {showResults && (
          <div className="upload-form-container upload-form-container--wide">
            <div className="form-section">
              <div className="form-section__header">
                <div>
                  <h3 className="form-section__title">🔄 Model Retraining Results</h3>
                  <p className="form-section__description">
                    Results from retraining the CNN model with your training data.
                  </p>
                </div>
              </div>
              
              {cnnRetrainMutation.isPending && (
                <div className="prediction-loading">
                  <div className="loading-spinner" style={{ width: '24px', height: '24px', marginRight: '12px' }}></div>
                  <div>
                    <span>Retraining model with your data...</span>
                    <br />
                    <small style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                      This may take several minutes. Please keep this page open.
                    </small>
                  </div>
                </div>
              )}
              
              {retrainResults.length > 0 && (
                <div className="prediction-results">
                  {retrainResults.map((result, index) => (
                    <div key={index} className="prediction-result">
                      <div className="prediction-header">
                        <h4>Retraining Complete</h4>
                        <div className="prediction-confidence">
                          Final Epoch: {result.details.final_epoch}
                        </div>
                      </div>
                      
                      <div className="prediction-main">
                        <div className="prediction-label">
                          <strong>Training Status:</strong>
                          <span className="prediction-diagnosis prediction-diagnosis--success">
                            {result.message}
                          </span>
                        </div>
                        
                        <div className="prediction-probabilities">
                          <h5>Training Metrics:</h5>
                          <div className="probability-bars">
                            <div className="probability-bar">
                              <div className="probability-label">
                                <span className="probability-name">Final Accuracy</span>
                                <span className="probability-percentage">
                                  {Math.round(result.details.history.accuracy[result.details.history.accuracy.length - 1] * 100)}%
                                </span>
                              </div>
                              <div className="probability-track">
                                <div 
                                  className="probability-fill probability-fill--primary"
                                  style={{ width: `${result.details.history.accuracy[result.details.history.accuracy.length - 1] * 100}%` }}
                                />
                              </div>
                            </div>
                            <div className="probability-bar">
                              <div className="probability-label">
                                <span className="probability-name">Final Loss</span>
                                <span className="probability-percentage">
                                  {result.details.history.loss[result.details.history.loss.length - 1].toFixed(4)}
                                </span>
                              </div>
                              <div className="probability-track">
                                <div 
                                  className="probability-fill"
                                  style={{ width: `${Math.min(result.details.history.loss[result.details.history.loss.length - 1] * 100, 100)}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="prediction-probabilities">
                          <h5>Model Details:</h5>
                          <div className="probability-bars">
                            <div className="probability-bar">
                              <div className="probability-label">
                                <span className="probability-name">Base Model</span>
                                <span className="probability-percentage">
                                  {result.details.used_params.base_model_name}
                                </span>
                              </div>
                            </div>
                            <div className="probability-bar">
                              <div className="probability-label">
                                <span className="probability-name">Epochs</span>
                                <span className="probability-percentage">
                                  {result.details.used_params.epochs}
                                </span>
                              </div>
                            </div>
                            <div className="probability-bar">
                              <div className="probability-label">
                                <span className="probability-name">Learning Rate</span>
                                <span className="probability-percentage">
                                  {result.details.used_params.learning_rate}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="prediction-actions">
                <button
                  type="button"
                  onClick={() => setShowResults(false)}
                  className="button button--secondary"
                >
                  Hide Results
                </button>
                <button
                  type="button"
                  onClick={() => {
                    form.reset();
                    setRetrainResults([]);
                    setShowResults(false);
                  }}
                  className="button button--primary"
                >
                  Retrain Another Model
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
