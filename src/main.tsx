import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { seedDatabase } from './services/seed';
import { useAuthStore } from './stores/authStore';
import { initializeRepositories } from './domain/repositories/factory';

// Initialize repositories (local or Google Sheets based on config)
initializeRepositories();

// Seed database on first load
seedDatabase().catch(console.error);

// Load user on app start
useAuthStore.getState().loadUser();

// Get base path from import.meta.env.BASE_URL (set by Vite based on base config)
// Remove trailing slash for React Router basename (except for root path)
const basePath = import.meta.env.BASE_URL === '/' ? '/' : import.meta.env.BASE_URL.replace(/\/$/, '');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename={basePath}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

