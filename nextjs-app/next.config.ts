import type { NextConfig } from 'next';

const now = new Date();
const kstOffset = 9 * 60 * 60 * 1000;
const kstDate = new Date(now.getTime() + kstOffset);
const buildVersion = `v${kstDate.getUTCFullYear()}${String(kstDate.getUTCMonth() + 1).padStart(2, '0')}${String(kstDate.getUTCDate()).padStart(2, '0')}`;

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
