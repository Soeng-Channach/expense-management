import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Dashboard } from '@/pages/Dashboard';
import { Transactions } from '@/pages/Transactions';
import { Budget } from '@/pages/Budget';
import { Reports } from '@/pages/Reports';
import { Categories } from '@/pages/Categories';
import { Settings } from '@/pages/Settings';
import { NotFound } from '@/pages/NotFound';
import { ThemeProvider } from '@/context/ThemeContext';
import { ToastProvider } from '@/context/ToastContext';
import { TransactionModalProvider } from '@/context/TransactionModalContext';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'transactions', element: <Transactions /> },
      { path: 'budget', element: <Budget /> },
      { path: 'reports', element: <Reports /> },
      { path: 'categories', element: <Categories /> },
      { path: 'settings', element: <Settings /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

export default function App() {
  return (
    <ToastProvider>
      <ThemeProvider>
        <TransactionModalProvider>
          <RouterProvider router={router} />
        </TransactionModalProvider>
      </ThemeProvider>
    </ToastProvider>
  );
}
