import { NextResponse } from 'next/server';

const apiUrl = `https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getRestDeInfo`;
const serviceKey =
	'SsX5KN%2FVxcKWuZBDNJEkdchyTpSC9aV1b87UccStp7ogIy2oIHInbJ%2F%2FC3KS%2FQbOP212pq1um1mPlZ4WU4SCqw%3D%3D';
const resType = 'json';
const numOfRows = 100;

export type HolidayType = {
	dateKind: string;
	dateName: string;
	isHoliday: 'Y' | 'N';
	locdate: number;
	seq: number;
};

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const year = searchParams.get('year');
	const month = searchParams.get('month')?.padStart(2, '0');

	// API 호출 로직
	try {
		const response = await fetch(
			`${apiUrl}?serviceKey=${serviceKey}&_type=${resType}&numOfRows=${numOfRows}&solYear=${year}&solMonth=${month}`,
			{
				next: { revalidate: 86400 },
			},
		);
		if (!response.ok) {
			return NextResponse.json({
				success: false,
				message: 'API 호출 중 오류가 발생했습니다.',
			});
		}
		const data = await response.json();

		const item: HolidayType[] | HolidayType = data.response.body.items.item;
		if (Array.isArray(item)) {
			return NextResponse.json(item);
		} else if (item && typeof item === 'object' && item.locdate !== undefined) {
			return NextResponse.json([item]);
		} else {
			return NextResponse.json([]);
		}
	} catch (error) {
		return NextResponse.json({
			error: error.message,
			status: 500,
		});
	}
}
