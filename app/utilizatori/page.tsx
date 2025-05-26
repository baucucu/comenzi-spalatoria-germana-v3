import UtilizatoriTable from "./utilizatori-table"
import { createClient } from "@/utils/supabase/server"

export default async function Utilizatori() {
    const supabase = await createClient();
    const { data: users } = await supabase.from("profiles").select("id, email, role, created_at");
    // Fallback: If you want to join with auth.users for email, use a custom SQL query or RPC
    // For now, assume profiles has all needed fields
    return (
        <UtilizatoriTable users={users || []} />

    )
}
