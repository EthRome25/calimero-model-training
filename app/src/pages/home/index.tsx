import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Button,
  Navbar as MeroNavbar,
  NavbarBrand,
  NavbarMenu,
  NavbarItem,
  Grid,
  GridItem,
  Menu,
  MenuItem,
  MenuGroup,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  useToast,
  CopyToClipboard,
  Text,
} from '@calimero-network/mero-ui';
import translations from '../../constants/en.global.json';
import { useNavigate } from 'react-router-dom';
import {
  useCalimero,
  CalimeroConnectButton,
  ConnectionType,
} from '@calimero-network/calimero-client';
import { AbiClient } from '../../api/AbiClient';

export default function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated, logout, app, appUrl } = useCalimero();
  const { show } = useToast();
  const [stats, setStats] = useState<any>(null);
  const [api, setApi] = useState<AbiClient | null>(null);
  const [currentContext, setCurrentContext] = useState<{
    applicationId: string;
    contextId: string;
    nodeUrl: string;
  } | null>(null);
  const loadingStatsRef = useRef<boolean>(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Create API client when app is available
  useEffect(() => {
    if (!app) return;

    const initializeApi = async () => {
      try {
        const contexts = await app.fetchContexts();
        if (contexts.length > 0) {
          const context = contexts[0];
          const client = new AbiClient(app, context);
          setApi(client);

          setCurrentContext({
            applicationId: context.applicationId,
            contextId: context.contextId,
            nodeUrl: appUrl || 'http://node1.127.0.0.1.nip.io', // Fallback to hardcoded URL
          });
        }
      } catch (error) {
        console.error('Failed to create API client:', error);
        window.alert('Failed to initialize API client');
      }
    };

    initializeApi();
  }, [app, appUrl]);

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

  const goToDashboard = useCallback(() => {
    navigate('/dashboard');
  }, [navigate]);

  useEffect(() => {
    if (isAuthenticated && api) {
      getStats();
    }
  }, [isAuthenticated, api, getStats]);

  // Websocket event subscription removed; rely on manual refresh after mutations

  const doLogout = useCallback(() => {
    logout();
    navigate('/');
  }, [logout, navigate]);

  return (
    <>
      <MeroNavbar variant="elevated" size="md">
        <NavbarBrand text="Medical AI File Transfer" />
        <NavbarMenu align="center">
          {currentContext && (
            <div
              style={{
                display: 'flex',
                gap: '1.5rem',
                alignItems: 'center',
                fontSize: '0.875rem',
                color: '#9ca3af',
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}
            >
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Text size="sm" color="muted">
                  Node:
                </Text>
                <Text
                  size="sm"
                  style={{ fontFamily: 'monospace', color: '#e5e7eb' }}
                >
                  {currentContext.nodeUrl
                    .replace('http://', '')
                    .replace('https://', '')}
                </Text>
                <CopyToClipboard
                  text={currentContext.nodeUrl}
                  variant="icon"
                  size="small"
                  successMessage="Node URL copied!"
                />
              </div>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Text size="sm" color="muted">
                  App ID:
                </Text>
                <Text
                  size="sm"
                  style={{ fontFamily: 'monospace', color: '#e5e7eb' }}
                >
                  {currentContext.applicationId.slice(0, 8)}...
                  {currentContext.applicationId.slice(-8)}
                </Text>
                <CopyToClipboard
                  text={currentContext.applicationId}
                  variant="icon"
                  size="small"
                  successMessage="Application ID copied!"
                />
              </div>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Text size="sm" color="muted">
                  Context ID:
                </Text>
                <Text
                  size="sm"
                  style={{ fontFamily: 'monospace', color: '#e5e7eb' }}
                >
                  {currentContext.contextId.slice(0, 8)}...
                  {currentContext.contextId.slice(-8)}
                </Text>
                <CopyToClipboard
                  text={currentContext.contextId}
                  variant="icon"
                  size="small"
                  successMessage="Context ID copied!"
                />
              </div>
            </div>
          )}
        </NavbarMenu>
        <NavbarMenu align="right">
          {isAuthenticated ? (
            <Menu variant="compact" size="md">
              <MenuGroup>
                <MenuItem onClick={doLogout}>
                  {translations.home.logout}
                </MenuItem>
              </MenuGroup>
            </Menu>
          ) : (
            <NavbarItem>
              <CalimeroConnectButton
                connectionType={{
                  type: ConnectionType.Custom,
                  url: 'http://node1.127.0.0.1.nip.io',
                }}
              />
            </NavbarItem>
          )}
        </NavbarMenu>
      </MeroNavbar>
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#111111',
          color: 'white',
        }}
      >
        <Grid
          columns={1}
          gap={32}
          maxWidth="100%"
          justify="center"
          align="center"
          style={{
            minHeight: '100vh',
            padding: '2rem',
          }}
        >
          <GridItem>
            <main
              style={{
                width: '100%',
                maxWidth: '1200px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div style={{ maxWidth: '800px', width: '100%' }}>
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
                      <Button
                        variant="primary"
                        onClick={goToDashboard}
                        style={{
                          minHeight: '3rem',
                          padding: '0 2rem',
                          fontSize: '1.1rem',
                        }}
                      >
                        Go to Dashboard
                      </Button>
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
            </main>
          </GridItem>
        </Grid>
      </div>
    </>
  );
}
