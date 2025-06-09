"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle2, XCircle, Edit, Trash2, MoreVertical } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

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
    searchTerm: string;
    onEdit?: (client: Client) => void;
    onDelete?: (client: Client) => void;
}

export function ClientsTable({ clients, searchTerm, onEdit, onDelete }: ClientsTableProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [inputValue, setInputValue] = useState(searchTerm);

    useEffect(() => {
        setInputValue(searchTerm);
    }, [searchTerm]);

    useEffect(() => {
        const handler = setTimeout(() => {
            const currentSearchParams = new URLSearchParams(searchParams.toString());
            if (inputValue) {
                currentSearchParams.set('search', inputValue);
            } else {
                currentSearchParams.delete('search');
            }
            router.push(`?${currentSearchParams.toString()}`);
        }, 300);
        return () => clearTimeout(handler);
    }, [inputValue]);

    return (
        <div className="space-y-4">
            <Input
                placeholder="Search clients..."
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                className="max-w-sm"
            />
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Prenume</TableHead>
                        <TableHead>Nume</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Telefon</TableHead>
                        <TableHead>SMS Marketing</TableHead>
                        <TableHead>Email Marketing</TableHead>
                        <TableHead>Acțiuni</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {clients.map((client) => (
                        <TableRow key={client.id}>
                            <TableCell>{client.prenume}</TableCell>
                            <TableCell>{client.nume}</TableCell>
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
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                            <MoreVertical className="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => onEdit && onEdit(client)}>
                                            <Edit className="w-4 h-4 mr-2" /> Editează
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => onDelete && onDelete(client)} className="text-red-600">
                                            <Trash2 className="w-4 h-4 mr-2" /> Șterge
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
} 