'use client';
import { Order } from "../types";
import { OrderMainCell, OrderStatusCell, OrderClientCell, OrderUrgentCell } from "./OrderTableCells";
import { useOrderStatuses } from "./useOrderStatuses";
import { cn } from "@/lib/utils";
import { CSSProperties } from "react";

interface OrdersTableProps {
    orders: Order[];
    loading: boolean;
    onSelectOrder: (order: Order) => void;
}

export default function OrdersTable({ orders, loading, onSelectOrder }: OrdersTableProps) {
    const { statuses } = useOrderStatuses();

    const getStatusColor = (statusName: string | null) => {
        if (!statusName) return "";
        const status = statuses.find(s => s.name === statusName);
        return status ? status.color : "";
    }

    const getStatusColorStyle = (statusName: string | null): CSSProperties => {
        if (!statusName) return {};
        const status = statuses.find(s => s.name === statusName);
        if (!status || !status.color) return {};

        // status.color is like "bg-red-500". We need to get "red-500".
        const colorName = status.color.replace('bg-', '');

        // We can't directly use Tailwind colors here, we need to map them.
        // This is a simplified example. For a real app, you'd have a better mapping.
        const colorMap: { [key: string]: string } = {
            'red-500': '#ef4444',
            'orange-500': '#f97316',
            'purple-500': '#a855f7',
            'blue-500': '#3b82f6',
            'yellow-500': '#eab308',
            'emerald-500': '#10b981',
        };

        const hexColor = colorMap[colorName];
        if (!hexColor) return {};

        // Convert hex to rgb and add alpha
        const r = parseInt(hexColor.slice(1, 3), 16);
        const g = parseInt(hexColor.slice(3, 5), 16);
        const b = parseInt(hexColor.slice(5, 7), 16);

        return { backgroundColor: `rgba(${r}, ${g}, ${b}, 0.15)` };
    }

    return (
        <div className="border rounded p-0 overflow-x-auto">
            <table className="min-w-full text-sm">
                <thead>
                    <tr className="bg-muted">
                        <th className="px-2 py-2 text-left">Comanda</th>
                        <th className="px-2 py-2 text-left">Status</th>
                        <th className="px-2 py-2 text-left">Urgent</th>
                        <th className="px-2 py-2 text-left">Client</th>
                        <th className="px-2 py-2 text-left">Ridicare</th>
                        <th className="px-2 py-2 text-left">Livrare</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan={7} className="text-center py-8">
                                Se încarcă...
                            </td>
                        </tr>
                    ) : orders.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="text-center py-8">
                                Nicio comandă găsită.
                            </td>
                        </tr>
                    ) : (
                        orders.map(order => (
                            <tr
                                key={order.id}
                                className="border-b cursor-pointer hover:bg-accent"
                                style={getStatusColorStyle(order.status)}
                                onClick={() => onSelectOrder(order)}
                            >
                                <td className="px-2 py-2 font-semibold">
                                    <OrderMainCell order={order} />
                                </td>
                                <td className="px-2 py-2 min-w-[120px]">
                                    <OrderStatusCell status={order.status || ""} />
                                </td>
                                <td className="px-2 py-2 min-w-[100px]">
                                    {order.urgent && (
                                        <OrderUrgentCell urgent={order.urgent} />
                                    )}
                                </td>
                                <td className="px-2 py-2 min-w-[200px]">
                                    <OrderClientCell order={order} />
                                </td>
                                <td className="px-2 py-2 text-xs">
                                    {order.adresa_colectare_id ? (
                                        order.adresa_colectare?.adresa || "-"
                                    ) : (
                                        <span className="text-xs text-muted-foreground">Magazin</span>
                                    )}
                                </td>
                                <td className="px-2 py-2 text-xs">
                                    {order.adresa_returnare_id ? (
                                        order.adresa_returnare?.adresa || "-"
                                    ) : (
                                        <span className="text-xs text-muted-foreground">Magazin</span>
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
} 