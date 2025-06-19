'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SheetFooter } from '@/components/ui/sheet';

interface OrderFooterProps {
    orderId: number | null;
}

export default function OrderFooter({ orderId }: OrderFooterProps) {
    const [notes, setNotes] = useState('');
    const [total, setTotal] = useState(0);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!orderId) return;

        const fetchOrderDetails = async () => {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('orders')
                .select('notes, total_comanda_cu_discount')
                .eq('id', orderId)
                .single();

            if (error) {
                toast.error('Eroare la încărcarea detaliilor comenzii: ' + error.message);
                return;
            }

            if (data) {
                setNotes(data.notes || '');
                setTotal(data.total_comanda_cu_discount || 0);
            }
        };

        fetchOrderDetails();
    }, [orderId]);

    const handleNotesChange = async (value: string) => {
        setNotes(value);

        if (!orderId) return;

        setSaving(true);
        const supabase = createClient();
        const { error } = await supabase
            .from('orders')
            .update({ notes: value })
            .eq('id', orderId);

        setSaving(false);

        if (error) {
            toast.error('Eroare la salvarea notelor: ' + error.message);
        }
    };

    return (
        <SheetFooter className="border-t p-4 space-y-4">

            <div className="flex justify-between items-center">
                <div className="text-lg font-semibold">
                    Total: {total.toFixed(2)} RON
                </div>
            </div>
        </SheetFooter>
    );
} 