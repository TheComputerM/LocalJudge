"use client";

import { lightFormat } from "date-fns";
import { LucideCalendar } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Label } from "../ui/label";
import { FieldInfo } from "./field-info";
import { useFieldContext } from "./form-context";

/**
 * Date and time picker component from https://time.rdsx.dev/
 */
export function DateTimePicker(props: { label: string }) {
	const field = useFieldContext<Date>();
	const {
		state: { value: date },
		handleChange: setDate,
	} = field;

	const [isOpen, setIsOpen] = React.useState(false);

	const hours = Array.from({ length: 24 }, (_, i) => i);
	const handleDateSelect = (selectedDate?: Date) => {
		if (selectedDate) setDate(selectedDate);
	};

	const handleTimeChange = (type: "hour" | "minute", value: string) => {
		if (date) {
			const newDate = new Date(date);
			if (type === "hour") {
				newDate.setHours(parseInt(value));
			} else if (type === "minute") {
				newDate.setMinutes(parseInt(value));
			}
			setDate(newDate);
		}
	};

	return (
		<div className="flex flex-col gap-3">
			<Label>{props.label}</Label>
			<Popover
				open={isOpen}
				onOpenChange={(open) => {
					setIsOpen(open);
					if (!open) field.handleBlur();
				}}
			>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						className={cn(
							"w-full justify-start text-left font-normal",
							!date && "text-muted-foreground",
						)}
					>
						<LucideCalendar className="mr-2 h-4 w-4" />
						{date ? (
							lightFormat(date, "dd/MM/yyyy hh:mm a")
						) : (
							<span>DD/MM/YYYY hh:mm a/p</span>
						)}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0">
					<div className="sm:flex">
						<Calendar
							mode="single"
							selected={date}
							onSelect={handleDateSelect}
							autoFocus
						/>
						<div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x">
							<ScrollArea className="w-64 sm:w-auto">
								<div className="flex sm:flex-col p-2">
									{hours.map((hour) => (
										<Button
											key={hour}
											size="icon"
											variant={
												date && date.getHours() === hour ? "default" : "ghost"
											}
											className="sm:w-full shrink-0 aspect-square"
											onClick={() => handleTimeChange("hour", hour.toString())}
										>
											{hour}
										</Button>
									))}
								</div>
								<ScrollBar orientation="horizontal" className="sm:hidden" />
							</ScrollArea>
							<ScrollArea className="w-64 sm:w-auto">
								<div className="flex sm:flex-col p-2">
									{Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => (
										<Button
											key={minute}
											size="icon"
											variant={
												date && date.getMinutes() === minute
													? "default"
													: "ghost"
											}
											className="sm:w-full shrink-0 aspect-square"
											onClick={() =>
												handleTimeChange("minute", minute.toString())
											}
										>
											{minute.toString().padStart(2, "0")}
										</Button>
									))}
								</div>
								<ScrollBar orientation="horizontal" className="sm:hidden" />
							</ScrollArea>
						</div>
					</div>
				</PopoverContent>
			</Popover>
			<FieldInfo field={field} />
		</div>
	);
}
