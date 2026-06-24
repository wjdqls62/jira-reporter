'use client';

import { useRef, useState } from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';
import styles from './ReportPage.module.scss';
import { commonValidate } from '@/lib/validation/commonValidate';
import { useAuth } from '@/components/container/hooks/useAuth';
import RadioButton, {
	type LabelWithValue,
} from '@/components/container/components/UiTools/RadioButton/RadioButton';
import TextField from '@/components/container/components/UiTools/TextField/TextField';
import {
	Flex,
	HelperText,
} from '@/components/container/components/UiTools/UiTools';
import { TbReport } from 'react-icons/tb';
import { Button, Spinner, Checkbox, Radio, Text } from '@radix-ui/themes';

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

const getDefaultValues = () => {
	if (typeof window === 'undefined') {
		return {
			email: '',
			accessToken: '',
			issueKey: '',
			issueType: 'epic' as 'epic' | 'issues',
			isCheckList: false,
			checkListKey: '',
		};
	}
	return {
		email: localStorage.getItem('email') || '',
		accessToken: localStorage.getItem('jiraToken') || '',
		issueKey: localStorage.getItem('issueKey') || '',
		issueType:
			(localStorage.getItem('issueType') as 'epic' | 'issues') || 'epic',
		isCheckList: !!localStorage.getItem('checkListKey'),
		checkListKey: localStorage.getItem('checkListKey') || '',
	};
};

export default function AccessTokenInput({ onSubmitToken }: Props) {
	const [issueType, setIssueType] = useState<'epic' | 'issues'>('epic');
	const [asyncError, setAsyncError] = useState<Error | null>(null);
	const methods = useForm<FormValues>({
		defaultValues: getDefaultValues(),
	});
	const { control, handleSubmit, setError, setValue } = methods;
	const { email, accessToken, issueKey, checkListKey, isCheckList } = useWatch({
		control: control,
	});
	const ref = useRef<HTMLFormElement>(null);

	const { submitWithAuth, isLoading } = useAuth();

	// asyncError가 있으면 render 시점에 throw → app/error.tsx 에러 바운더리가 catch
	if (asyncError) throw asyncError;

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

		try {
			await submitWithAuth(
				{
					email: formData.email,
					accessToken: formData.accessToken,
					issueKey:
						issueType === 'epic'
							? formData.issueKey
							: formData.issueKey
									.split(',')
									.map((s) => s.trim())
									.filter(Boolean)
									.join(', '),
					issueType: issueType,
					checkListKey: formData.isCheckList ? formData.checkListKey : '',
				},
				onSubmitToken,
			);
		} catch (error: any) {
			const message =
				error.response?.data?.error || error.message || '오류가 발생했습니다.';
			setAsyncError(new Error(message));
		}
	};

	return (
		<FormProvider {...methods}>
			<form ref={ref} onSubmit={handleSubmit(onSubmit)}>
				<div className={styles.tokenLayout}>
					<div className={styles.inputContainer}>
						<div className={styles.title}>
							<div>
								<TbReport size={24} />
							</div>
							<h3>Jira 이슈 보고서 생성</h3>
							<span className={styles.version}>{process.env.NEXT_PUBLIC_BUILD_VERSION || 'v-'}</span>
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
							<Text as={'label'}>
								<Flex gap={8}>
									<Radio
										defaultChecked={issueType === 'epic'}
										size={'1'}
										name={'issueType'}
										value={'epic'}
										color={'gray'}
										onClick={() => handleIssueTypeChange('epic')}
										highContrast
									/>
									<Text as={'span'}>큰틀(Epic) 하위 이슈들</Text>
								</Flex>
							</Text>
							<Text as={'label'}>
								<Flex gap={8}>
									<Radio
										defaultChecked={issueType === 'issues'}
										size={'1'}
										name={'issueType'}
										value={'issues'}
										color={'gray'}
										onClick={() => handleIssueTypeChange('issues')}
										highContrast
									/>
									<Text as={'span'}>특정 결함 키들</Text>
								</Flex>
							</Text>
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
							<Controller
								render={({ field }) => (
									<label>
										<Flex gap={8} alignItems={'center'}>
											<Checkbox
												checked={isCheckList}
												onCheckedChange={(checked) => field.onChange(checked)}
												name={'확인 이슈'}
												color={'gray'}
												highContrast
											/>
											<div>확인 이슈</div>
										</Flex>
									</label>
								)}
								name={'isCheckList'}
							/>
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
						<Button
							color='gray'
							variant='solid'
							style={{ cursor: 'pointer' }}
							highContrast>
							<Spinner loading={isLoading} />
							<Text as={'span'} size={'1'}>
								조회
							</Text>
						</Button>
					</div>
				</div>
			</form>
		</FormProvider>
	);
}

const issueTypePlaceHolderMap = {
	['epic']: `이슈 키를 입력하세요.\n(e.g. PROJECT-1000)`,
	['issues']: `이슈 키를 입력하세요. 구분자는 쉼표(,)입니다.\n(e.g. PROJECT-1001, PROJECT-1002, PROJECT-1003)`,
};
