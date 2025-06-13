import { PageContentWrapper } from "@/components/ui/page-content-wrapper";
import { createClient } from "@/utils/supabase/server";
import OrdersManagement from "./orders-management";
import { Order } from "./orders-table";

export default async function ComenziPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
    const searchTerm = (await searchParams).search;
    const trimmedSearchTerm = typeof searchTerm === "string" ? searchTerm.trim() : "";
    const supabase = await createClient();

    let query = supabase
        .from("orders")
        .select(`
            *,
            order_services (
                *,
                services (
                    *,
                    categories (name),
                    service_types (name)
                )
            ),
            customers (
                id,
                nume,
                prenume,
                email,
                telefon,
                accept_marketing_sms,
                accept_marketing_email
            )
        `)
        .order("date_created", { ascending: false })
        .range(0, 19);

    if (trimmedSearchTerm) {
        const q = `%${trimmedSearchTerm.toLowerCase()}%`;
        query = query.or(
            `status.ilike.${q},customers.nume.ilike.${q},customers.prenume.ilike.${q},customers.telefon.ilike.${q}`
        );
    }

    const { data: orders, error } = await query;

    if (error) {
        console.error(error);
        return <div>Error loading orders</div>;
    }

    return (
        <PageContentWrapper>
            <OrdersManagement initialOrders={orders || []} searchTerm={trimmedSearchTerm} />
        </PageContentWrapper>
    );
}
