"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { ClientsTable } from "./clients-table";
import { ClientForm } from "./client-form";

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

    const handleAddClient = () => setIsAddModalOpen(true);
    const handleCancelAdd = () => setIsAddModalOpen(false);

    const handleClientAdded = (newClient?: Client) => {
        if (newClient) setClients((prev) => [newClient, ...prev]);
        setIsAddModalOpen(false);
    };

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
                        // Optionally, you can pass a callback to update the list with the new client
                        />
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                <ClientsTable clients={clients} searchTerm={searchTerm} />
            </CardContent>
        </Card>
    );
} 