import { REGEX_EMAIL } from '../constants/Regex.ts';

import type { RegisterOptions } from 'react-hook-form';

interface Props {
	required?: boolean;
	email?: boolean;
}

export const commonValidate = ({
	required = true,
	email = false,
}: Props): RegisterOptions => {
	const rules: RegisterOptions = {};

	if (required) {
		rules.required = '필수 입력입니다.';
	}

	if (email) {
		rules.pattern = {
			value: REGEX_EMAIL,
			message: '유효한 이메일 주소를 입력하세요.',
		};
	}

	return rules;
};
