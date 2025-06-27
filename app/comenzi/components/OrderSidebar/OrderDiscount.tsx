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
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const supabase = createClient();

    // Fetch discounts list
    useEffect(() => {
        const fetchDiscounts = async () => {
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

    // Fetch order discount when orderId or discounts change
    useEffect(() => {
        if (!orderId || discounts.length === 0) {
            setSelectedDiscount("");
            return;
        }
        setLoading(true);
        const fetchOrderDiscount = async () => {
            const { data, error } = await supabase
                .from('orders')
                .select('discount')
                .eq('id', orderId)
                .single();
            setLoading(false);
            if (error) {
                toast.error('Eroare la încărcarea discountului: ' + error.message);
                setSelectedDiscount("");
                return;
            }
            if (data) {
                const discount = discounts.find(d => d.id === data.discount);
                if (discount) {
                    setSelectedDiscount(discount.id.toString());
                } else {
                    setSelectedDiscount("");
                }
            }
        };
        fetchOrderDiscount();
        // Real-time subscription
        const channel = supabase.channel(`order-discount-${orderId}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` }, () => {
                fetchOrderDiscount();
            })
            .subscribe();
        return () => {
            supabase.removeChannel(channel);
        };
    }, [orderId, discounts]);

    const handleDiscountChange = async (value: string) => {
        if (!orderId) {
            setSelectedDiscount(value);
            return;
        }
        setSaving(true);
        const discountId = value ? parseInt(value) : null;
        const { error } = await supabase
            .from('orders')
            .update({ discount: discountId })
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
                disabled={saving || loading}
            >
                <SelectTrigger>
                    <SelectValue placeholder="Selectează discount" />
                </SelectTrigger>
                <SelectContent>
                    {discounts.map((discount) => (
                        <SelectItem key={discount.id} value={discount.id.toString()}>
                            {discount.name} ({discount.value}%)
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {(loading || saving) && <div className="text-xs text-muted-foreground">{loading ? 'Se încarcă...' : 'Se salvează...'}</div>}
        </Card>
    );
} 