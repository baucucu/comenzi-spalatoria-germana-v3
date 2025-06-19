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
    const [selectedDiscount, setSelectedDiscount] = useState<string>("");
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
                const defaultDiscount = data.find(d => d.value === 0);
                if (defaultDiscount) {
                    setSelectedDiscount(defaultDiscount.value.toString());
                }
            }
        };

        fetchDiscounts();
    }, []);

    useEffect(() => {
        if (!orderId || discounts.length === 0) return;

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
                if (discount) {
                    setSelectedDiscount(discount.value.toString());
                } else {
                    const defaultDiscount = discounts.find(d => d.value === 0);
                    if (defaultDiscount) {
                        setSelectedDiscount(defaultDiscount.value.toString());
                    }
                }
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
        <Card className="p-4 flex flex-col gap-2">
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
                    {discounts.map((discount) => (
                        <SelectItem key={discount.id} value={discount.value.toString()}>
                            {discount.name} ({discount.value}%)
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {saving && <div className="text-xs text-muted-foreground">Se salvează...</div>}
        </Card>
    );
} 