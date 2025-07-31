import { useState } from 'react';

import styles from './ReportPage.module.scss';
import axios, { requestApi } from '../../../api/apiClient';

interface Props {
	onSubmitToken: (token: string) => void;
}

export default function AccessTokenInput({ onSubmitToken }: Props) {
	const [inputToken, setInputToken] = useState('');

	const handleInputChange = (value: string) => {
		setInputToken(value);
	};

	const submitToken = async () => {
		await requestApi('GET', 'test/')
			.then((res) => {
				console.log(`res`);
			})
			.catch((err) => {
				console.log(err);
			});
	};

	return (
		<div className={styles.tokenLayout}>
			<h2>JIRA Token 입력</h2>
			<div>
				<input
					type='password'
					placeholder='Input Access Token'
					onChange={(e) => handleInputChange(e.target.value)}
				/>
				<button onClick={submitToken}>Submit</button>
			</div>
		</div>
	);
}
