import React, { useState, useEffect } from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import {
  CalimeroProvider,
  AppMode,
  useCalimero,
} from '@calimero-network/calimero-client';
import { ToastProvider } from '@calimero-network/mero-ui';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import HomePage from './pages/home';
import Authenticate from './pages/login/Authenticate';
import ModelsPage from './pages/models';
import ScansPage from './pages/scans';
import UploadModelPage from './pages/upload-model';
import UploadScanPage from './pages/upload-scan';
import PredictingPage from './pages/predicting';
import ZipPredictingPage from './pages/zip-predicting';
import ModelSummaryPage from './pages/model-summary';
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
            // Try to find the specific context from environment variables
            const targetContextId = import.meta.env.VITE_CONTEXT_ID;
            let context = contexts[0]; // fallback to first context

            if (targetContextId) {
              const foundContext = contexts.find(
                (ctx) => ctx.contextId === targetContextId,
              );
              if (foundContext) {
                context = foundContext;
                console.log('Using specific context from env:', context);
              } else {
                console.log(
                  'Target context not found, using first available:',
                  context,
                );
              }
            } else {
              console.log('Using first available context:', context);
            }

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
              className="button button-primary"
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
            <h2 className="text-xl font-semibold mb-2">Loading MediNet...</h2>
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
              <p className="text-sm text-gray-500">Troubleshooting steps:</p>
              <ul className="text-sm text-gray-500 text-left">
                <li>1. Ensure Calimero nodes are running</li>
                <li>2. Check network connectivity</li>
                <li>3. Verify application ID is correct</li>
              </ul>
              <button
                onClick={() => window.location.reload()}
                className="button button-primary"
                style={{ marginTop: 'var(--spacing-l)' }}
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

      {/* Predicting route */}
      <Route
        path="/predicting"
        element={
          <ProtectedRoute>
            <PredictingPage api={api!} />
          </ProtectedRoute>
        }
      />

      {/* ZIP Predicting route */}
      <Route
        path="/zip-predicting"
        element={
          <ProtectedRoute>
            <ZipPredictingPage api={api!} />
          </ProtectedRoute>
        }
      />

      {/* Model Summary route */}
      <Route
        path="/model-summary"
        element={
          <ProtectedRoute>
            <ModelSummaryPage api={api!} />
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
                className="button button-primary"
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

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error) => {
        // Don't retry on rate limit errors
        if (error?.message?.includes('Rate limit exceeded')) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: (failureCount, error) => {
        // Don't retry mutations on rate limit errors
        if (error?.message?.includes('Rate limit exceeded')) {
          return false;
        }
        // Retry up to 2 times for other errors
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // Exponential backoff
    },
  },
});

export default function App() {
  const [clientAppId] = useState<string>(
    import.meta.env.VITE_APPLICATION_ID ||
      'Fm81EMsg45cuf6hRfERBvK1HaJaUC3k5cuw6dHofWz3r', // Application ID from environment or fallback
  );

  return (
    <BrowserRouter basename="/">
      <QueryClientProvider client={queryClient}>
        <CalimeroProvider
          clientApplicationId={clientAppId}
          applicationPath={window.location.pathname || '/'}
          mode={AppMode.MultiContext}
        >
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </CalimeroProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}
