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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

