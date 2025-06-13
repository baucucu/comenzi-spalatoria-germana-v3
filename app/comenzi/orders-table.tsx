"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Mail, Phone, User, AlertTriangle, Calendar, Package, CreditCard, FileText, ChevronDown, CalendarIcon, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface Service {
    id: number;
    name: string;
    price: number;
    category_id: number;
    service_type_id: number;
    categories: { name: string };
    service_types: { name: string };
}

interface OrderService {
    id: number;
    order_id: number;
    service_id: number;
    quantity: number;
    price: number;
    subtotal: number;
    services: Service;
}

interface Customer {
    id: string;
    nume: string;
    prenume: string;
    email: string;
    telefon: string;
}

interface Discount {
    id: number;
    name: string;
    discount_value: number;
    discount_type: 'percentage' | 'fixed';
}

interface OrderStatus {
    id: number;
    name: string;
    label: string;
    color: string;
    position: number;
    status_final: boolean;
}

export interface Order {
    id: number;
    date_created: string;
    status: string | null;
    total_comanda: number;
    total_comanda_cu_discount: number;
    customer_id: string | null;
    urgent: boolean | null;
    pickup_date: string | null;
    delivery_date: string | null;
    actual_pickup_date: string | null;
    actual_delivery_date: string | null;
    payment_status: string | null;
    payment_method: string | null;
    notes: string | null;
    order_services: OrderService[];
    customers: Customer | null;
}

interface OrdersTableProps {
    orders: Order[];
    searchTerm: string;
    dateRange: DateRange | undefined;
    onEdit?: (order: Order) => void;
    onDelete?: (order: Order) => void;
    onSearchChange?: (value: string) => void;
    onDateRangeChange?: (range: DateRange | undefined) => void;
}

export function OrdersTable({
    orders,
    searchTerm,
    dateRange,
    onEdit,
    onDelete,
    onSearchChange,
    onDateRangeChange
}: OrdersTableProps) {
    const [customers, setCustomers] = useState<{ [key: string]: Customer }>({});
    const [statuses, setStatuses] = useState<{ [key: string]: OrderStatus }>({});
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
        financial: true,
        items: true,
        dates: true,
        notes: true
    });

    // Fetch order statuses
    useEffect(() => {
        const fetchStatuses = async () => {
            const supabase = createClient();
            const { data } = await supabase
                .from("order_statuses")
                .select("*")
                .order("position");

            if (data) {
                const statusMap = data.reduce((acc, status) => {
                    acc[status.name] = status;
                    return acc;
                }, {} as { [key: string]: OrderStatus });
                setStatuses(statusMap);
            }
        };

        fetchStatuses();
    }, []);

    // Fetch customer information
    useEffect(() => {
        const fetchCustomers = async () => {
            const customerIds = orders.map(order => order.customer_id).filter(Boolean) as string[];
            if (customerIds.length === 0) return;

            const supabase = createClient();
            const { data } = await supabase
                .from("customers")
                .select("id, nume, prenume, email, telefon")
                .in("id", customerIds);

            if (data) {
                const customerMap = data.reduce((acc, customer) => {
                    acc[customer.id] = customer;
                    return acc;
                }, {} as { [key: string]: Customer });
                setCustomers(customerMap);
            }
        };

        fetchCustomers();
    }, [orders]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("ro-RO", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    const formatDate = (date: string | null) => {
        if (!date) return "-";
        return new Date(date).toLocaleDateString("ro-RO", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const toggleSection = (section: string) => {
        setOpenSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const handleOrderClick = (order: Order) => {
        setSelectedOrder(order);
        setIsSheetOpen(true);
    };

    return (
        <>
            <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-2 mt-2 gap-4">
                    <Input
                        placeholder="Cauta comenzi..."
                        value={searchTerm}
                        onChange={e => onSearchChange ? onSearchChange(e.target.value) : undefined}
                        className="max-w-sm"
                    />
                    <div className="flex items-center gap-2">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "justify-start text-left font-normal",
                                        !dateRange && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateRange?.from ? (
                                        dateRange.to ? (
                                            <>
                                                {format(dateRange.from, "d MMM yyyy", { locale: ro })} -{" "}
                                                {format(dateRange.to, "d MMM yyyy", { locale: ro })}
                                            </>
                                        ) : (
                                            format(dateRange.from, "d MMM yyyy", { locale: ro })
                                        )
                                    ) : (
                                        <span>Filtreaza dupa data</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="end">
                                <CalendarComponent
                                    initialFocus
                                    mode="range"
                                    defaultMonth={dateRange?.from}
                                    selected={dateRange}
                                    onSelect={onDateRangeChange}
                                    numberOfMonths={2}
                                    locale={ro}
                                />
                            </PopoverContent>
                        </Popover>
                        {dateRange && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onDateRangeChange?.(undefined)}
                                className="h-9 w-9"
                            >
                                <X className="h-4 w-4" />
                                <span className="sr-only">Sterge filtru data</span>
                            </Button>
                        )}
                    </div>
                </div>
                <div className="flex-1 min-h-0 overflow-y-auto">
                    <Table className="h-full">
                        <TableHeader className="sticky top-0 z-10 bg-white">
                            <TableRow>
                                <TableHead className="sticky top-0 z-10 bg-white">ID</TableHead>
                                <TableHead className="sticky top-0 z-10 bg-white">Data</TableHead>
                                <TableHead className="sticky top-0 z-10 bg-white">Status</TableHead>
                                <TableHead className="sticky top-0 z-10 bg-white">Total</TableHead>
                                <TableHead className="sticky top-0 z-10 bg-white">Client</TableHead>
                                <TableHead className="sticky top-0 z-10 bg-white">Urgent</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {Array.isArray(orders) && orders.map((order) => {
                                const customer = order.customer_id ? customers[order.customer_id] : null;
                                const status = order.status ? statuses[order.status] : null;
                                return (
                                    <TableRow
                                        key={order.id}
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => handleOrderClick(order)}
                                    >
                                        <TableCell>{order.id}</TableCell>
                                        <TableCell>{order.date_created ? new Date(order.date_created).toLocaleDateString() : ""}</TableCell>
                                        <TableCell>
                                            {status && (
                                                <Badge className={`${status.color} text-white`}>
                                                    {status.label}
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>{formatCurrency(order.total_comanda_cu_discount)} lei</TableCell>
                                        <TableCell>
                                            {customer ? (
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-1">
                                                        <User className="w-4 h-4" />
                                                        <span>{customer.prenume} {customer.nume}</span>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <Badge variant="outline" className="flex items-center gap-1">
                                                            <Phone className="w-3 h-3" />
                                                            {customer.telefon}
                                                        </Badge>
                                                        <Badge variant="outline" className="flex items-center gap-1">
                                                            <Mail className="w-3 h-3" />
                                                            {customer.email}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground">Fără client</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {order.urgent && (
                                                <AlertTriangle className="w-5 h-5 text-orange-500" />
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
                    {selectedOrder && (
                        <>
                            <SheetHeader>
                                <div className="flex items-center justify-between">
                                    <SheetTitle>Comanda #{selectedOrder.id}</SheetTitle>
                                    {selectedOrder.urgent && (
                                        <Badge variant="outline" className="text-orange-500 border-orange-500">
                                            <AlertTriangle className="w-4 h-4 mr-1" />
                                            Urgentă
                                        </Badge>
                                    )}
                                </div>
                            </SheetHeader>

                            <div className="mt-6 space-y-6">
                                {/* Status Section */}
                                <div>
                                    {selectedOrder.status && statuses[selectedOrder.status] && (
                                        <Badge className={`${statuses[selectedOrder.status].color} text-white text-lg`}>
                                            {statuses[selectedOrder.status].label}
                                        </Badge>
                                    )}
                                </div>

                                <Separator />

                                {/* Financial Details Section */}
                                <Collapsible open={openSections.financial} onOpenChange={() => toggleSection("financial")}>
                                    <div className="flex items-center gap-2">
                                        <CollapsibleTrigger asChild>
                                            <Button variant="ghost" size="sm" className="w-full flex items-center justify-between p-0">
                                                <div className="flex items-center gap-2">
                                                    <CreditCard className="w-4 h-4" />
                                                    <h3 className="font-semibold text-lg">Detalii Financiare</h3>
                                                </div>
                                                <ChevronDown className="w-4 h-4" />
                                            </Button>
                                        </CollapsibleTrigger>
                                    </div>
                                    <CollapsibleContent className="pt-2">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-muted-foreground">Total Inițial</p>
                                                <p className="font-medium">{formatCurrency(selectedOrder.total_comanda)} lei</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Total Final</p>
                                                <p className="font-bold text-lg">{formatCurrency(selectedOrder.total_comanda_cu_discount)} lei</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Metodă Plată</p>
                                                <p>{selectedOrder.payment_method || "-"}</p>
                                            </div>
                                        </div>
                                    </CollapsibleContent>
                                </Collapsible>

                                <Separator />

                                {/* Customer Details Section */}
                                {selectedOrder.customers && (
                                    <>
                                        <div className="space-y-4">
                                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                                <User className="w-4 h-4" />
                                                Detalii Client
                                            </h3>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">
                                                        {selectedOrder.customers.prenume} {selectedOrder.customers.nume}
                                                    </span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Badge variant="outline" className="flex items-center gap-1">
                                                        <Phone className="w-3 h-3" />
                                                        {selectedOrder.customers.telefon}
                                                    </Badge>
                                                    <Badge variant="outline" className="flex items-center gap-1">
                                                        <Mail className="w-3 h-3" />
                                                        {selectedOrder.customers.email}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>

                                        <Separator />
                                    </>
                                )}

                                {/* Order Items Section */}
                                <Collapsible open={openSections.items} onOpenChange={() => toggleSection("items")}>
                                    <div className="flex items-center gap-2">
                                        <CollapsibleTrigger asChild>
                                            <Button variant="ghost" size="sm" className="w-full flex items-center justify-between p-0">
                                                <div className="flex items-center gap-2">
                                                    <Package className="w-4 h-4" />
                                                    <h3 className="font-semibold text-lg">Articole Comandă</h3>
                                                </div>
                                                <ChevronDown className="w-4 h-4" />
                                            </Button>
                                        </CollapsibleTrigger>
                                    </div>
                                    <CollapsibleContent className="pt-2">
                                        <div className="space-y-4">
                                            {selectedOrder.order_services.map((item) => (
                                                <div key={item.id} className="border rounded-lg p-3 space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="font-medium">{item.services.name}</p>
                                                            <div className="flex gap-2 mt-1">
                                                                <Badge variant="outline">{item.services.categories.name}</Badge>
                                                                <Badge variant="outline">{item.services.service_types.name}</Badge>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-sm text-muted-foreground">
                                                                {item.quantity} x {formatCurrency(item.price)} lei
                                                            </p>
                                                            <p className="font-bold">{formatCurrency(item.subtotal)} lei</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CollapsibleContent>
                                </Collapsible>

                                <Separator />

                                {/* Dates Section */}
                                <Collapsible open={openSections.dates} onOpenChange={() => toggleSection("dates")}>
                                    <div className="flex items-center gap-2">
                                        <CollapsibleTrigger asChild>
                                            <Button variant="ghost" size="sm" className="w-full flex items-center justify-between p-0">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4" />
                                                    <h3 className="font-semibold text-lg">Date Importante</h3>
                                                </div>
                                                <ChevronDown className="w-4 h-4" />
                                            </Button>
                                        </CollapsibleTrigger>
                                    </div>
                                    <CollapsibleContent className="pt-2">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-muted-foreground">Creat La</p>
                                                <p>{formatDate(selectedOrder.date_created)}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Data Ridicare</p>
                                                <p>{formatDate(selectedOrder.pickup_date)}</p>
                                            </div>
                                            {selectedOrder.actual_pickup_date && (
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Ridicat La</p>
                                                    <p>{formatDate(selectedOrder.actual_pickup_date)}</p>
                                                </div>
                                            )}
                                            {selectedOrder.delivery_date && (
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Data Livrare</p>
                                                    <p>{formatDate(selectedOrder.delivery_date)}</p>
                                                </div>
                                            )}
                                            {selectedOrder.actual_delivery_date && (
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Livrat La</p>
                                                    <p>{formatDate(selectedOrder.actual_delivery_date)}</p>
                                                </div>
                                            )}
                                        </div>
                                    </CollapsibleContent>
                                </Collapsible>

                                {selectedOrder.notes && (
                                    <>
                                        <Separator />

                                        {/* Notes Section */}
                                        <Collapsible open={openSections.notes} onOpenChange={() => toggleSection("notes")}>
                                            <div className="flex items-center gap-2">
                                                <CollapsibleTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="w-full flex items-center justify-between p-0">
                                                        <div className="flex items-center gap-2">
                                                            <FileText className="w-4 h-4" />
                                                            <h3 className="font-semibold text-lg">Note</h3>
                                                        </div>
                                                        <ChevronDown className="w-4 h-4" />
                                                    </Button>
                                                </CollapsibleTrigger>
                                            </div>
                                            <CollapsibleContent className="pt-2">
                                                <p className="whitespace-pre-wrap">{selectedOrder.notes}</p>
                                            </CollapsibleContent>
                                        </Collapsible>
                                    </>
                                )}

                                {/* Action Buttons */}
                                <div className="flex gap-2 pt-6">
                                    <Button onClick={() => onEdit && onEdit(selectedOrder)} className="flex-1">
                                        Editează Comanda
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={() => {
                                            if (onDelete) {
                                                onDelete(selectedOrder);
                                                setIsSheetOpen(false);
                                            }
                                        }}
                                        className="flex-1"
                                    >
                                        Șterge Comanda
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </SheetContent>
            </Sheet>
        </>
    );
} 