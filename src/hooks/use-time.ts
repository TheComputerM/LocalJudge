import { useEffect, useState } from "react";

export function useTime(interval: number = 1000) {
	const [time, setTime] = useState<Date>(new Date());

	useEffect(() => {
		const id = setInterval(() => {
			setTime(new Date());
		}, interval);

		return () => clearInterval(id);
	}, []);

	return time;
}
