"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Calendar, ChevronDown, CreditCard, FileText, Mail, Package, Phone, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import type { Order } from "./orders-table";

interface OrderStatus {
    id: number;
    name: string;
    label: string;
    color: string;
    position: number;
    status_final: boolean;
}

const PAYMENT_METHODS = [
    { value: "cash", label: "Cash" },
    { value: "card", label: "Card" },
    { value: "transfer", label: "Transfer bancar" },
];

const DISCOUNT_OPTIONS = [
    { value: 0, label: "Fără discount" },
    { value: 5, label: "5%" },
    { value: 10, label: "10%" },
    { value: 15, label: "15%" },
    { value: 20, label: "20%" },
];

interface OrderDetailsSidebarProps {
    order: Order | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function OrderDetailsSidebar({
    order,
    isOpen,
    onOpenChange,
}: OrderDetailsSidebarProps) {
    const [statuses, setStatuses] = useState<OrderStatus[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        const fetchStatuses = async () => {
            const { data, error } = await supabase
                .from("order_statuses")
                .select("*")
                .order("position");

            if (error) {
                console.error("Error fetching statuses:", error);
                return;
            }

            if (data) {
                setStatuses(data);
            }
        };

        fetchStatuses();
    }, []);

    const handleStatusChange = async (newStatus: string) => {
        if (!order) return;

        setIsLoading(true);
        const { error } = await supabase
            .from("orders")
            .update({ status: newStatus })
            .eq("id", order.id);

        setIsLoading(false);

        if (error) {
            toast.error("Nu am putut actualiza statusul comenzii");
            return;
        }

        toast.success("Status actualizat cu succes");
    };

    const handlePaymentMethodChange = async (newMethod: string) => {
        if (!order) return;

        setIsLoading(true);
        const { error } = await supabase
            .from("orders")
            .update({ payment_method: newMethod })
            .eq("id", order.id);

        setIsLoading(false);

        if (error) {
            toast.error("Nu am putut actualiza metoda de plată");
            return;
        }

        toast.success("Metodă de plată actualizată cu succes");
    };

    const handleDiscountChange = async (discountPercent: string) => {
        if (!order) return;

        const discount = parseInt(discountPercent, 10);
        const newTotal = order.total_comanda * (1 - discount / 100);

        setIsLoading(true);
        const { error } = await supabase
            .from("orders")
            .update({ total_comanda_cu_discount: newTotal })
            .eq("id", order.id);

        setIsLoading(false);

        if (error) {
            toast.error("Nu am putut aplica discountul");
            return;
        }

        toast.success("Discount aplicat cu succes");
    };

    if (!order) return null;

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

    const currentDiscount = order.total_comanda !== order.total_comanda_cu_discount
        ? Math.round((1 - order.total_comanda_cu_discount / order.total_comanda) * 100)
        : 0;

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent className="flex flex-col p-0 w-full sm:max-w-xl">
                {/* Sticky Header */}
                <div className="sticky top-0 z-10 bg-background border-b">
                    <div className="p-4">
                        <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-2">
                                    <SheetTitle className="text-xl">#{order.id}</SheetTitle>
                                    {order.urgent && (
                                        <Badge variant="outline" className="text-orange-500 border-orange-500">
                                            <AlertTriangle className="w-3.5 h-3.5" />
                                        </Badge>
                                    )}
                                </div>
                                <Select
                                    defaultValue={order.status || undefined}
                                    onValueChange={handleStatusChange}
                                    disabled={isLoading}
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Selectează status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {statuses.map((status) => (
                                            <SelectItem key={status.name} value={status.name}>
                                                <div className="flex items-center gap-2">
                                                    <Badge className={`${status.color} text-white`}>
                                                        {status.label}
                                                    </Badge>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            {order.customers && (
                                <div className="text-right space-y-1">
                                    <p className="font-medium">
                                        {order.customers.prenume} {order.customers.nume}
                                    </p>
                                    <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <Phone className="w-3.5 h-3.5" />
                                            <span>{order.customers.telefon}</span>
                                        </div>
                                        <div className="flex items-center justify-end gap-1.5">
                                            <Mail className="w-3.5 h-3.5" />
                                            <span>{order.customers.email}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto">
                    <div className="p-6 space-y-6">
                        {/* Order Items */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                <Package className="w-4 h-4" />
                                Articole Comandă
                            </h3>
                            <div className="space-y-4">
                                {order.order_services.map((item) => (
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
                        </div>

                        <Separator />

                        {/* Important Dates */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Date Importante
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Creat La</p>
                                    <p>{formatDate(order.date_created)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Data Ridicare</p>
                                    <p>{formatDate(order.pickup_date)}</p>
                                </div>
                                {order.actual_pickup_date && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Ridicat La</p>
                                        <p>{formatDate(order.actual_pickup_date)}</p>
                                    </div>
                                )}
                                {order.delivery_date && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Data Livrare</p>
                                        <p>{formatDate(order.delivery_date)}</p>
                                    </div>
                                )}
                                {order.actual_delivery_date && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Livrat La</p>
                                        <p>{formatDate(order.actual_delivery_date)}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Notes */}
                        {order.notes && (
                            <>
                                <Separator />
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg flex items-center gap-2">
                                        <FileText className="w-4 h-4" />
                                        Note
                                    </h3>
                                    <p className="whitespace-pre-wrap">{order.notes}</p>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Sticky Footer */}
                <div className="sticky bottom-0 z-10 bg-background border-t">
                    <div className="p-4 space-y-3">
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>Subtotal</span>
                            <span>{formatCurrency(order.total_comanda)} lei</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <Select
                                defaultValue={currentDiscount.toString()}
                                onValueChange={handleDiscountChange}
                                disabled={isLoading}
                            >
                                <SelectTrigger className="w-[120px]">
                                    <SelectValue placeholder="Discount" />
                                </SelectTrigger>
                                <SelectContent>
                                    {DISCOUNT_OPTIONS.map((option) => (
                                        <SelectItem key={option.value} value={option.value.toString()}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {currentDiscount > 0 && (
                                <span className="text-sm text-orange-500">
                                    -{formatCurrency(order.total_comanda - order.total_comanda_cu_discount)} lei
                                </span>
                            )}
                        </div>
                        <div className="flex items-center justify-between font-medium">
                            <span>Total</span>
                            <span className="text-lg">{formatCurrency(order.total_comanda_cu_discount)} lei</span>
                        </div>
                        <div className="flex items-center justify-between text-sm pt-2 border-t">
                            <Select
                                defaultValue={order.payment_method || undefined}
                                onValueChange={handlePaymentMethodChange}
                                disabled={isLoading}
                            >
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Metodă plată" />
                                </SelectTrigger>
                                <SelectContent>
                                    {PAYMENT_METHODS.map((method) => (
                                        <SelectItem key={method.value} value={method.value}>
                                            {method.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {order.payment_method && (
                                <Badge variant="outline" className="font-medium">
                                    {PAYMENT_METHODS.find(m => m.value === order.payment_method)?.label || order.payment_method}
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
} 