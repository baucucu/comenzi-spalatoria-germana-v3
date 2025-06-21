"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from "@/components/ui/select";

interface OrderStatusType {
    id: number;
    name: string;
    label: string;
    color: string;
}

export default function OrderStatus({
    orderId,
    status,
    urgent,
    onStatusChange,
    onUrgentChange,
}: {
    orderId?: number | null;
    status: string;
    urgent: boolean;
    onStatusChange: (status: string) => void;
    onUrgentChange: (urgent: boolean) => void;
}) {
    const [statuses, setStatuses] = useState<OrderStatusType[]>([]);
    const [updating, setUpdating] = useState(false);

    // Fetch statuses
    useEffect(() => {
        const fetchStatuses = async () => {
            const supabase = createClient();
            const { data } = await supabase
                .from("order_statuses")
                .select("id, name, label, color");
            if (data) setStatuses(data);
        };
        fetchStatuses();
    }, []);

    // Update status or urgent
    const updateOrder = async (values: Partial<{ status: string; urgent: boolean }>) => {
        if (!orderId) {
            if (values.status !== undefined) onStatusChange(values.status);
            if (values.urgent !== undefined) onUrgentChange(values.urgent);
            return;
        }

        setUpdating(true);
        const supabase = createClient();
        const { error } = await supabase
            .from("orders")
            .update(values)
            .eq("id", orderId);
        setUpdating(false);
        if (!error) {
            if (values.status) onStatusChange(values.status);
            if (values.urgent !== undefined) onUrgentChange(values.urgent);
            toast.success("Comandă actualizată!");
        } else {
            toast.error("Eroare la actualizare: " + error.message);
        }
    };

    return (
        <Card className="p-4 flex flex-col gap-2">
            <Label>Status comandă</Label>
            <Select
                value={status}
                onValueChange={s => updateOrder({ status: s })}
                disabled={updating}
            >
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selectează status..." />
                </SelectTrigger>
                <SelectContent>
                    {statuses.map(s => (
                        <SelectItem key={s.name} value={s.name}>
                            {s.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <div className="flex items-center gap-2 mt-2">
                <Label htmlFor="urgent-switch">Urgent</Label>
                <Switch
                    checked={urgent}
                    onCheckedChange={u => updateOrder({ urgent: u })}
                    disabled={updating}
                    id="urgent-switch"
                />
            </div>
        </Card>
    );
} 