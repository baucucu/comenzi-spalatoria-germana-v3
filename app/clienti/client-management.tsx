"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { ClientsTable } from "./clients-table";
import { ClientForm } from "./client-form";
import { createClient } from "@/utils/supabase/client";

interface Client {
    id: string;
    nume: string;
    prenume: string;
    email: string;
    telefon: string;
    accept_marketing_sms: boolean;
    accept_marketing_email: boolean;
    created_at: string;
    updated_at: string;
}

interface ClientManagementProps {
    initialClients: Client[];
    searchTerm: string;
}

export default function ClientManagement({ initialClients, searchTerm }: ClientManagementProps) {
    const [clients, setClients] = useState<Client[]>(initialClients);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const searchParams = useSearchParams();

    // Helper to fetch the current page of clients
    const fetchClients = async () => {
        setLoading(true);
        const page = parseInt(searchParams.get("page") || "1", 10);
        const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        const searchQuery = searchParams.get("search")?.trim() || "";
        const supabase = createClient();
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
        const { data, error } = await query;
        if (!error) setClients(data || []);
        setLoading(false);
    };

    useEffect(() => {
        // Listen to changes in search params (pagination/search)
        fetchClients();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    useEffect(() => {
        const supabase = createClient();
        const channel = supabase
            .channel('public:customers')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'customers' },
                () => {
                    fetchClients();
                }
            )
            .subscribe();
        return () => {
            supabase.removeChannel(channel);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    const handleAddClient = () => setIsAddModalOpen(true);
    const handleCancelAdd = () => setIsAddModalOpen(false);

    return (
        <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6">
                <CardTitle className="text-2xl font-semibold">Clienti</CardTitle>
                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={handleAddClient}>
                            <Plus className="mr-2 h-4 w-4" /> Adaugă Client
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] w-[95vw] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Adaugă Client Nou</DialogTitle>
                        </DialogHeader>
                        <ClientForm
                            mode="create"
                            onSuccess={handleCancelAdd}
                        />
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="py-8 text-center text-muted-foreground">Se încarcă...</div>
                ) : (
                    <ClientsTable clients={clients} searchTerm={searchTerm} />
                )}
            </CardContent>
        </Card>
    );
} 