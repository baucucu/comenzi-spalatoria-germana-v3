import { createClient } from "@/utils/supabase/client"
import OrderStatusManager from "@/components/order-status-manager"

export default async function StatusComenzi() {
    const supabase = createClient()
    const { data: statusComenzi, error } = await supabase.from("order_statuses").select("*")
    if (error) {
        console.error(error)
    }
    return (
        <OrderStatusManager statusComenzi={statusComenzi} />
    )
}
