import { createClient } from '@/utils/supabase/client'

export async function fetchOrderTotals(orderId: number) {
    const supabase = createClient()
    const { data, error } = await supabase.rpc('get_order_totals', {
        order_input_id: orderId,
    })

    if (error) throw error
    return data?.[0] ?? null
} 