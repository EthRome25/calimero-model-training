import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useModelSummary, useCurrentModelName } from '../../hooks/useModelSummary';
import { AbiClient } from '../../api/AbiClient';
import Layout from '../../components/Layout';

interface ModelSummaryPageProps {
  api: AbiClient;
}

function ModelSummaryContent({ api }: ModelSummaryPageProps) {
  const queryClient = useQueryClient();
  const { data: modelSummary, isLoading, error, refetch } = useModelSummary(api);
  const { refetch: refetchModelName } = useCurrentModelName(api);

  console.log('Model Summary Data:', modelSummary);

  const handleShowModelName = async () => {
    try {
      // Clear cache first to force fresh data
      queryClient.invalidateQueries({ queryKey: ['currentModelName'] });
      queryClient.invalidateQueries({ queryKey: ['modelSummary'] });
      
      // Force refresh by invalidating cache first
      const modelName = await refetchModelName();
      if (modelName.data) {
        alert(`Obecny model: ${modelName.data}`);
      } else {
        alert('Nie udało się pobrać nazwy modelu');
      }
    } catch (error) {
      console.error('Error fetching model name:', error);
      alert('Błąd podczas pobierania nazwy modelu');
    }
  };

  if (isLoading) {
    return (
      <div className="empty-state">
        <div className="loading-spinner" style={{ margin: '0 auto' }}></div>
        <h3 className="empty-state__title">Loading Model Summary...</h3>
        <p className="empty-state__description">
          Fetching the latest model training results and performance metrics
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="empty-state">
        <div className="empty-state__icon">⚠️</div>
        <h3 className="empty-state__title">Error Loading Model Summary</h3>
        <p className="empty-state__description">
          {error instanceof Error ? error.message : 'An unexpected error occurred'}
        </p>
        <button
          onClick={() => refetch()}
          className="button button-primary"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!modelSummary) {
    return (
      <div className="empty-state">
        <div className="empty-state__icon">📊</div>
        <h3 className="empty-state__title">No Model Data</h3>
        <p className="empty-state__description">No model summary data available.</p>
      </div>
    );
  }

  return (
    <div className="calimero-container" style={{ paddingBottom: 'var(--spacing-xxl)' }}>
      {/* Header */}
      <div className="professional-header" style={{ marginBottom: 'var(--spacing-xxl)' }}>
        <div className="professional-header__content">
          <div>
            <h1 className="professional-header__title">Model Training Summary</h1>
            <p className="professional-header__subtitle">
              Comprehensive performance analysis and training metrics for the latest model
            </p>
          </div>
          <div className="professional-header__actions">
            <button
              className="button button-secondary"
              onClick={() => refetch()}
            >
              Refresh Data
            </button>
            <button
              className="button button-primary"
              onClick={handleShowModelName}
              style={{ marginLeft: 'var(--spacing-m)' }}
            >
              Show Current Model
            </button>
          </div>
        </div>
      </div>

      {/* Model Info Card */}
      <div className="calimero-card" style={{ marginBottom: 'var(--spacing-xxl)' }}>
        <div className="horizontal-card__content">
          <div className="horizontal-card__icon">🤖</div>
          <div className="horizontal-card__main">
            <h2 className="horizontal-card__title">{modelSummary.name}</h2>
            <p className="horizontal-card__description">
              Advanced medical image classification model with state-of-the-art performance metrics
            </p>
            <div className="horizontal-card__meta">
              <span className="horizontal-card__badge horizontal-card__badge--primary">
                Version {modelSummary.version}
              </span>
              <span className={`horizontal-card__badge ${
                modelSummary.status === 'completed' 
                  ? 'horizontal-card__badge--primary' 
                  : 'horizontal-card__badge--secondary'
              }`}>
                {modelSummary.status.charAt(0).toUpperCase() + modelSummary.status.slice(1)}
              </span>
              <span className="horizontal-card__badge">
                Last Updated: {new Date(modelSummary.lastUpdated).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Accuracy Highlight Card */}
      <div className="calimero-card" style={{
        background: 'linear-gradient(135deg, rgba(181, 255, 17, 0.1) 0%, rgba(181, 255, 17, 0.05) 100%)',
        borderColor: 'var(--border-brand)',
        marginBottom: 'var(--spacing-xxl)',
        padding: 'var(--spacing-xxl)'
      }}>
        {/* 2x2 Grid Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          gridTemplateRows: 'auto auto',
          gap: 'var(--spacing-xl)',
          alignItems: 'start'
        }}>
          {/* Row 1, Col 1: Icon */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'var(--surface-action-default)',
              color: 'var(--content-on-surface-action-default)',
              fontSize: '2.5rem',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              🎯
            </div>
          </div>

          {/* Row 1, Col 2: Title + Description */}
          <div>
            <h2 className="horizontal-card__title" style={{ marginBottom: 'var(--spacing-m)' }}>Model Accuracy</h2>
            <p className="horizontal-card__description">
              Overall performance metric for the trained model - the most important indicator for end users
            </p>
          </div>

          {/* Row 2, Col 1: Empty */}
          <div></div>

          {/* Row 2, Col 2: Stats */}
          <div className="horizontal-card__stats" style={{
            paddingTop: 0,
            borderTop: 'none',
            margin: 0
          }}>
            <div className="horizontal-card__stat">
              <div className="horizontal-card__stat-value" style={{ fontSize: '3rem' }}>
                {modelSummary.accuracy}%
              </div>
              <div className="horizontal-card__stat-label">Accuracy</div>
            </div>
            <div className="horizontal-card__stat">
              <div className="horizontal-card__stat-value">
                {modelSummary.precision}%
              </div>
              <div className="horizontal-card__stat-label" style={{ color: 'var(--text-primary)' }}>Precision</div>
            </div>
            <div className="horizontal-card__stat">
              <div className="horizontal-card__stat-value">
                {modelSummary.recall}%
              </div>
              <div className="horizontal-card__stat-label" style={{ color: 'var(--text-primary)' }}>Recall</div>
            </div>
            <div className="horizontal-card__stat">
              <div className="horizontal-card__stat-value">
                {modelSummary.f1Score}%
              </div>
              <div className="horizontal-card__stat-label" style={{ color: 'var(--text-primary)' }}>F1 Score</div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics Grid */}
      <div className="calimero-stats-grid" style={{ marginBottom: 'var(--spacing-xxl)' }}>
        <div className="calimero-stat-card">
          <div className="calimero-stat-number">{modelSummary.trainingTime}</div>
          <div className="calimero-stat-label">Training Time</div>
        </div>
        <div className="calimero-stat-card">
          <div className="calimero-stat-number">{modelSummary.datasetSize.toLocaleString()}</div>
          <div className="calimero-stat-label">Dataset Size</div>
        </div>
        <div className="calimero-stat-card">
          <div className="calimero-stat-number">{modelSummary.modelSize}</div>
          <div className="calimero-stat-label">Model Size</div>
        </div>
        <div className="calimero-stat-card">
          <div className="calimero-stat-number">{modelSummary.epochsCompleted}</div>
          <div className="calimero-stat-label">Epochs Completed</div>
        </div>
      </div>

      {/* Training Details */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 'var(--spacing-xxl)'
      }} className="training-details-grid">
        <div className="calimero-card" style={{ padding: 'var(--spacing-xxl)' }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '700',
            color: 'var(--text-primary)',
            marginBottom: 'var(--spacing-xl)',
            fontFamily: 'Power Grotesk, Arial, Helvetica, sans-serif'
          }}>
            Training Progress
          </h3>
          <div style={{ marginBottom: 'var(--spacing-xl)' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.875rem',
              marginBottom: 'var(--spacing-m)',
              color: 'var(--text-muted)'
            }}>
              <span>Epochs</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>
                {modelSummary.epochsCompleted} / {modelSummary.totalEpochs}
              </span>
            </div>
            <div style={{
              width: '100%',
              background: 'var(--background-tertiary)',
              borderRadius: '4px',
              height: '12px',
              overflow: 'hidden'
            }}>
              <div
                style={{
                  background: 'var(--surface-action-default)',
                  height: '100%',
                  width: `${modelSummary.trainingProgress}%`,
                  transition: 'width 0.3s ease'
                }}
              ></div>
            </div>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 'var(--spacing-xl)',
            fontSize: '0.875rem'
          }}>
            <div>
              <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--spacing-s)' }}>Loss</p>
              <p style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '1.125rem' }}>{modelSummary.loss.toFixed(3)}</p>
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--spacing-s)' }}>Validation Loss</p>
              <p style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '1.125rem' }}>{modelSummary.validationLoss.toFixed(3)}</p>
            </div>
          </div>
        </div>

        <div className="calimero-card" style={{ padding: 'var(--spacing-xxl)' }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '700',
            color: 'var(--text-primary)',
            marginBottom: 'var(--spacing-xl)',
            fontFamily: 'Power Grotesk, Arial, Helvetica, sans-serif'
          }}>
            Model Configuration
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-l)' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.875rem',
              paddingBottom: 'var(--spacing-m)',
              borderBottom: '1px solid var(--border-secondary)'
            }}>
              <span style={{ color: 'var(--text-muted)' }}>Architecture</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{modelSummary.architecture}</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.875rem',
              paddingBottom: 'var(--spacing-m)',
              borderBottom: '1px solid var(--border-secondary)'
            }}>
              <span style={{ color: 'var(--text-muted)' }}>Optimizer</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{modelSummary.optimizer}</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.875rem',
              paddingBottom: 'var(--spacing-m)',
              borderBottom: '1px solid var(--border-secondary)'
            }}>
              <span style={{ color: 'var(--text-muted)' }}>Learning Rate</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{modelSummary.learningRate}</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.875rem',
              paddingBottom: 'var(--spacing-m)',
              borderBottom: '1px solid var(--border-secondary)'
            }}>
              <span style={{ color: 'var(--text-muted)' }}>Batch Size</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{modelSummary.batchSize}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ModelSummaryPage({ api }: ModelSummaryPageProps) {
  return (
    <Layout api={api}>
      <ModelSummaryContent api={api} />
    </Layout>
  );
}
