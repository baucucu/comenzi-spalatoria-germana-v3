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
    const [paymentMethod, setPaymentMethod] = useState<string>('Neachitat');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!orderId) {
            setPaymentMethod('Neachitat');
            return;
        }

        const fetchPaymentMethod = async () => {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('orders')
                .select('payment_method')
                .eq('id', orderId)
                .single();

            if (error) {
                toast.error('Eroare la încărcarea metodei de plată: ' + error.message);
            }

            setPaymentMethod(data?.payment_method || 'Neachitat');
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
        <Card className="p-4 flex flex-col gap-2">
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
                    <SelectItem value="Neachitat">Neachitat</SelectItem>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Card">Card</SelectItem>
                    <SelectItem value="Transfer bancar">Ordin de Plată</SelectItem>
                </SelectContent>
            </Select>
            {saving && <div className="text-xs text-muted-foreground">Se salvează...</div>}
        </Card>
    );
} 