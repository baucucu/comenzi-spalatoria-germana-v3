'use client';
import { PageContentWrapper } from "@/components/ui/page-content-wrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

import OrdersTable from "./components/OrdersTable";
import OrderSidebar from "./components/OrderSidebar";
import { Order } from "./types";


export default function ComenziPage() {
    const [search, setSearch] = useState("");
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState<Order | null>(null);

    const fetchOrders = async () => {
        setLoading(true);
        const supabase = createClient();
        let query = supabase
            .from("orders")
            .select(`
                id,
                date_created,
                status,
                total_comanda_cu_discount,
                urgent,
                payment_method,
                customer_id,
                adresa_colectare_id,
                adresa_returnare_id,
                customers:customer_id(id, nume, prenume, telefon, email),
                adresa_colectare:adresa_colectare_id(id, adresa),
                adresa_returnare:adresa_returnare_id(id, adresa)
            `)
            .order("date_created", { ascending: false });

        if (search.trim()) {
            query = query.or(`
                search_vector@@plainto_tsquery.romanian.${search},
                id.eq.${parseInt(search).toString() || ''}
            `);
        }

        const { data } = await query;
        setOrders(
            (data || []).map((order: any) => ({
                ...order,
                customers: order.customers || null,
                adresa_colectare: order.adresa_colectare || null,
                adresa_returnare: order.adresa_returnare || null,
            }))
        );
        setLoading(false);
    };

    useEffect(() => {
        fetchOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    const handleAddOrder = () => {
        setEditingOrder(null);
        setSidebarOpen(true);
    };

    const handleEditOrder = (order: Order) => {
        setEditingOrder(order);
        setSidebarOpen(true);
    };

    const handleSaved = () => {
        setSidebarOpen(false);
        fetchOrders();
    };

    return (
        <PageContentWrapper>
            <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h1 className="text-2xl font-semibold">Comenzi</h1>
                    <Button variant="default" onClick={handleAddOrder}>
                        Adaugă Comandă Nouă
                    </Button>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <Input
                        placeholder="Caută comenzi..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="max-w-xs"
                    />
                </div>
                <div>
                    <OrdersTable orders={orders} loading={loading} onSelectOrder={handleEditOrder} />
                </div>

                <OrderSidebar
                    open={sidebarOpen}
                    onOpenChange={setSidebarOpen}
                    editingOrder={editingOrder}
                    onSaved={handleSaved}
                />
            </div>
        </PageContentWrapper>
    );
} 