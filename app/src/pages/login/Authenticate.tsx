import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Navbar as MeroNavbar,
  NavbarBrand,
  NavbarMenu,
  NavbarItem,
} from '@calimero-network/mero-ui';
import {
  useCalimero,
  CalimeroConnectButton,
  ConnectionType,
} from '@calimero-network/calimero-client';
import translations from '../../constants/en.global.json';
import { CALIMERO_NODE_URL } from '../../constants/api';

export default function Authenticate() {
  const navigate = useNavigate();
  const { isAuthenticated } = useCalimero();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home');
    }
  }, [isAuthenticated, navigate]);

  return (
    <>
      <MeroNavbar variant="elevated" size="md" className="calimero-navbar">
        <NavbarBrand text="Medical AI Training Platform" className="calimero-navbar-brand" />
        <NavbarMenu align="right">
          <NavbarItem>
            <CalimeroConnectButton
              connectionType={{
                type: ConnectionType.Custom,
                url: CALIMERO_NODE_URL,
              }}
            />
          </NavbarItem>
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

        <div className="calimero-hero">
          <div className="calimero-hero-content">
            <h1>Medical AI Training Platform</h1>
            <p>
              Connect to the Calimero network to access secure, privacy-preserving medical AI training. 
              Train, deploy, and share medical AI models while maintaining complete data ownership and HIPAA compliance.
            </p>
            
            <div className="calimero-card" style={{ 
              marginTop: 'var(--spacing-xxl)',
              maxWidth: '600px',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}>
              <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: 'var(--text-primary)',
                  marginBottom: 'var(--spacing-l)'
                }}>
                  {translations.auth.description.subtitle}
                </h2>
                <p style={{
                  color: 'var(--text-muted)',
                  lineHeight: '1.6',
                  marginBottom: 'var(--spacing-l)'
                }}>
                  {translations.home.demoDescription}
                </p>
              </div>

              <div style={{ 
                display: 'flex', 
                justifyContent: 'center',
                marginBottom: 'var(--spacing-xl)'
              }}>
                <div className="calimero-connect-button">
                  <CalimeroConnectButton
                    connectionType={{
                      type: ConnectionType.Custom,
                      url: CALIMERO_NODE_URL,
                    }}
                  />
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 'var(--spacing-s)',
                marginBottom: 'var(--spacing-xl)'
              }}>
                {translations.auth.description.features.map((feature, index) => (
                  <div
                    key={index}
                    style={{
                      background: 'var(--background-tertiary)',
                      border: '1px solid var(--border-secondary)',
                      borderRadius: '6px',
                      padding: 'var(--spacing-s)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--spacing-s)',
                    }}
                  >
                    <div
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: 'var(--surface-action-default)',
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        color: 'var(--text-secondary)',
                        fontSize: '0.875rem',
                        lineHeight: '1.4',
                        fontWeight: '500',
                      }}
                    >
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 'var(--spacing-s)',
                  flexWrap: 'wrap',
                  padding: 'var(--spacing-l)',
                  background: 'var(--background-tertiary)',
                  borderRadius: '8px',
                  border: '1px solid var(--border-secondary)',
                }}
              >
                <button
                  className="button button-secondary"
                  onClick={() =>
                    window.open(
                      'https://docs.calimero.network',
                      '_blank',
                      'noopener,noreferrer',
                    )
                  }
                >
                  📚 {translations.home.documentation}
                </button>
                <button
                  className="button button-secondary"
                  onClick={() =>
                    window.open(
                      'https://github.com/calimero-network',
                      '_blank',
                      'noopener,noreferrer',
                    )
                  }
                >
                  🐙 {translations.home.github}
                </button>
                <button
                  className="button button-secondary"
                  onClick={() =>
                    window.open(
                      'https://calimero.network',
                      '_blank',
                      'noopener,noreferrer',
                    )
                  }
                >
                  🌐 {translations.home.website}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
