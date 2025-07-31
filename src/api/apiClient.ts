import axios, { type AxiosRequestConfig } from 'axios';

const instance = axios.create({
	baseURL: 'https://jsdev.atlassian.net/rest/api/3/',
});

instance.interceptors.request.use(
	(config) => {
		const authToken = 'TEST_TOKEN';
		config.headers.Authorization = `Bearer ${authToken}`;
		return config;
	},
	(error) => {
		return Promise.reject(error);
	},
);

export const requestApi = async <T>(
	method: string,
	url: string,
	data?: any,
	config?: AxiosRequestConfig,
): Promise<T> => {
	const axiosConfig: AxiosRequestConfig = {
		method,
		url,
		...config,
	};

	try {
		const response = await instance.request(axiosConfig);
		return response.data;
	} catch (error) {
		if (error instanceof Error) {
			throw error;
		}
		throw new Error(`오류가 발생했습니다.`);
	}
};
