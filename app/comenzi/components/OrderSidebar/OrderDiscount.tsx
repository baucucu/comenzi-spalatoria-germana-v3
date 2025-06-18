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

interface Discount {
    id: number;
    name: string;
    value: number;
}

interface OrderDiscountProps {
    orderId: number | null;
}

export default function OrderDiscount({ orderId }: OrderDiscountProps) {
    const [discounts, setDiscounts] = useState<Discount[]>([]);
    const [selectedDiscount, setSelectedDiscount] = useState<string>("0");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchDiscounts = async () => {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('discounts')
                .select('id, name, value')
                .order('value');

            if (error) {
                toast.error('Eroare la încărcarea discounturilor: ' + error.message);
                return;
            }

            if (data) {
                setDiscounts(data);
            }
        };

        fetchDiscounts();
    }, []);

    useEffect(() => {
        if (!orderId) return;

        const fetchOrderDiscount = async () => {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('orders')
                .select('discount')
                .eq('id', orderId)
                .single();

            if (error) {
                toast.error('Eroare la încărcarea discountului: ' + error.message);
                return;
            }

            if (data) {
                const discount = discounts.find(d => d.value === data.discount);
                setSelectedDiscount(discount ? discount.value.toString() : "0");
            }
        };

        fetchOrderDiscount();
    }, [orderId, discounts]);

    const handleDiscountChange = async (value: string) => {
        if (!orderId) {
            setSelectedDiscount(value);
            return;
        }

        setSaving(true);
        const supabase = createClient();
        const { error } = await supabase
            .from('orders')
            .update({ discount: value ? parseFloat(value) : 0 })
            .eq('id', orderId);

        setSaving(false);

        if (error) {
            toast.error('Eroare la salvarea discountului: ' + error.message);
            return;
        }

        setSelectedDiscount(value);
    };

    return (
        <div className="space-y-2">
            <Label>Discount</Label>
            <Select
                value={selectedDiscount}
                onValueChange={handleDiscountChange}
                disabled={saving}
            >
                <SelectTrigger>
                    <SelectValue placeholder="Selectează discount" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="0">Fără discount</SelectItem>
                    {discounts.map((discount) => (
                        <SelectItem key={discount.id} value={discount.value.toString()}>
                            {discount.name} ({discount.value}%)
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
} 