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

export default function OrderStatus({ orderId }: { orderId?: number | null }) {
    const [statuses, setStatuses] = useState<OrderStatusType[]>([]);
    const [order, setOrder] = useState<{ status: string; urgent: boolean } | null>(null);
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

    // Fetch order status & urgent
    useEffect(() => {
        const fetchOrder = async () => {
            if (!orderId) {
                setOrder(null);
                return;
            }
            const supabase = createClient();
            const { data } = await supabase
                .from("orders")
                .select("status, urgent")
                .eq("id", orderId)
                .single();
            if (data) setOrder(data);
        };
        fetchOrder();
    }, [orderId]);

    // Update status or urgent
    const updateOrder = async (values: Partial<{ status: string; urgent: boolean }>) => {
        if (!orderId) return;
        setUpdating(true);
        const supabase = createClient();
        const { error } = await supabase
            .from("orders")
            .update(values)
            .eq("id", orderId);
        setUpdating(false);
        if (!error) {
            setOrder(prev => ({ ...prev!, ...values }));
            toast.success("Comandă actualizată!");
        } else {
            toast.error("Eroare la actualizare: " + error.message);
        }
    };

    return (
        <Card className="p-4 flex flex-col gap-2">
            <Label>Status comandă</Label>
            <Select
                value={order?.status ?? ""}
                onValueChange={status => updateOrder({ status })}
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
                    checked={!!order?.urgent}
                    onCheckedChange={urgent => updateOrder({ urgent })}
                    disabled={updating}
                    id="urgent-switch"
                />
            </div>
        </Card>
    );
} 