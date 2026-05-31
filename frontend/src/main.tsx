
  // Frontend entry: mounts the React app and wraps it with Auth context.
  // Keep this file minimal so the app tree is easy to bootstrap in tests.
  import { createRoot } from 'react-dom/client';
  import App from './app/App.tsx';
  import { AuthProvider } from './app/context/AuthContext';
  import './styles/index.css';

  createRoot(document.getElementById('root')!).render(
    <AuthProvider>
      <App />
    </AuthProvider>
  );
  