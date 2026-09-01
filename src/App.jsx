import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AppRoutes from './admin-dashboard/routes/AppRoutes';
import GlobalErrorBoundary from './shared/components/ui/GlobalErrorBoundary';

export default function App() {
  return (
    <GlobalErrorBoundary>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Toaster position="top-right" />
        <AppRoutes />
      </BrowserRouter>
    </GlobalErrorBoundary>
  );
}
