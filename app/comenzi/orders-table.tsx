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
import { OrderDetailsSidebar } from "./order-details-sidebar";

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
    onSearchChange?: (value: string) => void;
    onDateRangeChange?: (date: DateRange | undefined) => void;
}

export function OrdersTable({
    orders,
    searchTerm,
    dateRange,
    onSearchChange,
    onDateRangeChange
}: OrdersTableProps) {
    const [customers, setCustomers] = useState<{ [key: string]: Customer }>({});
    const [statuses, setStatuses] = useState<{ [key: string]: OrderStatus }>({});
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

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

    const handleOrderClick = (order: Order) => {
        setSelectedOrder(order);
        setIsSheetOpen(true);
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <Input
                        placeholder="Caută după status, client sau telefon..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange?.(e.target.value)}
                        className="max-w-sm"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    "justify-start text-left font-normal w-[240px]",
                                    !dateRange && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateRange?.from ? (
                                    dateRange.to ? (
                                        <>
                                            {format(dateRange.from, "LLL dd, y")} -{" "}
                                            {format(dateRange.to, "LLL dd, y")}
                                        </>
                                    ) : (
                                        format(dateRange.from, "LLL dd, y")
                                    )
                                ) : (
                                    <span>Filtrează după dată</span>
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
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Data</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Client</TableHead>
                            <TableHead>Urgent</TableHead>
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

            <OrderDetailsSidebar
                order={selectedOrder}
                isOpen={isSheetOpen}
                onOpenChange={setIsSheetOpen}
            />
        </div>
    );
} 