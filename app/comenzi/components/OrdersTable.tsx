'use client';
import { Order } from "../types";
import { OrderMainCell, OrderStatusCell, OrderClientCell } from "./OrderTableCells";

interface OrdersTableProps {
    orders: Order[];
    loading: boolean;
    onSelectOrder: (order: Order) => void;
}

export default function OrdersTable({ orders, loading, onSelectOrder }: OrdersTableProps) {
    return (
        <div className="border rounded p-0 overflow-x-auto">
            <table className="min-w-full text-sm">
                <thead>
                    <tr className="bg-muted">
                        <th className="px-2 py-2 text-left"># / Data / Urgent</th>
                        <th className="px-2 py-2 text-left">Client</th>
                        <th className="px-2 py-2 text-left">Status</th>
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
                                onClick={() => onSelectOrder(order)}
                            >
                                <td className="px-2 py-2 font-semibold">
                                    <OrderMainCell order={order} />
                                </td>
                                <td className="px-2 py-2">
                                    <OrderClientCell order={order} />
                                </td>
                                <td className="px-2 py-2 min-w-[144px]">
                                    <OrderStatusCell status={order.status || ""} />
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