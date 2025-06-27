'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
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
    const [loading, setLoading] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        if (!orderId) return;
        setLoading(true);
        const fetchTotals = async () => {
            try {
                const data = await fetchOrderTotals(orderId);
                if (data) {
                    setSubtotal(data.subtotal_articole || 0);
                    setDiscountPercent(data.discount_percent || 0);
                    setDiscountValue((data.subtotal_articole || 0) * (data.discount_percent || 0) / 100);
                    setTotal(data.total_comanda_cu_discount || 0);
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
            } finally {
                setLoading(false);
            }
        };
        fetchTotals();
        // Real-time subscription for orders
        const channelOrders = supabase.channel(`order-footer-orders-${orderId}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` }, () => {
                fetchTotals();
            })
            .subscribe();
        // Real-time subscription for order_services
        const channelOrderServices = supabase.channel(`order-footer-order-services-${orderId}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'order_services', filter: `order_id=eq.${orderId}` }, () => {
                fetchTotals();
            })
            .subscribe();
        return () => {
            supabase.removeChannel(channelOrders);
            supabase.removeChannel(channelOrderServices);
        };
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
                {loading && (
                    <div className="text-xs text-muted-foreground">Se încarcă...</div>
                )}
            </div>
        </SheetFooter>
    );
} 