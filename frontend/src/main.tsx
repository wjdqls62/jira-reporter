import { StrictMode } from 'react';
import { SnackbarProvider } from 'notistack';
import { createRoot } from 'react-dom/client';

import './index.css';
import { ErrorBoundary } from 'react-error-boundary';

import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<SnackbarProvider>
			<ErrorBoundary fallback={<>Error</>}>
				<App />
			</ErrorBoundary>
		</SnackbarProvider>
	</StrictMode>,
);
