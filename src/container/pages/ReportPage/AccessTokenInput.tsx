import { useState } from 'react';
import axios from 'axios';

import styles from './ReportPage.module.scss';
import { baseUrl, requestApi } from '../../../api/apiClient';
import { SWR_KEYS } from '../../../api/swrKeys.ts';

interface Props {
	onSubmitToken: (
		token: string,
		issueKey: string,
		issueType: 'epic' | 'issues',
	) => void;
}

export default function AccessTokenInput({ onSubmitToken }: Props) {
	const [inputValue, setInputValue] = useState<{
		email: string;
		accessToken: string;
		issueKey: string;
	}>({
		email: localStorage.getItem('email') || '',
		accessToken: localStorage.getItem('jiraToken') || '',
		issueKey: '',
	});
	const [issueType, setIssueType] = useState<'epic' | 'issues'>('epic');

	const handleInputChange = (
		type: 'email' | 'accessToken' | 'issueKey',
		value: string,
	) => {
		setInputValue((prev) => {
			return {
				...prev,
				[type]: value,
			};
		});
	};

	const handleIssueTypeChange = (value: 'epic' | 'issues') => {
		setIssueType(value);
	};

	const submitToken = async () => {
		await axios
			.get(`${baseUrl}${SWR_KEYS.validateToken}`, {
				auth: {
					username: inputValue.email,
					password: inputValue.accessToken,
				},
			})
			.then((res) => {
				if (res.data.emailAddress === inputValue.email) {
					alert('Success');
					localStorage.setItem('email', inputValue.email);
					localStorage.setItem('jiraToken', inputValue.accessToken);
					onSubmitToken(inputValue.accessToken, inputValue.issueKey, issueType);
				}
			})
			.catch((error) => {
				alert(error.response.data);
			});
	};

	return (
		<div className={styles.tokenLayout}>
			<h2>JIRA Token 입력</h2>
			<div className={styles.inputContainer}>
				<div className={styles.labelWithField}>
					<span className={styles.labelText}>이메일</span>
					<input
						id='email'
						type='email'
						placeholder='Enter Email'
						defaultValue={inputValue.email || ''}
						onChange={(e) => handleInputChange('email', e.target.value)}
					/>
				</div>
				<div className={styles.labelWithField}>
					<span className={styles.labelText}>토큰</span>
					<input
						id='accessToken'
						type='password'
						placeholder='Enter Access Token'
						defaultValue={inputValue.accessToken || ''}
						onChange={(e) => handleInputChange('accessToken', e.target.value)}
					/>
				</div>
				<div className={styles.labelWithField}>
					<span className={styles.labelText}>이슈 종류</span>
					<select
						onChange={(e) =>
							handleIssueTypeChange(e.target.value as 'epic' | 'issues')
						}>
						<option value='epic'>큰틀(Epic)</option>
						<option value={'issues'}>이슈</option>
					</select>
				</div>
				<div>
					<textarea
						id='issueKey'
						placeholder='Enter Issue-Key'
						onChange={(e) => handleInputChange('issueKey', e.target.value)}
					/>
				</div>
				<button onClick={submitToken}>Submit</button>
			</div>
		</div>
	);
}
