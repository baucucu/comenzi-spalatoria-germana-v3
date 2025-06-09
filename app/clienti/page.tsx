import { PageContentWrapper } from "@/components/ui/page-content-wrapper"
import { createClient } from "@/utils/supabase/server"
import ClientManagement from "./client-management"

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
        .order("prenume")
        .order("nume")
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
            <ClientManagement initialClients={clienti || []} searchTerm={searchQuery as string || ""} />
        </PageContentWrapper>
    )
}
