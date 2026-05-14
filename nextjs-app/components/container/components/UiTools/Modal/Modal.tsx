'use client';

import { Dialog, Flex, Button, Text } from '@radix-ui/themes';
import { ReactNode } from 'react';
import { TfiClose } from 'react-icons/tfi';
import styles from './Modal.module.scss';

interface ModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	children: ReactNode;
	onConfirm?: () => void;
	onCancel?: () => void;
	confirmText?: string;
	cancelText?: string;
	showActions?: boolean;
	disableOutsideClick?: boolean;
}

export default function Modal({
	open,
	onOpenChange,
	title,
	children,
	onConfirm,
	onCancel,
	confirmText = '확인',
	cancelText = '취소',
	showActions = true,
	disableOutsideClick = false,
}: ModalProps) {
	const handleConfirm = () => {
		onConfirm?.();
		onOpenChange(false);
	};

	const handleCancel = () => {
		onCancel?.();
		onOpenChange(false);
	};

	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Content
				className={styles.modalRoot}
				onInteractOutside={(e) => {
					if (disableOutsideClick) {
						e.preventDefault();
					}
				}}>
				<Dialog.Title className={styles.title}>
					<Flex justify={'between'}>
						<Text>{title}</Text>
						<Flex>
							<TfiClose style={{ cursor: 'pointer' }} onClick={handleCancel} />
						</Flex>
					</Flex>
				</Dialog.Title>
				{/*구분선*/}
				<div className={styles.divider}></div>

				<Flex className={styles.content}>
					<Flex width={'100%'}>{children}</Flex>

					{showActions && (
						<Flex gap='3' mt='4' justify='end'>
							<Dialog.Close>
								<Button
									variant='soft'
									color='gray'
									onClick={handleCancel}
									style={{ cursor: 'pointer' }}>
									{cancelText}
								</Button>
							</Dialog.Close>
							<Button
								variant='solid'
								onClick={handleConfirm}
								style={{ cursor: 'pointer' }}>
								{confirmText}
							</Button>
						</Flex>
					)}
				</Flex>
			</Dialog.Content>
		</Dialog.Root>
	);
}
