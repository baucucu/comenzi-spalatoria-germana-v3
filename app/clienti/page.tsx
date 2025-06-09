import { createClient } from "@/utils/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getClients } from "./actions"
import { ClientsTable } from "./clients-table"
import { ClientForm } from "./client-form"

interface Client {
    id: string
    nume: string
    prenume: string
    email: string
    telefon: string
    accept_marketing_sms: boolean
    accept_marketing_email: boolean
    created_at: string
    updated_at: string
}

export default async function Clienti() {
    const supabase = createClient()

    // Fetch clients
    const { data: clienti, error } = await supabase
        .from("customers")
        .select(`*
    `)
        .order("nume, prenume")

    if (error) {
        console.error(error)
        return <div>Error loading clients</div>
    }

    return (
        <div className="container mx-auto p-6">
            <Card>
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6">
                    <CardTitle className="text-2xl font-semibold">Clienti</CardTitle>
                    <ClientForm mode="create" />
                </CardHeader>
                <CardContent>
                    <ClientsTable clients={clienti || []} />
                </CardContent>
            </Card>
        </div>
    )
}
