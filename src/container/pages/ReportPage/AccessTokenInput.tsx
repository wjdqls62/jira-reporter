import { useState } from 'react';
import axios from 'axios';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';

import styles from './ReportPage.module.scss';
import { baseUrl } from '../../../api/apiClient';
import { SWR_KEYS } from '../../../api/swrKeys.ts';
import { commonValidate } from '../../../validation/commonValidate.ts';
import { HelperText } from '../../components/UiTools/UiTools.tsx';

interface Props {
	onSubmitToken: (
		token: string,
		issueKey: string,
		issueType: 'epic' | 'issues',
	) => void;
}

type FormValues = {
	email: string;
	accessToken: string;
	issueKey: string;
	issueType: 'epic' | 'issues';
};

const defaultValues = {
	email: localStorage.getItem('email') || '',
	accessToken: localStorage.getItem('jiraToken') || '',
	issueKey: '',
	issueType: 'epic',
};

export default function AccessTokenInput({ onSubmitToken }: Props) {
	/*const [inputValue, setInputValue] = useState<{
		email: string;
		accessToken: string;
		issueKey: string;
	}>({
		email: localStorage.getItem('email') || '',
		accessToken: localStorage.getItem('jiraToken') || '',
		issueKey: '',
	});*/
	const [issueType, setIssueType] = useState<'epic' | 'issues'>('epic');
	const methods = useForm<FormValues>({
		defaultValues: defaultValues,
	});
	const { control, handleSubmit } = methods;
	const { email, accessToken, issueKey } = useWatch({
		control: control,
	});

	/*const handleInputChange = (
		type: 'email' | 'accessToken' | 'issueKey',
		value: string,
	) => {
		setInputValue((prev) => {
			return {
				...prev,
				[type]: value,
			};
		});
	};*/

	const handleIssueTypeChange = (value: 'epic' | 'issues') => {
		setIssueType(value);
	};

	const onSubmit = async (data: FormValues) => {
		console.log(`data`, data);
		await axios
			.get(`${baseUrl}${SWR_KEYS.validateToken}`, {
				auth: {
					username: data.email,
					password: data.accessToken,
				},
			})
			.then((res) => {
				if (res.data.emailAddress === email) {
					alert('Success');
					localStorage.setItem('email', data.email);
					localStorage.setItem('jiraToken', data.accessToken);
					onSubmitToken(data.accessToken, data.issueKey, issueType);
				}
			})
			.catch((error) => {
				alert(error.response.data);
			});
	};

	/*const submitToken = async () => {
		await axios
			.get(`${baseUrl}${SWR_KEYS.validateToken}`, {
				auth: {
					username: email,
					password: accessToken,
				},
			})
			.then((res) => {
				if (res.data.emailAddress === email) {
					alert('Success');
					localStorage.setItem('email', email);
					localStorage.setItem('jiraToken', accessToken);
					onSubmitToken(accessToken, issueKey, issueType);
				}
			})
			.catch((error) => {
				alert(error.response.data);
			});
	};*/

	return (
		<FormProvider {...methods}>
			<form onSubmit={handleSubmit(onSubmit)}>
				<div className={styles.tokenLayout}>
					<h2>JIRA Token 입력</h2>
					<div className={styles.inputContainer}>
						<div className={styles.labelWithField}>
							<Controller
								render={({ field }) => (
									<>
										<span className={styles.labelText}>이메일</span>
										<input
											{...field}
											id='email'
											type='email'
											placeholder='Enter Email'
											defaultValue={email || ''}
											onChange={(e) => field.onChange(e.target.value)}
										/>
										<HelperText name={'email'} />
									</>
								)}
								name={'email'}
								control={control}
								rules={commonValidate({
									required: true,
									email: true,
								})}
							/>
						</div>
						<div className={styles.labelWithField}>
							<Controller
								render={({ field }) => (
									<>
										<span className={styles.labelText}>토큰</span>
										<input
											{...field}
											id='accessToken'
											type='password'
											placeholder='Enter Access Token'
											defaultValue={accessToken || ''}
											onChange={(e) => field.onChange(e.target.value)}
										/>
										<HelperText name={'accessToken'} />
									</>
								)}
								name={'accessToken'}
								control={control}
								rules={commonValidate({
									required: true,
								})}
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
							<Controller
								render={({ field }) => (
									<>
										<textarea
											{...field}
											id='issueKey'
											placeholder='Enter Issue-Key'
											onChange={(e) => field.onChange(e.target.value)}
										/>
										<HelperText name={'issueKey'} />
									</>
								)}
								name={'issueKey'}
								control={control}
								rules={commonValidate({
									required: true,
								})}
							/>
						</div>
						<button type={'submit'}>Submit</button>
					</div>
				</div>
			</form>
		</FormProvider>
	);
}
