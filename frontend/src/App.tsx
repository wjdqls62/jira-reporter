import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import Loading from './container/components/UiTools/Loading.tsx';
import Layout from './container/layout/Layout.tsx';
import ReportContents from './container/pages/ReportPage/ReportContents.tsx';
import ReportPage from './container/pages/ReportPage/ReportPage.tsx';
import ErrorPage from './container/components/ErrorPage/ErrorPage.tsx';

function App() {
	const router = createBrowserRouter([
		{
			path: '/',
			element: <Layout />,
			children: [
				{
					path: 'report',
					element: <ReportPage />,
					children: [
						{
							path: ':issueType',
							element: <ReportContents />,
							errorElement: <ErrorPage />,
						},
					],
				},
				{
					path: '/loading',
					element: <Loading />,
				},
			],
		},
	]);
	return <RouterProvider router={router} />;
}

export default App;
