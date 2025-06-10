"use client";
import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { ClientsTable } from "./clients-table";
import { ClientForm } from "./client-form";
import { createClient } from "@/utils/supabase/client";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import debounce from "lodash/debounce";

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

const PAGE_SIZE = 20;

export default function ClientManagement({ initialClients, searchTerm }: ClientManagementProps) {
    const [clients, setClients] = useState<Client[]>(initialClients);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [deletingClient, setDeletingClient] = useState<Client | null>(null);
    const [loading, setLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [hasMore, setHasMore] = useState(initialClients.length === PAGE_SIZE);
    const [page, setPage] = useState(1); // page 1 is initialClients
    const [search, setSearch] = useState(searchTerm);
    const searchParams = useSearchParams();
    const router = useRouter();

    // Fetch clients from API route
    const fetchClients = async (nextPage: number, searchValue = search) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: nextPage.toString(),
                pageSize: PAGE_SIZE.toString(),
                search: searchValue || "",
            });
            const res = await fetch(`/api/clienti?${params.toString()}`);
            if (!res.ok) {
                setLoading(false);
                return;
            }
            const text = await res.text();
            if (!text) {
                setLoading(false);
                return;
            }
            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                setLoading(false);
                return;
            }
            setClients((prev) => [...prev, ...(data.clienti || [])]);
            setHasMore(data.hasMore);
            setPage(nextPage);
        } catch (e) {
            // Optionally show an error message
        }
        setLoading(false);
    };

    // Infinite scroll using window scroll
    useEffect(() => {
        const handleScroll = debounce(() => {
            if (loading || !hasMore) return;
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
                fetchClients(page + 1);
            }
        }, 200);
        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
            handleScroll.cancel();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading, hasMore, page, search]);

    // Reset on search term change
    useEffect(() => {
        setClients(initialClients);
        setPage(1);
        setHasMore(initialClients.length === PAGE_SIZE);
    }, [initialClients, searchTerm]);

    // Realtime updates: re-fetch all loaded clients on any change
    useEffect(() => {
        const supabase = createClient();
        const channel = supabase
            .channel('public:customers')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'customers' },
                () => {
                    // Re-fetch all loaded clients
                    setClients([]);
                    setPage(1);
                    setHasMore(true);
                    fetchClients(1, search);
                }
            )
            .subscribe();
        return () => {
            supabase.removeChannel(channel);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    // Handlers for add/edit/delete (unchanged)
    const handleAddClient = () => setIsAddModalOpen(true);
    const handleCancelAdd = () => setIsAddModalOpen(false);
    const handleEdit = (client: Client) => setEditingClient(client);
    const handleEditClose = () => setEditingClient(null);
    const handleDelete = (client: Client) => setDeletingClient(client);
    const handleDeleteClose = () => setDeletingClient(null);
    const handleEditSuccess = () => {
        setEditingClient(null);
        setClients([]);
        setPage(1);
        setHasMore(true);
        fetchClients(1, search);
    };
    const handleDeleteConfirm = async () => {
        if (!deletingClient) return;
        setDeleteLoading(true);
        const supabase = createClient();
        await supabase.from("customers").delete().eq("id", deletingClient.id);
        setDeleteLoading(false);
        setDeletingClient(null);
        setClients([]);
        setPage(1);
        setHasMore(true);
        fetchClients(1, search);
    };

    // Simple rotating loading icon
    const Spinner = () => (
        <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    return (
        <div className="flex flex-col h-full w-full">
            <Card className="flex flex-col flex-1 min-h-0 w-full">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
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
                    {/* Edit Client Dialog */}
                    <Dialog open={!!editingClient} onOpenChange={v => !v && setEditingClient(null)}>
                        <DialogContent className="sm:max-w-[500px] w-[95vw] max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Editează Client</DialogTitle>
                            </DialogHeader>
                            {editingClient && (
                                <ClientForm
                                    mode="edit"
                                    initialValues={editingClient}
                                    onSuccess={handleEditSuccess}
                                />
                            )}
                        </DialogContent>
                    </Dialog>
                    {/* Delete Confirmation Dialog */}
                    <AlertDialog open={!!deletingClient} onOpenChange={v => !v && setDeletingClient(null)}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Șterge clientul?</AlertDialogTitle>
                            </AlertDialogHeader>
                            <div className="py-2">Ești sigur că vrei să ștergi clientul <b>{deletingClient?.nume} {deletingClient?.prenume}</b>? Această acțiune nu poate fi anulată.</div>
                            <AlertDialogFooter>
                                <AlertDialogCancel onClick={handleDeleteClose}>Anulează</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteConfirm} disabled={deleteLoading} className="bg-red-600 hover:bg-red-700">
                                    {deleteLoading ? "Se șterge..." : "Șterge"}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardHeader>
                <CardContent className="flex-1 min-h-0 overflow-auto">
                    <ClientsTable
                        clients={clients}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        searchTerm={search}
                        onSearchChange={setSearch}
                    />
                    {loading && <Spinner />}
                    {!hasMore && (
                        <div className="py-4 text-center text-gray-400">No more clients</div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
} 