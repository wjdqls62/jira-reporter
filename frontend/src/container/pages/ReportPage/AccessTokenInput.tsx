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
	issueKey: localStorage.getItem('issueKey') || '',
	issueType: localStorage.getItem('issueType') || 'epic',
	isCheckList: !!localStorage.getItem('checkListKey'),
	checkListKey: localStorage.getItem('checkListKey') || '',
};

export default function AccessTokenInput({ onSubmitToken }: Props) {
	const [issueType, setIssueType] = useState<'epic' | 'issues'>('epic');
	const methods = useForm<FormValues>({
		defaultValues: defaultValues,
	});
	const { control, handleSubmit, setError, setValue } = methods;
	const { email, accessToken, issueKey, checkListKey, isCheckList } = useWatch({
		control: control,
	});

	const { submitWithAuth, isLoading } = useAuth();

	const handleIssueTypeChange = (value: 'epic' | 'issues') => {
		setValue('issueType', value);
		setIssueType(value);
	};

	const validateIssueKeyPattern = (issueKey: string) => {
		const issueKeyRegex = /^[A-Z][A-Z0-9]*-\d+$/;
		return issueKeyRegex.test(issueKey);
	};

	const onSubmit = async (formData: FormValues) => {
		// 이슈 키 패턴 검증
		if (formData.issueType === 'epic') {
			if (!validateIssueKeyPattern(formData.issueKey)) {
				setError('issueKey', {
					message: `이슈키가 올바르지 않습니다. (${issueKey})`,
				});
				return;
			}
		} else if (formData.issueType === 'issues') {
			const issueArray = formData.issueKey
				.split(',')
				.filter((key) => key.trim() !== '')
				.map((key) => key.trim());
			for (const issueKey of issueArray) {
				if (!validateIssueKeyPattern(issueKey)) {
					setError('issueKey', {
						message: `이슈키가 올바르지 않습니다. (${issueKey})`,
					});
					return;
				}
			}
		}

		//확인 이슈 키 패턴 검증
		if (formData.isCheckList && formData.checkListKey) {
			const issueArray = formData.checkListKey
				.split(',')
				.filter((key) => key.trim() !== '')
				.map((key) => key.trim());

			for (const issueKey of issueArray) {
				if (!validateIssueKeyPattern(issueKey)) {
					setError('checkListKey', {
						message: `이슈키가 올바르지 않습니다. (${issueKey})`,
					});
					return;
				}
			}
		}

		await submitWithAuth(
			{
				email: formData.email,
				accessToken: formData.accessToken,
				issueKey: formData.issueKey,
				issueType: issueType,
				checkListKey: formData.isCheckList ? formData.checkListKey : '',
			},
			onSubmitToken,
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
								defaultValue={issueType ? issueType : 'epic'}
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
											placeholder={issueTypePlaceHolderMap[issueType]}
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
							<label className={styles.labelText}>
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
							</label>
							<Controller
								render={({ field }) => (
									<>
										<textarea
											{...field}
											placeholder={issueTypePlaceHolderMap['issues']}
											disabled={!isCheckList}
											value={checkListKey}
											onChange={(e) => field.onChange(e)}
										/>
										<HelperText name={'checkListKey'} />
									</>
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

const issueTypePlaceHolderMap = {
	['epic']: `이슈 키를 입력하세요.\n(e.g. PROJECT-1000)`,
	['issues']: `이슈 키를 입력하세요. 구분자는 쉼표(,)입니다.\n(e.g. PROJECT-1001, PROJECT-1002, PROJECT-1003)`,
};
