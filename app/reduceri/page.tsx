import { createClient } from "@/utils/supabase/server"
import DiscountManagement from "./discount-management"

export default async function Page() {
    const supabase = await createClient()
    const { data: discounts, error } = await supabase.from("discounts").select("*").order("created_at", { ascending: false })

    if (error) {
        console.error("Error fetching discounts:", error)
    }

    return <DiscountManagement initialDiscounts={discounts || []} />
}
