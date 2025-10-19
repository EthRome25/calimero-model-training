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
        <NavbarBrand text="MediNet — Privacy-First Federated Learning for Medical Imaging" className="calimero-navbar-brand" />
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
            <h1>MediNet</h1>
            

            <div className="calimero-card" style={{
              marginTop: 'var(--spacing-xxl)',
              maxWidth: '600px',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}>
              <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
           

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
                      'https://github.com/EthRome25',
                      '_blank',
                      'noopener,noreferrer',
                    )
                  }
                >
                  🐙 {translations.home.github}
                </button>
                
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
