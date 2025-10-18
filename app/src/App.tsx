import React, { useState, useEffect } from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import {
  CalimeroProvider,
  AppMode,
  useCalimero,
} from '@calimero-network/calimero-client';
import { ToastProvider } from '@calimero-network/mero-ui';

import HomePage from './pages/home';
import Authenticate from './pages/login/Authenticate';
import ModelsPage from './pages/models';
import ScansPage from './pages/scans';
import UploadModelPage from './pages/upload-model';
import UploadScanPage from './pages/upload-scan';
import { AbiClient } from './api/AbiClient';

function AppContent() {
  const { app, isAuthenticated } = useCalimero();
  const [api, setApi] = useState<AbiClient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Set a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (loading) {
        setError(
          'Connection timeout. The Calimero network may not be accessible.',
        );
        setLoading(false);
      }
    }, 10000); // 10 second timeout

    // Check if user is authenticated first
    if (!isAuthenticated) {
      console.log('User not authenticated, redirecting to auth page');
      setLoading(false);
      return () => clearTimeout(timeout);
    }

    if (app && isAuthenticated) {
      const initializeApi = async () => {
        try {
          console.log('Fetching contexts...');
          const contexts = await app.fetchContexts();
          console.log('Contexts found:', contexts);

          if (contexts.length > 0) {
            const context = contexts[0];
            console.log('Using context:', context);
            const abiClient = new AbiClient(app, context);
            setApi(abiClient);
            setLoading(false);
            clearTimeout(timeout);
          } else {
            console.log('No contexts found');
            setError(
              'No contexts available. Please ensure the Calimero network is properly set up.',
            );
            setLoading(false);
            clearTimeout(timeout);
          }
        } catch (error) {
          console.error('Error initializing API:', error);
          setError(`Failed to connect to Calimero network: ${error}`);
          setLoading(false);
          clearTimeout(timeout);
        }
      };
      initializeApi();
    } else if (!app) {
      console.log('App not available yet...');
      // If app is not available after 5 seconds, show error
      setTimeout(() => {
        if (!app) {
          setError(
            'Calimero client failed to initialize. Please check your network connection.',
          );
          setLoading(false);
        }
      }, 5000);
    }

    return () => clearTimeout(timeout);
  }, [app, isAuthenticated, loading]);

  // Helper component to render protected routes
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!isAuthenticated) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">
              Authentication Required
            </h2>
            <p className="text-gray-600 mb-4">
              Please authenticate first to access this page.
            </p>
            <button
              onClick={() => (window.location.href = '/')}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Go to Login
            </button>
          </div>
        </div>
      );
    }

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">
              Loading Medical AI File Transfer...
            </h2>
            <p className="text-gray-600">Connecting to Calimero network</p>
            <div className="mt-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md">
            <h2 className="text-xl font-semibold mb-2 text-red-600">
              Connection Error
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">
                Troubleshooting steps:
              </p>
              <ul className="text-sm text-gray-500 text-left">
                <li>1. Ensure Calimero nodes are running</li>
                <li>2. Check network connectivity</li>
                <li>3. Verify application ID is correct</li>
              </ul>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Retry Connection
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (!api) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Initializing...</h2>
            <p className="text-gray-600">Setting up the application</p>
          </div>
        </div>
      );
    }

    return <>{children}</>;
  };

  return (
    <Routes>
      {/* Authentication route */}
      <Route
        path="/"
        element={!isAuthenticated ? <Authenticate /> : <HomePage api={api!} />}
      />

      {/* Home route */}
      <Route 
        path="/home" 
        element={
          <ProtectedRoute>
            <HomePage api={api!} />
          </ProtectedRoute>
        } 
      />

      {/* Models route */}
      <Route 
        path="/models" 
        element={
          <ProtectedRoute>
            <ModelsPage api={api!} />
          </ProtectedRoute>
        } 
      />

      {/* Scans route */}
      <Route 
        path="/scans" 
        element={
          <ProtectedRoute>
            <ScansPage api={api!} />
          </ProtectedRoute>
        } 
      />

      {/* Upload Model route */}
      <Route 
        path="/upload-model" 
        element={
          <ProtectedRoute>
            <UploadModelPage api={api!} />
          </ProtectedRoute>
        } 
      />

      {/* Upload Scan route */}
      <Route 
        path="/upload-scan" 
        element={
          <ProtectedRoute>
            <UploadScanPage api={api!} />
          </ProtectedRoute>
        } 
      />

      {/* 404 route */}
      <Route
        path="*"
        element={
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Page Not Found</h2>
              <p className="text-gray-600 mb-4">
                The requested page could not be found.
              </p>
              <button
                onClick={() => (window.location.href = '/')}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Go Home
              </button>
            </div>
          </div>
        }
      />
    </Routes>
  );
}

export default function App() {
  const [clientAppId] = useState<string>(
    'HELDXwknx9tVnj3JKfa3EMyGB9JEsApeijVHzKn5cRVX', // Application ID from bootstrap
  );

  return (
    <BrowserRouter basename="/">
      <CalimeroProvider
        clientApplicationId={clientAppId}
        applicationPath={window.location.pathname || '/'}
        mode={AppMode.MultiContext}
      >
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </CalimeroProvider>
    </BrowserRouter>
  );
}
