'use client';

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface OrderMarcuteProps {
    orderId: number | null;
    value: string;
    onChange: (value: string) => void;
}

export default function OrderMarcute({ orderId, value, onChange }: OrderMarcuteProps) {
    const [initialMarcute, setInitialMarcute] = useState(value);

    const supabase = createClient();

    useEffect(() => {
        setInitialMarcute(value);
    }, [value]);

    const updateMarcute = useCallback(async (newMarcute: string) => {
        if (!orderId) return;

        const { error } = await supabase
            .from('orders')
            .update({ marcute: newMarcute })
            .eq('id', orderId);

        if (error) {
            toast.error("Eroare la salvarea marcutelor.");
            console.error("Error updating marcute:", error);
        } else {
            setInitialMarcute(newMarcute);
        }
    }, [orderId, supabase]);

    useEffect(() => {
        const handler = setTimeout(() => {
            if (value !== initialMarcute) {
                updateMarcute(value);
            }
        }, 800);

        return () => {
            clearTimeout(handler);
        };
    }, [value, initialMarcute, updateMarcute]);

    return (
        <Card className="p-4 flex flex-col gap-2">
            <Label htmlFor="marcute">Marcute</Label>
            <Textarea
                id="marcute"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Adaugă marcute..."
                className="min-h-[100px]"
            />
        </Card>
    );
} 