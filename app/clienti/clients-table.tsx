import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle2, XCircle } from "lucide-react";

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

interface ClientsTableProps {
    clients: Client[];
}

export function ClientsTable({ clients }: ClientsTableProps) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Nume</TableHead>
                    <TableHead>Prenume</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telefon</TableHead>
                    <TableHead>SMS Marketing</TableHead>
                    <TableHead>Email Marketing</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {clients.map((client) => (
                    <TableRow key={client.id}>
                        <TableCell>{client.nume}</TableCell>
                        <TableCell>{client.prenume}</TableCell>
                        <TableCell>{client.email}</TableCell>
                        <TableCell>{client.telefon}</TableCell>
                        <TableCell className="text-center">
                            {client.accept_marketing_sms ? (
                                <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                            ) : (
                                <XCircle className="h-5 w-5 text-red-500 mx-auto" />
                            )}
                        </TableCell>
                        <TableCell className="text-center">
                            {client.accept_marketing_email ? (
                                <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                            ) : (
                                <XCircle className="h-5 w-5 text-red-500 mx-auto" />
                            )}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
} 