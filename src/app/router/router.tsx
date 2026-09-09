import { Navigate, createBrowserRouter } from 'react-router';

import { NotFoundPage } from '@/app/pages/NotFoundPage';
import { OverviewPage } from '@/app/pages/OverviewPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/overview" replace />,
  },
  {
    path: '/overview',
    element: <OverviewPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
