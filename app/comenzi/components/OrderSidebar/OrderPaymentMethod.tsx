'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

interface OrderPaymentMethodProps {
    orderId: number | null;
}

export default function OrderPaymentMethod({ orderId }: OrderPaymentMethodProps) {
    const [paymentMethod, setPaymentMethod] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const supabase = createClient();

    // Fetch payment method when orderId changes
    useEffect(() => {
        if (!orderId) {
            setPaymentMethod('');
            return;
        }
        setLoading(true);
        const fetchPaymentMethod = async () => {
            const { data, error } = await supabase
                .from('orders')
                .select('payment_method')
                .eq('id', orderId)
                .single();
            setLoading(false);
            if (error) {
                toast.error('Eroare la încărcarea metodei de plată: ' + error.message);
                setPaymentMethod('');
                return;
            }
            setPaymentMethod(data?.payment_method || '');
        };
        fetchPaymentMethod();
        // Real-time subscription
        const channel = supabase.channel(`order-payment-method-${orderId}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` }, () => {
                fetchPaymentMethod();
            })
            .subscribe();
        return () => {
            supabase.removeChannel(channel);
        };
    }, [orderId]);

    const handlePaymentMethodChange = async (newValue: string) => {
        if (!orderId) {
            setPaymentMethod(newValue);
            return;
        }
        setSaving(true);
        const { error } = await supabase
            .from('orders')
            .update({ payment_method: newValue })
            .eq('id', orderId);
        setSaving(false);
        if (error) {
            toast.error('Eroare la salvarea metodei de plată: ' + error.message);
            return;
        }
        setPaymentMethod(newValue);
    };

    return (
        <Card className="p-4 flex flex-col gap-2">
            <Label>Metodă de plată</Label>
            <Select
                value={paymentMethod}
                onValueChange={handlePaymentMethodChange}
                disabled={saving || loading}
            >
                <SelectTrigger>
                    <SelectValue placeholder="Selectează metoda de plată" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Neachitat">Neachitat</SelectItem>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Card">Card</SelectItem>
                    <SelectItem value="Transfer bancar">Ordin de Plată</SelectItem>
                </SelectContent>
            </Select>
            {(loading || saving) && <div className="text-xs text-muted-foreground">{loading ? 'Se încarcă...' : 'Se salvează...'}</div>}
        </Card>
    );
} 