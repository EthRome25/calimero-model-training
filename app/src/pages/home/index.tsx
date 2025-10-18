import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@calimero-network/mero-ui';
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
      <div className="space-y-4">
        <Card variant="rounded" style={{ marginBottom: '2rem' }}>
          <CardHeader>
            <CardTitle>Welcome to Medical AI File Transfer</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <h2
                style={{
                  fontSize: '1.5rem',
                  marginBottom: '1rem',
                  color: '#e5e7eb',
                }}
              >
                Secure P2P Medical Data Sharing
              </h2>
              <p
                style={{
                  color: '#9ca3af',
                  marginBottom: '2rem',
                  lineHeight: '1.6',
                }}
              >
                Upload and share ML models and MRI tumor scan images
                securely on the Calimero network. Your medical data is
                stored locally and shared peer-to-peer with full privacy
                protection.
              </p>
            </div>
          </CardContent>
        </Card>

        {stats && (
          <Card variant="rounded" style={{ width: '100%' }}>
            <CardHeader>
              <CardTitle>Application Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                }}
              >
                <div
                  style={{
                    textAlign: 'center',
                    padding: '1rem',
                    backgroundColor: '#1f2937',
                    borderRadius: '8px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '2rem',
                      fontWeight: 'bold',
                      color: '#3b82f6',
                    }}
                  >
                    {stats.total_models || 0}
                  </div>
                  <div style={{ color: '#9ca3af' }}>ML Models</div>
                </div>
                <div
                  style={{
                    textAlign: 'center',
                    padding: '1rem',
                    backgroundColor: '#1f2937',
                    borderRadius: '8px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '2rem',
                      fontWeight: 'bold',
                      color: '#10b981',
                    }}
                  >
                    {stats.total_scans || 0}
                  </div>
                  <div style={{ color: '#9ca3af' }}>Medical Scans</div>
                </div>
                <div
                  style={{
                    textAlign: 'center',
                    padding: '1rem',
                    backgroundColor: '#1f2937',
                    borderRadius: '8px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '2rem',
                      fontWeight: 'bold',
                      color: '#f59e0b',
                    }}
                  >
                    {stats.total_annotations || 0}
                  </div>
                  <div style={{ color: '#9ca3af' }}>Annotations</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
