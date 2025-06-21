'use client';

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface OrderMarcuteProps {
    orderId: number | null;
}

export default function OrderMarcute({ orderId }: OrderMarcuteProps) {
    const [marcute, setMarcute] = useState('');
    const [initialMarcute, setInitialMarcute] = useState('');

    const supabase = createClient();

    const fetchMarcute = useCallback(async () => {
        if (!orderId) return;

        const { data, error } = await supabase
            .from('orders')
            .select('marcute')
            .eq('id', orderId)
            .single();

        if (error) {
            console.error("Error fetching marcute:", error);
        } else if (data) {
            const fetchedMarcute = data.marcute || '';
            setMarcute(fetchedMarcute);
            setInitialMarcute(fetchedMarcute);
        }
    }, [orderId, supabase]);

    useEffect(() => {
        fetchMarcute();
    }, [fetchMarcute]);

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
            if (marcute !== initialMarcute) {
                updateMarcute(marcute);
            }
        }, 800);

        return () => {
            clearTimeout(handler);
        };
    }, [marcute, initialMarcute, updateMarcute]);

    if (!orderId) return null;

    return (
        <Card className="p-4 flex flex-col gap-2">
            <Label htmlFor="marcute">Marcute</Label>
            <Textarea
                id="marcute"
                value={marcute}
                onChange={(e) => setMarcute(e.target.value)}
                placeholder="Adaugă marcute..."
                className="min-h-[100px]"
            />
        </Card>
    );
} 