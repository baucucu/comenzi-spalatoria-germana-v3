import { createClient } from "@/utils/supabase/server"

export async function getClients() {
    const supabase = await createClient()
    const { data, error } = await supabase.from("customers").select("*")

    if (error) {
        console.error(error)
        return []
    }

    return data
} 