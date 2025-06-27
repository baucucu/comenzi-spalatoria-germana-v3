'use client';
import { PageContentWrapper } from "@/components/ui/page-content-wrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState, useCallback, useMemo } from "react";
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
            .from("orders_with_totals")
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
                nume,
                prenume,
                telefon,
                email,
                adresa_colectare,
                adresa_returnare,
                subtotal_articole,
                discount_percent
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
        const mappedOrders = (data || []).map((order: any) => ({
            ...order,
            status: typeof order.status === 'string' ? order.status : (order.status ?? ''),
            customers: order.nume ? {
                nume: order.nume,
                prenume: order.prenume,
                telefon: order.telefon,
                email: order.email,
            } : null,
            adresa_colectare: order.adresa_colectare ? { adresa: order.adresa_colectare } : null,
            adresa_returnare: order.adresa_returnare ? { adresa: order.adresa_returnare } : null,
        }));
        setOrders(mappedOrders);
        setLoading(false);
    }, [search, statusFilter, dateRange]);

    // Helper: check if an order matches current filters
    const orderMatchesFilters = useCallback((order: any) => {
        // Status filter
        if (statusFilter && order.status !== statusFilter) return false;
        // Date filter
        if (dateRange?.from || dateRange?.to) {
            const orderDate = new Date(order.date_created);
            if (dateRange?.from && orderDate < new Date(dateRange.from.setHours(0, 0, 0, 0))) return false;
            if (dateRange?.to && orderDate > new Date(dateRange.to.setHours(23, 59, 59, 999))) return false;
        }
        // Search filter
        if (search.trim()) {
            const cleanedSearch = search.trim().replace(/[&|!():*]/g, "");
            const terms = cleanedSearch.split(/\s+/).filter(Boolean);
            const text = [order.nume, order.prenume, order.telefon, order.email, order.id].join(" ").toLowerCase();
            if (!terms.every(term => text.includes(term.toLowerCase()))) return false;
        }
        return true;
    }, [search, statusFilter, dateRange]);

    useEffect(() => {
        fetchOrders();
        const supabase = createClient();
        const channel = supabase
            .channel('orders')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'orders' },
                (payload) => {
                    setOrders(prevOrders => {
                        const { eventType, new: newOrder, old: oldOrder } = payload;
                        if (eventType === 'INSERT') {
                            if (orderMatchesFilters(newOrder)) {
                                // Add if not already present
                                if (!prevOrders.some(o => o.id === newOrder.id)) {
                                    const mappedOrder = {
                                        ...newOrder,
                                        status: typeof newOrder.status === 'string' ? newOrder.status : (newOrder.status ?? ''),
                                        customers: newOrder.nume ? {
                                            nume: newOrder.nume,
                                            prenume: newOrder.prenume,
                                            telefon: newOrder.telefon,
                                            email: newOrder.email,
                                        } : null,
                                        adresa_colectare: newOrder.adresa_colectare ? { adresa: newOrder.adresa_colectare } : null,
                                        adresa_returnare: newOrder.adresa_returnare ? { adresa: newOrder.adresa_returnare } : null,
                                    } as Order;
                                    return [mappedOrder, ...prevOrders];
                                }
                            }
                            return prevOrders;
                        }
                        if (eventType === 'UPDATE') {
                            // Remove if no longer matches, update if matches
                            if (!orderMatchesFilters(newOrder)) {
                                return prevOrders.filter(o => o.id !== newOrder.id);
                            }
                            const mappedOrder = {
                                ...newOrder,
                                status: typeof newOrder.status === 'string' ? newOrder.status : (newOrder.status ?? ''),
                                customers: newOrder.nume ? {
                                    nume: newOrder.nume,
                                    prenume: newOrder.prenume,
                                    telefon: newOrder.telefon,
                                    email: newOrder.email,
                                } : null,
                                adresa_colectare: newOrder.adresa_colectare ? { adresa: newOrder.adresa_colectare } : null,
                                adresa_returnare: newOrder.adresa_returnare ? { adresa: newOrder.adresa_returnare } : null,
                            } as Order;
                            return prevOrders.map(o =>
                                o.id === newOrder.id ? mappedOrder : o
                            );
                        }
                        if (eventType === 'DELETE') {
                            return prevOrders.filter(o => o.id !== oldOrder.id);
                        }
                        return prevOrders;
                    });
                }
            )
            .subscribe();
        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchOrders, orderMatchesFilters]);

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
        // No fetchOrders here; real-time will update the list
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
                    orderId={editingOrder?.id ?? null}
                    onSaved={handleSaved}
                />
            </div>
        </PageContentWrapper>
    );
} 