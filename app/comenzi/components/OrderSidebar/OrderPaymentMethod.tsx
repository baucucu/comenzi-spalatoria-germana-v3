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

interface OrderPaymentMethodProps {
    orderId: number | null;
}

export default function OrderPaymentMethod({ orderId }: OrderPaymentMethodProps) {
    const [paymentMethod, setPaymentMethod] = useState<string>('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!orderId) return;

        const fetchPaymentMethod = async () => {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('orders')
                .select('payment_method')
                .eq('id', orderId)
                .single();

            if (error) {
                toast.error('Eroare la încărcarea metodei de plată: ' + error.message);
                return;
            }

            if (data) {
                setPaymentMethod(data.payment_method || '');
            }
        };

        fetchPaymentMethod();
    }, [orderId]);

    const handlePaymentMethodChange = async (value: string) => {
        if (!orderId) {
            setPaymentMethod(value);
            return;
        }

        setSaving(true);
        const supabase = createClient();
        const { error } = await supabase
            .from('orders')
            .update({ payment_method: value })
            .eq('id', orderId);

        setSaving(false);

        if (error) {
            toast.error('Eroare la salvarea metodei de plată: ' + error.message);
            return;
        }

        setPaymentMethod(value);
    };

    return (
        <div className="space-y-2">
            <Label>Metodă de plată</Label>
            <Select
                value={paymentMethod}
                onValueChange={handlePaymentMethodChange}
                disabled={saving}
            >
                <SelectTrigger>
                    <SelectValue placeholder="Selectează metoda de plată" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="transfer">Transfer bancar</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
} 