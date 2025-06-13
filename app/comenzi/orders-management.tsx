"use client";
import { useState, useEffect } from "react";
import { OrdersTable, Order } from "./orders-table";
import { createClient } from "@/utils/supabase/client";
import { DateRange } from "react-day-picker";
import { startOfDay, endOfDay } from "date-fns";

interface OrdersManagementProps {
    initialOrders: Order[];
    searchTerm: string;
}

export default function OrdersManagement({ initialOrders, searchTerm }: OrdersManagementProps) {
    const [orders, setOrders] = useState<Order[]>(initialOrders);
    const [search, setSearch] = useState(searchTerm);
    const [dateRange, setDateRange] = useState<DateRange>();
    const [loading, setLoading] = useState(false);

    // Fetch orders on search or date range change
    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            const supabase = createClient();
            let query = supabase
                .from("orders")
                .select(`
                    *,
                    order_services (
                        *,
                        services (
                            *,
                            categories (name),
                            service_types (name)
                        )
                    ),
                    customers (
                        id,
                        nume,
                        prenume,
                        email,
                        telefon
                    )
                `)
                .order("date_created", { ascending: false })
                .range(0, 19);

            // Apply date range filter if set
            if (dateRange?.from) {
                query = query.gte('date_created', startOfDay(dateRange.from).toISOString());
                if (dateRange.to) {
                    query = query.lte('date_created', endOfDay(dateRange.to).toISOString());
                }
            }

            // Apply search filter if set
            if (search) {
                // Convert search term to a format suitable for full-text search
                const searchTerms = search.trim()
                    .split(/\s+/)
                    .filter(term => term.length > 0)
                    .map(term => term + ':*')  // Add prefix matching
                    .join(' & ');  // AND operator

                if (searchTerms) {
                    query = query.textSearch('search_vector', searchTerms, {
                        config: 'simple'  // Use simple config to match the one used in the trigger
                    });
                }
            }

            const { data, error } = await query;
            if (error) {
                console.error("Error fetching orders:", error);
            }
            if (!error && data) {
                setOrders(data);
            }
            setLoading(false);
        };
        fetchOrders();
    }, [search, dateRange]);

    // Edit and delete handlers (to be implemented)
    const handleEdit = (order: Order) => {
        // TODO: Open edit modal
        alert(`Edit order ${order.id}`);
    };
    const handleDelete = async (order: Order) => {
        if (!confirm(`Ștergi comanda #${order.id}?`)) return;
        setLoading(true);
        const supabase = createClient();
        await supabase.from("orders").delete().eq("id", order.id);
        setOrders(orders.filter(o => o.id !== order.id));
        setLoading(false);
    };

    return (
        <div className="flex flex-col h-full w-full">
            <h1 className="text-2xl font-semibold mb-4">Comenzi</h1>
            <OrdersTable
                orders={orders}
                searchTerm={search}
                dateRange={dateRange}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onSearchChange={setSearch}
                onDateRangeChange={setDateRange}
            />
            {loading && <div className="py-4 text-center text-gray-400">Se încarcă...</div>}
        </div>
    );
} 