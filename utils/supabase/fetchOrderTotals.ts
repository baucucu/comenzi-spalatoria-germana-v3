import { createClient } from '@/utils/supabase/client'

export async function fetchOrderTotals(orderId: number) {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('order_totals_view')
        .select('*')
        .eq('order_id', orderId)
        .single()

    if (error) throw error
    return data ?? null
} 