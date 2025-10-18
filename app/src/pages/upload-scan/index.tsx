import React from 'react';
import { useForm } from '@tanstack/react-form';
import { zodValidator } from '@tanstack/zod-form-adapter';
import { AbiClient } from '../../api/AbiClient';
import Layout from '../../components/Layout';
import { useScanUpload } from '../../hooks/useScanUpload';
import { scanUploadSchema, formatFileSize, getFileSizeInKB } from '../../schemas/scanUpload';
import { isRateLimitError, getRateLimitMessage } from '../../utils/errorHandling';
import { formatFormError } from '../../utils/formErrorHandling';

interface UploadScanPageProps {
  api: AbiClient;
}

export default function UploadScanPage({ api }: UploadScanPageProps) {
  const uploadMutation = useScanUpload(api);

  const form = useForm({
    defaultValues: {
      file: undefined as File | undefined,
      name: '',
      description: '',
      patientId: '',
      scanType: '' as 'MRI' | 'CT' | 'PET' | 'Ultrasound' | 'X-Ray' | '',
      bodyPart: '' as 'brain' | 'chest' | 'abdomen' | 'spine' | 'pelvis' | 'extremities' | '',
      uploader: '',
    },
    validatorAdapter: zodValidator(),
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
        alert('Scan uploaded successfully!');
      } catch (error) {
        console.error('Error uploading scan:', error);
        if (isRateLimitError(error)) {
          alert(getRateLimitMessage(error));
        } else {
          alert('Error uploading scan. Please try again.');
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
            className="upload-form upload-form--two-column"
          >
            <div className="form-columns">
              {/* Left Column */}
              <div className="form-column">
                {/* File Upload Section */}
                <div className="form-section">
                  <h3 className="form-section__title">📁 Medical Image File</h3>
                  <p className="form-section__description">
                    Upload your medical scan file. Maximum size: 40KB for optimal performance.
                  </p>
                  
                  <form.Field
                    name="file"
                    children={(field) => (
                      <div className="form-field">
                        <label className="form-label">
                          Medical Image File *
                        </label>
                        <input
                          type="file"
                          accept=".dcm,.nii,.nii.gz,.jpg,.png,.tiff"
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
                              📄 {field.state.value.name}
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
                    Provide essential details about the medical scan.
                  </p>

                  <form.Field
                    name="name"
                    children={(field) => (
                      <div className="form-field">
                        <label className="form-label">
                          Scan Name *
                        </label>
                        <input
                          type="text"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="e.g., Brain MRI Scan"
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
                    name="patientId"
                    children={(field) => (
                      <div className="form-field">
                        <label className="form-label">
                          Patient ID *
                        </label>
                        <input
                          type="text"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="e.g., PAT-001"
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
                          placeholder="Describe the medical scan, including any relevant clinical information..."
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
                {/* Medical Details Section */}
                <div className="form-section">
                  <h3 className="form-section__title">🏥 Medical Details</h3>
                  <p className="form-section__description">
                    Specify the type of scan and anatomical region.
                  </p>

                  <form.Field
                    name="scanType"
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
