'use client';

import { Flex, Spinner } from '@radix-ui/themes';
import React, { useEffect, useState } from 'react';
import Calendar, { Value } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import {
	addDays,
	differenceInBusinessDays,
	differenceInDays,
	format,
	isWeekend,
} from 'date-fns';
import { HolidayType } from '@/app/api/workingDay/route';
import style from './WorkingDay.module.scss';
import { FiInfo } from 'react-icons/fi';
import Tooltip from '@mui/material/Tooltip';

interface HoliDayProps {
	date: Date | string;
	week: string;
	month: number;
	year: number;
	dateName: string;
}

interface WorkingDayResult {
	start: Date;
	end: Date;
	workDay: number;
}

interface WorkingDayProps {
	applyWorkingDay?: (workingDay: WorkingDayResult) => void;
}

const EmptyMessage = () => {
	return (
		<Flex justify={'center'} style={{ padding: '48px 0px' }}>
			<Flex>시작일과 종료일을 선택해주세요</Flex>
		</Flex>
	);
};

export function WorkingDay({ applyWorkingDay }: WorkingDayProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [date, setDate] = useState<{
		start?: Date;
		end?: Date;
	}>({});
	const [holyDays, setHolyDates] = useState<HoliDayProps[]>([]);
	const [isError, setIsError] = useState<boolean>(false);
	const [calculatedDays, setCalculatedDays] = useState<{
		totalDays: number;
		weekendDays: number;
		holidayDays: number;
		workingDays: number;
	}>({
		totalDays: 0,
		weekendDays: 0,
		holidayDays: 0,
		workingDays: 0,
	});

	const handleDateChange = (value: Value) => {
		if (Array.isArray(value)) {
			const [start, end] = value;
			setDate({
				start: start ?? undefined,
				end: end ?? undefined,
			});
		} else {
			setDate({
				start: value ?? undefined,
				end: undefined,
			});
		}
	};

	useEffect(() => {
		const getHolidays = async () => {
			if (!date.start || !date.end) return;

			setIsLoading(true);

			try {
				const data: HolidayType[] = [];

				let currentYear = date.start.getFullYear();
				let currentMonth = date.start.getMonth() + 1;

				const endYear = date.end.getFullYear();
				const endMonth = date.end.getMonth() + 1;

				while (
					currentYear < endYear ||
					(currentYear === endYear && currentMonth <= endMonth)
				) {
					const result = await fetch(
						`/api/workingDay?year=${currentYear}&month=${currentMonth}`,
					)
						.then(async (res) => await res.json())
						.catch((error) => {
							setIsLoading(false);
							setIsError(true);
						});

					data.push(...result);

					currentMonth++;
					if (currentMonth > 12) {
						currentMonth = 1;
						currentYear++;
					}
				}
				const holidays = data.map((d) => {
					const dateStr = d.locdate.toString();
					const year = parseInt(dateStr.substring(0, 4));
					const month = parseInt(dateStr.substring(4, 6));
					const day = parseInt(dateStr.substring(6, 8));

					const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
					const week = weekDays[new Date(year, month - 1, day).getDay()];

					return {
						date: `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}` as string,
						month: month,
						year: year,
						dateName: d.dateName,
						week: week,
					};
				});

				setHolyDates(holidays);

				// 계산 로직 실행
				const totalDays = differenceInDays(date.end, date.start) + 1;

				// 주말 일수 계산
				let weekendCount = 0;
				let currentDate = new Date(date.start);
				const endDate = new Date(date.end);

				while (currentDate <= endDate) {
					if (isWeekend(currentDate)) {
						weekendCount++;
					}
					currentDate = addDays(currentDate, 1);
				}

				// 주말이 아닌 공휴일 수 계산
				const holidayCount = holidays.filter(
					(d) => !isWeekend(new Date(d.date)),
				).length;

				const totalWorkingDays = differenceInBusinessDays(
					addDays(date.end, 1),
					date.start,
				);
				const workingDays = totalWorkingDays - holidayCount;

				setCalculatedDays({
					totalDays,
					weekendDays: weekendCount,
					holidayDays: holidayCount,
					workingDays,
				});

				applyWorkingDay?.({
					start: date.start,
					end: date.end,
					workDay: workingDays,
				});
			} finally {
				setIsLoading(false);
				setIsError(false);
			}
		};

		getHolidays();
	}, [date.start, date.end]);

	if (isLoading || isError) {
		return (
			<Flex
				id={'test'}
				justify={'center'}
				align={'center'}
				p={'4'}
				width={'100%'}
				height={'100%'}>
				{isError ? (
					'오류가 발생했습니다. 잠시후에 다시 시도하세요.'
				) : (
					<Spinner size='3' />
				)}
			</Flex>
		);
	}

	return (
		<Flex
			gap={'4'}
			justify={'center'}
			direction={'column'}
			align={'center'}
			width={'750px'}>
			<Flex width={'100%'} direction={'column'} justify={'start'} gap={'1'}>
				<Flex className={style.title}>기간 선택 (시작일 ~ 종료일)</Flex>
				<Flex className={style.subTitle}>
					공공데이터 API를 통해 공휴일 데이터를 조회합니다.
				</Flex>
			</Flex>
			<Flex direction={'column'} justify={'center'} width={'100%'} gap={'8'}>
				<Flex justify={'center'}>
					<Calendar
						selectRange={true}
						onChange={handleDateChange}
						value={
							date.start && date.end
								? [date.start, date.end]
								: date.start || null
						}
					/>
				</Flex>
				{!date.start && !date.end && <EmptyMessage />}
				{date.start && date.end && (
					<Flex gap={'24px'} direction={'column'} style={{ fontSize: '14px' }}>
						<Flex
							gap={'24px'}
							direction={'column'}
							style={{
								backgroundColor: '#f0f8ff',
								borderRadius: '8px',
							}}>
							<WorkingSection title={'계산 결과'} direction={'column'}>
								<Flex justify={'between'} width={'100%'}>
									<Flex>
										<Flex direction={'column'} gap={'1'}>
											<Flex>시작일</Flex>
											<Flex>{format(date.start, 'yyyy-MM-dd')}</Flex>
										</Flex>
									</Flex>
									<Flex>
										<Flex direction={'column'} gap={'1'}>
											<Flex>종료일</Flex>
											<Flex>{format(date.end, 'yyyy-MM-dd')}</Flex>
										</Flex>
									</Flex>
									<Flex>
										<Flex direction={'column'} gap={'1'}>
											<Flex>전체 일수</Flex>
											<Flex>{calculatedDays.totalDays}일</Flex>
										</Flex>
									</Flex>
								</Flex>
							</WorkingSection>

							<WorkingSection title={'워킹데이 (평일)'} direction={'column'}>
								<Flex style={{ fontSize: '30px', color: '#007be5' }}>
									<strong>{`${calculatedDays.workingDays}일`}</strong>
								</Flex>
							</WorkingSection>
						</Flex>
						<WorkingSection
							title={`기간 내 공휴일 (${holyDays.length}일)`}
							direction={'column'}
							customStyle={{
								borderStyle: 'solid',
								borderColor: '#d0d0d0',
								borderWidth: '1px',
								borderRadius: '8px',
							}}>
							<Flex width={'100%'} direction={'column'} gap={'2'}>
								{holyDays.length >= 1 &&
									holyDays.map((holyDay, idx) => (
										<WorkingCategory
											key={`holiday-${holyDay.date}-${idx}`}
											title={holyDay.dateName as string}
											value={`${holyDay.date}(${holyDay.week})`}
										/>
									))}
							</Flex>
						</WorkingSection>
						<WorkingSection
							title={'일수 분석'}
							direction={'column'}
							customStyle={{
								borderStyle: 'solid',
								borderColor: '#d0d0d0',
								borderWidth: '1px',
								borderRadius: '8px',
							}}>
							<Flex direction={'column'} gap={'2'} width={'100%'}>
								<WorkingCategory
									title={'① 전체 일수'}
									value={`${calculatedDays.totalDays}일`}
								/>
								<WorkingCategory
									title={'② 주말 일수'}
									value={`${calculatedDays.weekendDays}일`}
								/>
								<WorkingCategory
									title={
										<Flex gap={'1'} align={'center'}>
											<Flex>③ 공휴일 일수</Flex>
											<Tooltip title={'공휴일이 주말인 경우는 제외합니다.'}>
												<div
													style={{ display: 'inline-flex', cursor: 'pointer' }}>
													<FiInfo size={18} />
												</div>
											</Tooltip>
										</Flex>
									}
									value={`${calculatedDays.holidayDays}일`}
								/>
								<WorkingCategory
									title={
										<Flex gap={'1'} align={'center'}>
											<Flex>
												<strong>④ 워킹데이 (① - ② - ③)</strong>
											</Flex>
										</Flex>
									}
									color={'rgba(185,218,255,0.57)'}
									value={`${calculatedDays.workingDays}일`}
								/>
							</Flex>
						</WorkingSection>
					</Flex>
				)}
			</Flex>
		</Flex>
	);
}

export const WorkingSection = ({
	title,
	direction = 'column',
	children,
	customStyle,
}: {
	title: string;
	direction: 'row' | 'column';
	children: React.ReactNode;
	customStyle?: React.CSSProperties;
}) => {
	return (
		<Flex
			direction={direction}
			className={style.workSection}
			style={{ ...customStyle }}>
			<Flex style={{ marginBottom: '16px' }}>
				<span>
					<strong>{title}</strong>
				</span>
			</Flex>
			<Flex>{children}</Flex>
		</Flex>
	);
};

export const WorkingCategory = ({
	title,
	value,
	color = '#F0F8FF91',
}: {
	title: string | React.ReactNode;
	value: string;
	color?: string;
}) => {
	return (
		<Flex
			key={`category-${title}`}
			justify={'between'}
			className={style.workCategory}
			style={{
				background: color,
			}}>
			<Flex>{title}</Flex>
			<Flex>{value}</Flex>
		</Flex>
	);
};
