"use client";

import * as React from "react";
import { CalendarDays } from "lucide-react";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface DateTimePickerProps {
    value?: Date;
    onChange?: (date: Date | undefined) => void;
    disabled?: boolean;
}

export function DateTimePicker({ value, onChange, disabled }: DateTimePickerProps) {
    const [isOpen, setIsOpen] = React.useState(false);

    const date = value;
    const hours = Array.from({ length: 12 }, (_, i) => i + 1);
    const handleDateSelect = (selectedDate: Date | undefined) => {
        if (onChange) {
            if (selectedDate) {
                // preserve time if already set
                let newDate = selectedDate;
                if (date) {
                    newDate = new Date(selectedDate);
                    newDate.setHours(date.getHours());
                    newDate.setMinutes(date.getMinutes());
                }
                onChange(newDate);
            } else {
                onChange(undefined);
            }
        }
    };

    const handleTimeChange = (
        type: "hour" | "minute" | "ampm",
        val: string
    ) => {
        if (date && onChange) {
            const newDate = new Date(date);
            if (type === "hour") {
                newDate.setHours(
                    (parseInt(val) % 12) + (newDate.getHours() >= 12 ? 12 : 0)
                );
            } else if (type === "minute") {
                newDate.setMinutes(parseInt(val));
            } else if (type === "ampm") {
                const currentHours = newDate.getHours();
                if (val === "PM" && currentHours < 12) {
                    newDate.setHours(currentHours + 12);
                } else if (val === "AM" && currentHours >= 12) {
                    newDate.setHours(currentHours - 12);
                }
            }
            onChange(newDate);
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                    )}
                    disabled={disabled}
                >
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {date ? (
                        format(date, "MM/dd/yyyy hh:mm aa")
                    ) : (
                        <span>MM/DD/YYYY hh:mm aa</span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <div className="sm:flex">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={handleDateSelect}
                        initialFocus
                        disabled={disabled}
                    />
                    <div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x">
                        <div className="w-64 sm:w-auto overflow-auto">
                            <div className="flex sm:flex-col p-2">
                                {hours.slice().reverse().map((hour) => (
                                    <Button
                                        key={hour}
                                        size="icon"
                                        variant={
                                            date && date.getHours() % 12 === hour % 12
                                                ? "default"
                                                : "ghost"
                                        }
                                        className="sm:w-full shrink-0 aspect-square"
                                        onClick={() => handleTimeChange("hour", hour.toString())}
                                        disabled={disabled}
                                    >
                                        {hour}
                                    </Button>
                                ))}
                            </div>
                        </div>
                        <div className="w-64 sm:w-auto overflow-auto">
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
                                        disabled={disabled}
                                    >
                                        {minute}
                                    </Button>
                                ))}
                            </div>
                        </div>
                        <div className="overflow-auto">
                            <div className="flex sm:flex-col p-2">
                                {["AM", "PM"].map((ampm) => (
                                    <Button
                                        key={ampm}
                                        size="icon"
                                        variant={
                                            date &&
                                                ((ampm === "AM" && date.getHours() < 12) ||
                                                    (ampm === "PM" && date.getHours() >= 12))
                                                ? "default"
                                                : "ghost"
                                        }
                                        className="sm:w-full shrink-0 aspect-square"
                                        onClick={() => handleTimeChange("ampm", ampm)}
                                        disabled={disabled}
                                    >
                                        {ampm}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
