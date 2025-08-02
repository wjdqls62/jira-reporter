import { useState } from 'react';

import styles from './ReportPage.module.scss';
import { baseUrl, requestApi } from '../../../api/apiClient';
import { SWR_KEYS } from '../../../api/swrKeys.ts';
import axios from 'axios';

interface Props {
	onSubmitToken: (token: string) => void;
}

export default function AccessTokenInput({ onSubmitToken }: Props) {
	const [inputValue, setInputValue] = useState<{
		email: string;
		accessToken: string;
	}>({
		email: '',
		accessToken: '',
	});


	const handleInputChange = (type: 'email' | 'accessToken', value: string) => {
		setInputValue((prev) => {
			return {
				...prev,
				[type]: value
			}
		});
	};

	const submitToken = async () => {
		await axios.get(`${baseUrl}${SWR_KEYS.validateToken}`, {
			auth: {
				username: inputValue.email,
				password: inputValue.accessToken
			}
		}).then((res) => {
			if(res.data.emailAddress === inputValue.email) {
				alert('Success');
				localStorage.setItem('email', inputValue.email);
				localStorage.setItem('jiraToken', inputValue.accessToken);
				onSubmitToken(inputValue.accessToken);
			}
		}).catch((error) => {
			alert(error.response.data);
		});
	};

	return (
		<div className={styles.tokenLayout}>
			<h2>JIRA Token 입력</h2>
			<div className={styles.inputContainer}>
				<input
					type='email'
					placeholder='Input Email'
					onChange={(e) => handleInputChange('email', e.target.value)}
				/>
				<input
					type='password'
					placeholder='Input Access Token'
					onChange={(e) => handleInputChange('accessToken',e.target.value)}
				/>
				<button onClick={submitToken}>Submit</button>
			</div>
		</div>
	);
}
