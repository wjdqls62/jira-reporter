import axios, { type AxiosRequestConfig } from 'axios';

export const baseUrl = '/rest';

const instance = axios.create({
	baseURL: baseUrl,
});

instance.interceptors.request.use(
	(config) => {
		config.auth = config.auth || {
			username: '',
			password: '',
		};
		config.auth.username = localStorage.getItem('email') || '';
		config.auth.password = localStorage.getItem('jiraToken') || '';
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
		data,
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
