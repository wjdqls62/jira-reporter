import { StrictMode } from 'react';
import { SnackbarProvider } from 'notistack';
import { createRoot } from 'react-dom/client';

import './index.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<SnackbarProvider>
			<App />
		</SnackbarProvider>
	</StrictMode>,
);
