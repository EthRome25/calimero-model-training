import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCalimero } from '@calimero-network/calimero-client';
import { AbiClient } from '../../api/AbiClient';
import Layout from '../../components/Layout';

interface HomePageProps {
  api: AbiClient;
}

export default function HomePage({ api }: HomePageProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useCalimero();
  const [stats, setStats] = useState<any>(null);
  const loadingStatsRef = useRef<boolean>(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const getStats = useCallback(async () => {
    if (loadingStatsRef.current || !api) return;
    loadingStatsRef.current = true;
    try {
      const data = await api.getStats();
      setStats(data);
    } catch (error) {
      console.error('getStats error:', error);
      window.alert(
        error instanceof Error ? error.message : 'Failed to load statistics',
      );
    } finally {
      loadingStatsRef.current = false;
    }
  }, [api]);

  useEffect(() => {
    if (isAuthenticated && api) {
      getStats();
    }
  }, [isAuthenticated, api, getStats]);

  return (
    <Layout api={api}>
      <div className="calimero-hero">
        <div className="calimero-hero-content">
          <h1>Medical AI Training Platform</h1>
          <p>
            Securely train, deploy, and share medical AI models with privacy-preserving peer-to-peer technology. 
            Upload medical scans and ML models while maintaining complete data ownership and HIPAA compliance.
          </p>
          <div style={{ 
            display: 'flex', 
            gap: 'var(--spacing-l)', 
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginTop: 'var(--spacing-xxl)'
          }}>
            <button 
              className="button button-primary"
              onClick={() => navigate('/upload-model')}
            >
              🧠 Upload AI Model
            </button>
            <button 
              className="button button-secondary"
              onClick={() => navigate('/upload-scan')}
            >
              🏥 Upload Medical Scan
            </button>
          </div>
        </div>
      </div>

      {stats && (
        <div className="calimero-container" style={{ paddingTop: 'var(--spacing-xxl)', paddingBottom: 'var(--spacing-xxl)' }}>
          <div className="calimero-card">
            <h2 style={{
              fontSize: '2rem',
              fontWeight: '700',
              textAlign: 'center',
              marginBottom: 'var(--spacing-xl)',
              color: 'var(--text-primary)'
            }}>
              Medical AI Platform Statistics
            </h2>
            <div className="calimero-stats-grid">
              <div className="calimero-stat-card">
                <div className="calimero-stat-number">
                  {stats.total_models || 0}
                </div>
                <div className="calimero-stat-label">🧠 AI Models</div>
              </div>
              <div className="calimero-stat-card">
                <div className="calimero-stat-number">
                  {stats.total_scans || 0}
                </div>
                <div className="calimero-stat-label">🏥 Medical Scans</div>
              </div>
              <div className="calimero-stat-card">
                <div className="calimero-stat-number">
                  {stats.total_annotations || 0}
                </div>
                <div className="calimero-stat-label">📝 Annotations</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
