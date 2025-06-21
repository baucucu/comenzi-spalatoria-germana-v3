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
    value: string;
    onChange: (value: string) => void;
}

export default function OrderPaymentMethod({ orderId, value, onChange }: OrderPaymentMethodProps) {
    const [saving, setSaving] = useState(false);

    const handlePaymentMethodChange = async (newValue: string) => {
        onChange(newValue); // Immediately update parent state

        if (!orderId) {
            return;
        }

        setSaving(true);
        const supabase = createClient();
        const { error } = await supabase
            .from('orders')
            .update({ payment_method: newValue })
            .eq('id', orderId);

        setSaving(false);

        if (error) {
            toast.error('Eroare la salvarea metodei de plată: ' + error.message);
            onChange(value); // Revert on error
            return;
        }
    };

    return (
        <Card className="p-4 flex flex-col gap-2">
            <Label>Metodă de plată</Label>
            <Select
                value={value}
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