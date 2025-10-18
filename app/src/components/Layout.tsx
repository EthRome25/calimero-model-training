import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Navbar as MeroNavbar,
  NavbarBrand,
  NavbarItem,
  CopyToClipboard,
  Text,
  useToast,
  NavbarMenu,
} from '@calimero-network/mero-ui';
import translations from '../constants/en.global.json';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CalimeroConnectButton,
  ConnectionType,
  useCalimero,
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
    return {};
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
    if (path === '/model-summary') return 'model-summary';
    return 'home';
  };

  const currentRoute = getCurrentRoute();

  return (
    <>
      <MeroNavbar variant="elevated" size="md" className="calimero-navbar">
        <NavbarBrand
          text="Medical AI File Transfer"
          className="calimero-navbar-brand"
        />
        <NavbarMenu align="center" className="calimero-navbar-menu">
          {currentContext && (
            <div
              style={{
                display: 'flex',
                gap: '1.5rem',
                alignItems: 'center',
                fontSize: '0.875rem',
                color: 'var(--text-muted)',
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
                  style={{
                    fontFamily: 'monospace',
                    color: 'var(--text-secondary)',
                  }}
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
                  style={{
                    fontFamily: 'monospace',
                    color: 'var(--text-secondary)',
                  }}
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
                  style={{
                    fontFamily: 'monospace',
                    color: 'var(--text-secondary)',
                  }}
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
            <button
              className="button button-secondary"
              onClick={doLogout}
              style={{ fontSize: '0.875rem' }}
            >
              {translations.home.logout}
            </button>
          ) : (
            <NavbarItem>
              <div
                className="calimero-connect-button"
                style={{
                  position: 'relative',
                  display: 'inline-block',
                }}
              >
                <CalimeroConnectButton
                  connectionType={{
                    type: ConnectionType.Custom,
                    url: 'http://node1.127.0.0.1.nip.io',
                  }}
                />
              </div>
            </NavbarItem>
          )}
        </NavbarMenu>
      </MeroNavbar>
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: 'var(--background-primary)',
          color: 'var(--text-primary)',
          position: 'relative',
        }}
      >
        {/* Grid Lines */}
        <div className="grid-line">
          <div className="grid-line__item"></div>
          <div className="grid-line__item"></div>
          <div className="grid-line__item"></div>
          <div className="grid-line__item"></div>
          <div className="grid-line__item"></div>
          <div className="grid-line__item"></div>
          <div className="grid-line__item"></div>
          <div className="grid-line__item"></div>
          <div className="grid-line__item"></div>
          <div className="grid-line__item"></div>
          <div className="grid-line__item"></div>
          <div className="grid-line__item"></div>
        </div>

        <div
          className="calimero-container"
          style={{
            paddingTop: 'var(--spacing-xl)',
            paddingBottom: 'var(--spacing-xl)',
          }}
        >
          <div style={{ marginBottom: 'var(--spacing-xl)' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 'var(--spacing-l)',
              }}
            >
              <h1
                style={{
                  fontSize: '2rem',
                  fontWeight: '700',
                  color: 'var(--text-primary)',
                  margin: 0,
                  background:
                    'linear-gradient(135deg, var(--text-primary) 0%, var(--surface-action-default) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Medical AI File Transfer
              </h1>
              {stats && (
                <Badge
                  variant="outline"
                  style={{
                    color: 'var(--surface-action-default)',
                    borderColor: 'var(--border-brand)',
                    backgroundColor: 'transparent',
                  }}
                >
                  {stats}
                </Badge>
              )}
            </div>

            {/* Navigation */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 'var(--spacing-s)',
                marginBottom: 'var(--spacing-xl)',
              }}
            >
              <button
                onClick={() => navigate('/home')}
                className={`button ${currentRoute === 'home' ? 'button-primary' : 'button-secondary'}`}
              >
                Home
              </button>
              <button
                onClick={() => navigate('/upload-scan')}
                className={`button ${currentRoute === 'upload-scan' ? 'button-primary' : 'button-secondary'}`}
              >
                Upload Scan
              </button>
              <button
                onClick={() => navigate('/model-summary')}
                className={`button ${currentRoute === 'model-summary' ? 'button-primary' : 'button-secondary'}`}
              >
                Model Summary
              </button>
            </div>

            {/* Content */}
            <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
          </div>
        </div>
      </div>
    </>
  );
}
