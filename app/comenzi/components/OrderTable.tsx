import React from "react";
import { cn } from "@/lib/utils";

interface OrderTableProps {
    orders: Array<{
        id: number;
        date_created: string;
        status: string | null;
        urgent?: boolean;
        customers: { nume: string; prenume: string; telefon?: string; email?: string } | null;
        adresa_colectare_id?: number;
        adresa_returnare_id?: number;
        adresa_colectare?: { adresa: string } | null;
        adresa_returnare?: { adresa: string } | null;
    }>;
    onOrderClick: (order: any) => void;
}

export const OrderTable: React.FC<OrderTableProps> = ({ orders, onOrderClick }) => (
    <div className="border rounded p-0 overflow-x-auto">
        <table className="min-w-full text-sm">
            <thead>
                <tr className="bg-muted">
                    <th className="px-2 py-2 text-left">#</th>
                    <th className="px-2 py-2 text-left">Data</th>
                    <th className="px-2 py-2 text-left">Client</th>
                    <th className="px-2 py-2 text-left">Status</th>
                    <th className="px-2 py-2 text-left">Urgent</th>
                    <th className="px-2 py-2 text-left">Ridicare</th>
                    <th className="px-2 py-2 text-left">Livrare</th>
                </tr>
            </thead>
            <tbody>
                {orders.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-8">Nicio comandă găsită.</td></tr>
                ) : (
                    orders.map(order => (
                        <tr
                            key={order.id}
                            className={cn("border-b cursor-pointer hover:bg-accent")}
                            onClick={() => onOrderClick(order)}
                        >
                            <td className="px-2 py-2 font-semibold">{order.id}</td>
                            <td className="px-2 py-2">{new Date(order.date_created).toLocaleDateString()}</td>
                            <td className="px-2 py-2">
                                {order.customers ? (
                                    <div className="flex flex-col">
                                        <span>{order.customers.nume} {order.customers.prenume}</span>
                                        {order.customers.telefon && <span className="text-xs text-muted-foreground">{order.customers.telefon}</span>}
                                        {order.customers.email && <span className="text-xs text-muted-foreground">{order.customers.email}</span>}
                                    </div>
                                ) : <span className="text-muted-foreground">-</span>}
                            </td>
                            <td className="px-2 py-2">{order.status}</td>
                            <td className="px-2 py-2">{order.urgent ? '✔️' : ''}</td>
                            <td className="px-2 py-2">
                                {order.adresa_colectare_id ? (order.adresa_colectare?.adresa || '-') : <span className="text-xs text-muted-foreground">Magazin</span>}
                            </td>
                            <td className="px-2 py-2">
                                {order.adresa_returnare_id ? (order.adresa_returnare?.adresa || '-') : <span className="text-xs text-muted-foreground">Magazin</span>}
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
    </div>
); 