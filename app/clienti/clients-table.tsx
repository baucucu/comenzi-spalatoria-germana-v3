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
    onSearchChange?: (value: string) => void;
}

export function ClientsTable({ clients, searchTerm, onEdit, onDelete, onSearchChange }: ClientsTableProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    return (
        <div className="flex flex-col h-full">
            <div className="mb-2">
                <Input
                    placeholder="Search clients..."
                    value={searchTerm}
                    onChange={e => onSearchChange ? onSearchChange(e.target.value) : undefined}
                    className="max-w-sm"
                />
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto">
                <Table className="h-full">
                    <TableHeader className="sticky top-0 z-10 bg-white">
                        <TableRow>
                            <TableHead className="sticky top-0 z-10 bg-white">Prenume</TableHead>
                            <TableHead className="sticky top-0 z-10 bg-white">Nume</TableHead>
                            <TableHead className="sticky top-0 z-10 bg-white">Email</TableHead>
                            <TableHead className="sticky top-0 z-10 bg-white">Telefon</TableHead>
                            <TableHead className="sticky top-0 z-10 bg-white">SMS Marketing</TableHead>
                            <TableHead className="sticky top-0 z-10 bg-white">Email Marketing</TableHead>
                            <TableHead className="sticky top-0 z-10 bg-white">Acțiuni</TableHead>
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
        </div>
    );
} 