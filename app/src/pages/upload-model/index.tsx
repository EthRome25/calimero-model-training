import React from 'react';
import { useForm } from '@tanstack/react-form';
import { zodValidator } from '@tanstack/zod-form-adapter';
import { AbiClient } from '../../api/AbiClient';
import Layout from '../../components/Layout';
import { useModelUpload } from '../../hooks/useModelUpload';
import { modelUploadSchema, formatFileSize, getFileSizeInKB } from '../../schemas/modelUpload';
import { isRateLimitError, getRateLimitMessage } from '../../utils/errorHandling';
import { formatFormError } from '../../utils/formErrorHandling';

interface UploadModelPageProps {
  api: AbiClient;
}

export default function UploadModelPage({ api }: UploadModelPageProps) {
  const uploadMutation = useModelUpload(api);

  const form = useForm({
    defaultValues: {
      file: undefined as File | undefined,
      name: '',
      description: '',
      modelType: '' as 'tumor_classifier' | 'segmentation' | 'detection' | 'regression' | 'classification' | '',
      version: '',
      isPublic: true,
      uploader: '',
    },
    validatorAdapter: zodValidator(),
    validators: {
      onChange: modelUploadSchema,
    },
    onSubmitInvalid: () => {
      console.log('Form is invalid');
    },
    onSubmit: async ({ value }) => {
      try {
        await uploadMutation.mutateAsync(value);
        // Reset form on success
        form.reset();
        alert('Model uploaded successfully!');
      } catch (error) {
        console.error('Error uploading model:', error);
        if (isRateLimitError(error)) {
          alert(getRateLimitMessage(error));
        } else {
          alert('Error uploading model. Please try again.');
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
              <h1 className="professional-header__title">Upload ML Model</h1>
              <p className="professional-header__subtitle">
                Securely upload machine learning models with full privacy protection and peer-to-peer storage
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
            className="upload-form upload-form--two-column"
          >
            <div className="form-columns">
              {/* Left Column */}
              <div className="form-column">
                {/* File Upload Section */}
                <div className="form-section">
                  <h3 className="form-section__title">🤖 ML Model File</h3>
                  <p className="form-section__description">
                    Upload your machine learning model file. Maximum size: 40KB for optimal performance.
                  </p>
                  
                  <form.Field
                    name="file"
                    children={(field) => (
                      <div className="form-field">
                        <label className="form-label">
                          Model File *
                        </label>
                        <input
                          type="file"
                          accept=".pkl,.joblib,.h5,.pb,.onnx,.pt,.pth"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              console.log('File selected:', file);
                              field.handleChange(file);
                              // Auto-fill name if empty
                              if (!form.getFieldValue('name')) {
                                form.setFieldValue('name', file.name.replace(/\.[^/.]+$/, ''));
                              }
                            }
                          }}
                          className="form-input form-input--file"
                        />
                        {field.state.meta.errors.length > 0 && (
                          <div className="form-error">
                            {formatFormError(field.state.meta.errors[0])}
                          </div>
                        )}
                        {field.state.value && (
                          <div className="file-info">
                            <div className="file-info__name">
                              🤖 {field.state.value.name}
                            </div>
                            <div className={`file-info__size ${getFileSizeInKB(field.state.value.size) > 40 ? 'file-info__size--error' : ''}`}>
                              📊 {formatFileSize(field.state.value.size)}
                              {getFileSizeInKB(field.state.value.size) > 40 && (
                                <span className="file-info__warning"> (Exceeds 40KB limit)</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  />
                </div>

                {/* Basic Information Section */}
                <div className="form-section">
                  <h3 className="form-section__title">📋 Basic Information</h3>
                  <p className="form-section__description">
                    Provide essential details about the machine learning model.
                  </p>

                  <form.Field
                    name="name"
                    children={(field) => (
                      <div className="form-field">
                        <label className="form-label">
                          Model Name *
                        </label>
                        <input
                          type="text"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="e.g., Brain Tumor Classifier"
                          className="form-input"
                        />
                        {field.state.meta.errors.length > 0 && (
                          <div className="form-error">
                            {formatFormError(field.state.meta.errors[0])}
                          </div>
                        )}
                      </div>
                    )}
                  />

                  <form.Field
                    name="version"
                    children={(field) => (
                      <div className="form-field">
                        <label className="form-label">
                          Version *
                        </label>
                        <input
                          type="text"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="e.g., 1.0.0"
                          className="form-input"
                        />
                        {field.state.meta.errors.length > 0 && (
                          <div className="form-error">
                            {formatFormError(field.state.meta.errors[0])}
                          </div>
                        )}
                      </div>
                    )}
                  />

                  <form.Field
                    name="description"
                    children={(field) => (
                      <div className="form-field">
                        <label className="form-label">
                          Description *
                        </label>
                        <textarea
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="Describe the machine learning model, including its purpose, training data, and performance metrics..."
                          rows={4}
                          className="form-textarea"
                        />
                        {field.state.meta.errors.length > 0 && (
                          <div className="form-error">
                            {formatFormError(field.state.meta.errors[0])}
                          </div>
                        )}
                      </div>
                    )}
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="form-column">
                {/* Model Details Section */}
                <div className="form-section">
                  <h3 className="form-section__title">🧠 Model Details</h3>
                  <p className="form-section__description">
                    Specify the type and characteristics of the model.
                  </p>

                  <form.Field
                    name="modelType"
                    children={(field) => (
                      <div className="form-field">
                        <label className="form-label">
                          Model Type *
                        </label>
                        <select
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value as any)}
                          className="form-select"
                        >
                          <option value="">Select model type</option>
                          <option value="tumor_classifier">🎯 Tumor Classifier</option>
                          <option value="segmentation">✂️ Segmentation</option>
                          <option value="detection">🔍 Detection</option>
                          <option value="regression">📈 Regression</option>
                          <option value="classification">🏷️ Classification</option>
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

                {/* Uploader Information */}
                <div className="form-section">
                  <h3 className="form-section__title">👤 Uploader Information</h3>
                  <p className="form-section__description">
                    Provide your identification for record keeping.
                  </p>

                  <form.Field
                    name="uploader"
                    children={(field) => (
                      <div className="form-field">
                        <label className="form-label">
                          Uploader Name/ID *
                        </label>
                        <input
                          type="text"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="e.g., Dr. Smith, Researcher-001"
                          className="form-input"
                        />
                        {field.state.meta.errors.length > 0 && (
                          <div className="form-error">
                            {formatFormError(field.state.meta.errors[0])}
                          </div>
                        )}
                      </div>
                    )}
                  />

                  <form.Field
                    name="isPublic"
                    children={(field) => (
                      <div className="form-field">
                        <div className="checkbox-field">
                          <input
                            type="checkbox"
                            id="isPublic"
                            checked={field.state.value}
                            onChange={(e) => field.handleChange(e.target.checked)}
                            className="form-checkbox"
                          />
                          <label htmlFor="isPublic" className="form-label form-label--checkbox">
                            Make this model publicly available
                          </label>
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
              </div>
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
                    Uploading Model...
                  </>
                ) : (
                  '🚀 Upload ML Model'
                )}
              </button>
              
              {uploadMutation.error && (
                <div className="form-error form-error--global">
                  {isRateLimitError(uploadMutation.error) 
                    ? getRateLimitMessage(uploadMutation.error)
                    : 'Failed to upload model. Please try again.'
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
