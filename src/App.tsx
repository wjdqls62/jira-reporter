import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';

import Layout from './container/layout/Layout.tsx';
import ReportPage from './container/pages/ReportPage/ReportPage.tsx';

function App() {

  const router = createBrowserRouter([
    {
      path: '/',
      element: <Layout />,
      children: [
        {
          path: 'report',
          element: <ReportPage />
        }
      ]
    }
  ])
  return <RouterProvider router={router} />
}

export default App
