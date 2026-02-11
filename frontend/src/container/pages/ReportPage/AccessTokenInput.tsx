import { useState } from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';

import styles from './ReportPage.module.scss';
import { commonValidate } from '../../../validation/commonValidate.ts';
import { useAuth } from '../../hooks/useAuth';
import RadioButton, {
	type LabelWithValue,
} from '../../components/UiTools/RadioButton/RadioButton.tsx';
import TextField from '../../components/UiTools/TextField/TextField.tsx';
import { HelperText } from '../../components/UiTools/UiTools.tsx';

interface Props {
	onSubmitToken: (
		token: string,
		issueKey: string | string[],
		issueType: 'epic' | 'issues',
		checkListKey: string[] | null,
	) => void;
}

type FormValues = {
	email: string;
	accessToken: string;
	issueKey: string;
	issueType: 'epic' | 'issues';
	isCheckList: boolean;
	checkListKey: string;
};

const defaultValues = {
	email: localStorage.getItem('email') || '',
	accessToken: localStorage.getItem('jiraToken') || '',
	issueKey: '',
	issueType: 'epic',
	isCheckList: false,
	checkListKey: '',
};

export default function AccessTokenInput({ onSubmitToken }: Props) {
	const [issueType, setIssueType] = useState<'epic' | 'issues'>('epic');
	const methods = useForm<FormValues>({
		defaultValues: defaultValues,
	});
	const { control, handleSubmit } = methods;
	const { email, accessToken, issueKey, checkListKey, isCheckList } = useWatch({
		control: control,
	});
	
	const { submitWithAuth, isLoading } = useAuth();

	const handleIssueTypeChange = (value: 'epic' | 'issues') => {
		setIssueType(value);
	};

	const onSubmit = async (formData: FormValues) => {
		await submitWithAuth(
			{
				email: formData.email,
				accessToken: formData.accessToken,
				issueKey: formData.issueKey,
				issueType: issueType,
				checkListKey: formData.checkListKey,
			},
			onSubmitToken
		);
	};

	return (
		<FormProvider {...methods}>
			<form onSubmit={handleSubmit(onSubmit)}>
				<div className={styles.tokenLayout}>
					<div className={styles.inputContainer}>
						<div className={styles.title}>
							<h3>Jira 이슈 보고서 생성</h3>
						</div>
						<div className={styles.labelWithField}>
							<Controller
								render={({ field }) => (
									<>
										<TextField
											{...field}
											label={'이메일'}
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
										<TextField
											label={'Jira API 토큰'}
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
							<span className={styles.labelText}>조회 방식</span>
							<RadioButton
								labelWithValue={issueTypeDataSet}
								onChange={(value) =>
									handleIssueTypeChange(value as 'epic' | 'issues')
								}
								defaultValue={'epic'}
							/>
						</div>
						<div className={styles.labelWithField}>
							<div className={styles.labelText}>
								{issueType === 'epic' ? '큰틀 키' : '결함 이슈 키들'}
							</div>
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
						<div className={styles.labelWithField}>
							<span className={styles.labelText}>
								<Controller
									render={({ field }) => (
										<input
											{...field}
											type={'checkbox'}
											checked={isCheckList}
											onChange={(e) => field.onChange(e)}
										/>
									)}
									name={'isCheckList'}
								/>
								확인 이슈
							</span>
							<Controller
								render={({ field }) => (
									<textarea
										{...field}
										placeholder={'Enter Issue-Key'}
										disabled={!isCheckList}
										value={checkListKey}
										onChange={(e) => field.onChange(e)}
									/>
								)}
								name={'checkListKey'}
							/>
						</div>
						<button
							className={`${styles.submitButton} ${isLoading ? styles.disabled : ''}`}
							type={'submit'}>
							{isLoading ? '인증중...' : '조회'}
						</button>
					</div>
				</div>
			</form>
		</FormProvider>
	);
}

const issueTypeDataSet = [
	{ label: '큰틀(Epic) 하위 이슈들', value: 'epic' },
	{ label: '특정 결함 키들', value: 'issues' },
] as LabelWithValue[];
