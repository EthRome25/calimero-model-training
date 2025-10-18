import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Button,
  Navbar as MeroNavbar,
  NavbarBrand,
  NavbarMenu,
  NavbarItem,
  Menu,
  MenuItem,
  MenuGroup,
  useToast,
  CopyToClipboard,
  Text,
  Badge,
} from '@calimero-network/mero-ui';
import translations from '../constants/en.global.json';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  useCalimero,
  CalimeroConnectButton,
  ConnectionType,
} from '@calimero-network/calimero-client';
import { AbiClient } from '../api/AbiClient';

interface LayoutProps {
  children: React.ReactNode;
  api: AbiClient;
}

export default function Layout({ children, api }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout, app, appUrl } = useCalimero();
  const { show } = useToast();
  const [stats, setStats] = useState<any>(null);
  const [currentContext, setCurrentContext] = useState<{
    applicationId: string;
    contextId: string;
    nodeUrl: string;
  } | null>(null);
  const loadingStatsRef = useRef<boolean>(false);

  // Set current context when API is available
  useEffect(() => {
    if (api && app) {
      const setContext = async () => {
        try {
          const contexts = await app.fetchContexts();
          if (contexts.length > 0) {
            const context = contexts[0];
            setCurrentContext({
              applicationId: context.applicationId,
              contextId: context.contextId,
              nodeUrl: appUrl || 'http://node1.127.0.0.1.nip.io', // Fallback to hardcoded URL
            });
          }
        } catch (error) {
          console.error('Failed to get context:', error);
        }
      };
      setContext();
    }
  }, [api, app, appUrl]);

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

  const doLogout = useCallback(() => {
    logout();
    navigate('/');
  }, [logout, navigate]);

  // Get current route to determine which tab is active
  const getCurrentRoute = () => {
    const path = location.pathname;
    if (path === '/models') return 'models';
    if (path === '/scans') return 'scans';
    if (path === '/upload-model') return 'upload-model';
    if (path === '/upload-scan') return 'upload-scan';
    return 'home';
  };

  const currentRoute = getCurrentRoute();

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
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Medical AI File Transfer</h1>
            {stats && (
              <Badge variant="outline" className="text-sm">
                {stats}
              </Badge>
            )}
          </div>

          <div className="w-full">
            {/* Navigation */}
            <div className="flex flex-wrap gap-2 mb-6">
              <Button
                onClick={() => navigate('/home')}
                variant={currentRoute === 'home' ? 'primary' : 'secondary'}
              >
                Home
              </Button>
              <Button
                onClick={() => navigate('/models')}
                variant={currentRoute === 'models' ? 'primary' : 'secondary'}
              >
                ML Models
              </Button>
              <Button
                onClick={() => navigate('/scans')}
                variant={currentRoute === 'scans' ? 'primary' : 'secondary'}
              >
                Medical Scans
              </Button>
              <Button
                onClick={() => navigate('/upload-model')}
                variant={currentRoute === 'upload-model' ? 'primary' : 'secondary'}
              >
                Upload Model
              </Button>
              <Button
                onClick={() => navigate('/upload-scan')}
                variant={currentRoute === 'upload-scan' ? 'primary' : 'secondary'}
              >
                Upload Scan
              </Button>
            </div>

            {/* Content */}
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
