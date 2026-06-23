import type { NextConfig } from 'next';

const buildDate = new Date();
const buildVersion = `v${buildDate.getFullYear()}${String(buildDate.getMonth() + 1).padStart(2, '0')}${String(buildDate.getDate()).padStart(2, '0')}`;

const nextConfig: NextConfig = {
	reactCompiler: true,
	output: 'standalone',
	typescript: {
		ignoreBuildErrors: true,
	},
	env: {
		NEXT_PUBLIC_BUILD_VERSION: buildVersion,
	},
};

export default nextConfig;
