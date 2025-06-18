"use client";
// @ts-nocheck
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from "@/components/ui/select";
import { useUpdateOrder } from "./useUpdateOrder";
import { useOrder } from "./useOrder";

export default function OrderStatusPart({
    orderId,
}: {
    orderId?: number | null;
}) {
    const { data: order } = useOrder(orderId);
    const update = useUpdateOrder();

    return (
        <div className="p-4 bg-card rounded-md flex flex-col gap-2">
            <span className="text-sm font-medium">Status comandă</span>
            <Select
                value={order?.status ?? ""}
                onValueChange={(status) =>
                    orderId && update.mutate({ id: orderId, values: { status } })
                }
            >
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selectează status..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="nou">Nou</SelectItem>
                    <SelectItem value="in_lucru">În lucru</SelectItem>
                    <SelectItem value="finalizat">Finalizat</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
} 