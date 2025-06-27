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
    const [marcute, setMarcute] = useState("");
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const supabase = createClient();

    // Fetch marcute when orderId changes
    useEffect(() => {
        if (!orderId) {
            setMarcute("");
            return;
        }
        setLoading(true);
        const fetchMarcute = async () => {
            const { data, error } = await supabase
                .from("orders")
                .select("marcute")
                .eq("id", orderId)
                .single();
            setLoading(false);
            if (error) {
                toast.error("Eroare la încărcarea marcutelor: " + error.message);
                setMarcute("");
                return;
            }
            setMarcute(data?.marcute || "");
        };
        fetchMarcute();
    }, [orderId]);

    // Save marcute to Supabase (debounced)
    useEffect(() => {
        if (!orderId) return;
        if (loading) return;
        const handler = setTimeout(() => {
            saveMarcute(marcute);
        }, 800);
        return () => clearTimeout(handler);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [marcute, orderId]);

    const saveMarcute = useCallback(async (newMarcute: string) => {
        if (!orderId) return;
        setSaving(true);
        const { error } = await supabase
            .from("orders")
            .update({ marcute: newMarcute })
            .eq("id", orderId);
        setSaving(false);
        if (error) {
            toast.error("Eroare la salvarea marcutelor: " + error.message);
        }
    }, [orderId, supabase]);

    return (
        <Card className="p-4 flex flex-col gap-2">
            <Label htmlFor="marcute">Marcute</Label>
            <Textarea
                id="marcute"
                value={marcute}
                onChange={e => setMarcute(e.target.value)}
                placeholder="Adaugă marcute..."
                className="min-h-[100px]"
                disabled={loading || saving}
            />
            {(loading || saving) && (
                <div className="text-xs text-muted-foreground">
                    {loading ? "Se încarcă..." : "Se salvează..."}
                </div>
            )}
        </Card>
    );
} 