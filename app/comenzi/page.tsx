'use client';
import { PageContentWrapper } from "@/components/ui/page-content-wrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { useSearchParams } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import { addDays, isAfter, isBefore, isSameDay } from "date-fns";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { type DateRange } from "react-day-picker";

import OrdersTable from "./components/OrdersTable";
import OrderSidebar from "./components/OrderSidebar";
import { Order } from "./types";


export default function ComenziPage() {
    const [search, setSearch] = useState("");
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState<Order | null>(null);

    const searchParams = useSearchParams();
    const statusFilter = searchParams.get("status") || "";

    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [calendarOpen, setCalendarOpen] = useState(false);

    const fetchOrders = useCallback(async () => {
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
            const cleanedSearch = search.trim().replace(/[&|!():*]/g, "");
            const tsQuery = cleanedSearch
                .split(/\s+/)
                .filter(Boolean)
                .map((term) => `${term}:*`)
                .join(" & ");

            if (tsQuery) {
                query = query.textSearch(
                    "search_vector",
                    tsQuery,
                    {
                        config: "romanian",
                        type: "tsquery",
                    } as any,
                );
            }
        }

        if (statusFilter) {
            query = query.eq("status", statusFilter);
        }

        if (dateRange?.from && dateRange?.to) {
            const fromStr = dateRange.from.toISOString().slice(0, 10);
            const toStr = dateRange.to.toISOString().slice(0, 10);
            query = query.gte("date_created", fromStr).lte("date_created", toStr);
        } else if (dateRange?.from) {
            const fromStr = dateRange.from.toISOString().slice(0, 10);
            query = query.gte("date_created", fromStr);
        } else if (dateRange?.to) {
            const toStr = dateRange.to.toISOString().slice(0, 10);
            query = query.lte("date_created", toStr);
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
    }, [search, statusFilter, dateRange]);

    useEffect(() => {
        fetchOrders();

        const supabase = createClient();
        const channel = supabase
            .channel('orders')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'orders' },
                () => {
                    fetchOrders();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchOrders]);

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

    // Helper for label
    const getDateLabel = () => {
        if (dateRange?.from && dateRange?.to) {
            return `${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`;
        } else if (dateRange?.from) {
            return `De la ${dateRange.from.toLocaleDateString()}`;
        } else if (dateRange?.to) {
            return `Până la ${dateRange.to.toLocaleDateString()}`;
        }
        return "Filtru: toate datele";
    };

    const clearDateFilter = () => setDateRange(undefined);

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
                    <div className="flex items-center gap-2">
                        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={dateRange?.from || dateRange?.to ? "outline" : "secondary"}
                                    className="min-w-[180px] justify-start text-left"
                                >
                                    <span className={dateRange?.from || dateRange?.to ? "" : "text-muted-foreground"}>
                                        {getDateLabel()}
                                    </span>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent align="start" className="w-auto p-0">
                                <Calendar
                                    mode="range"
                                    selected={dateRange}
                                    onSelect={range => {
                                        setDateRange(range);
                                        if (range?.from && range?.to) setCalendarOpen(false);
                                    }}
                                    numberOfMonths={2}
                                    className="rounded-md border shadow-sm"
                                    captionLayout="dropdown"
                                />
                            </PopoverContent>
                        </Popover>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={clearDateFilter}
                            title="Șterge filtrul de dată"
                            className="ml-1"
                            disabled={!dateRange?.from && !dateRange?.to}
                        >
                            ✕
                        </Button>
                    </div>
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