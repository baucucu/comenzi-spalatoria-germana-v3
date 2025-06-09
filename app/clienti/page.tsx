import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ClientsTable } from "./clients-table"
import { ClientForm } from "./client-form"
import { PageContentWrapper } from "@/components/ui/page-content-wrapper"
import { createClient } from "@/utils/supabase/server"

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

export default async function Clienti({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const params = await searchParams;
    const page = typeof params.page === "string" ? parseInt(params.page, 10) : 1;
    const pageSize = typeof params.pageSize === "string" ? parseInt(params.pageSize, 10) : 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const searchQuery = typeof params.search === "string" ? params.search.trim() : "";
    const supabase = await createClient();

    let query = supabase
        .from("customers")
        .select("*")
        .order("nume")
        .order("prenume")
        .range(from, to);

    if (searchQuery) {
        const q = `%${searchQuery.toLowerCase()}%`;
        query = query.or(
            `nume.ilike.${q},prenume.ilike.${q},email.ilike.${q},telefon.ilike.${q}`
        );
    }

    const { data: clienti, error } = await query;

    if (error) {
        console.error(error);
        return <div>Error loading clients</div>;
    }

    return (
        <PageContentWrapper>
            <Card>
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6">
                    <CardTitle className="text-2xl font-semibold">Clienti</CardTitle>
                    <ClientForm mode="create" />
                </CardHeader>
                <CardContent>
                    <ClientsTable clients={clienti || []} searchTerm={searchQuery as string || ""} />
                </CardContent>
            </Card>
        </PageContentWrapper>
    )
}
