'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SheetFooter } from '@/components/ui/sheet';
import { fetchOrderTotals } from '../../../../utils/supabase/fetchOrderTotals';

interface OrderFooterProps {
    orderId: number | null;
}

export default function OrderFooter({ orderId }: OrderFooterProps) {
    const [total, setTotal] = useState(0);
    const [subtotal, setSubtotal] = useState(0);
    const [discountPercent, setDiscountPercent] = useState(0);
    const [discountValue, setDiscountValue] = useState(0);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!orderId) return;

        const fetchTotals = async () => {
            try {
                const data = await fetchOrderTotals(orderId);
                console.log('Order totals RPC data:', data);
                if (data) {
                    setSubtotal(data.total_before_discount || 0);
                    setDiscountPercent(data.discount_percentage || 0);
                    setDiscountValue(data.discount_value || 0);
                    setTotal(data.total_after_discount || 0);
                } else {
                    setSubtotal(0);
                    setDiscountPercent(0);
                    setDiscountValue(0);
                    setTotal(0);
                }
            } catch (error: any) {
                toast.error('Eroare la încărcarea totalurilor comenzii: ' + (error?.message || error));
                setSubtotal(0);
                setDiscountPercent(0);
                setDiscountValue(0);
                setTotal(0);
            }
        };

        fetchTotals();
    }, [orderId]);

    return (
        <SheetFooter className="border-t p-4 space-y-4">
            <div className="flex flex-col gap-1 w-full">
                <div className="flex justify-between items-center text-base">
                    <span>Subtotal:</span>
                    <span>{subtotal.toFixed(2)} RON</span>
                </div>
                {discountPercent > 0 && (
                    <div className="flex justify-between items-center text-base text-green-700">
                        <span>Discount:</span>
                        <span>-{discountPercent}% ({discountValue.toFixed(2)} RON)</span>
                    </div>
                )}
                <div className="flex justify-between items-center text-lg font-semibold mt-1">
                    <span>Total:</span>
                    <span>{total.toFixed(2)} RON</span>
                </div>
            </div>
        </SheetFooter>
    );
} 