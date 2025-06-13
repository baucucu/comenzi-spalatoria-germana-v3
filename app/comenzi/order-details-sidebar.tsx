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
import { cn } from "@/lib/utils";

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
    { value: "OP", label: "Transfer bancar" },
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
            console.error("Error updating payment method:", error);
            toast.error("Nu am putut actualiza metoda de plată");
            return;
        }

        toast.success("Metodă de plată actualizată cu succes");
    };

    const handleDiscountChange = async (discountPercent: string) => {
        if (!order) return;

        const discount = parseInt(discountPercent, 10);
        const newTotal = order.total_comanda_fara_discount * (1 - discount / 100);

        setIsLoading(true);
        const { error } = await supabase
            .from("orders")
            .update({
                total_comanda_cu_discount: newTotal
            })
            .eq("id", order.id);

        setIsLoading(false);

        if (error) {
            console.error("Error applying discount:", error);
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

    const currentDiscount = order.total_comanda_fara_discount !== order.total_comanda_cu_discount
        ? Math.round((1 - order.total_comanda_cu_discount / order.total_comanda_fara_discount) * 100)
        : 0;

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent className="flex flex-col p-0 w-full sm:max-w-xl">
                {/* Sticky Header */}
                <div className="sticky top-0 z-10 bg-background border-b">
                    <div className="p-4 space-y-4">
                        {/* First row */}
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-lg font-semibold">#{order.id}</span>
                                <span className="text-sm text-muted-foreground">
                                    {new Date(order.date_created).toLocaleDateString("ro-RO")}
                                </span>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                    "h-8 w-8",
                                    order.urgent ? "text-orange-500" : "text-muted-foreground"
                                )}
                                onClick={async () => {
                                    setIsLoading(true);
                                    const { error } = await supabase
                                        .from("orders")
                                        .update({ urgent: !order.urgent })
                                        .eq("id", order.id);
                                    setIsLoading(false);
                                    if (error) {
                                        toast.error("Nu am putut actualiza statusul urgent");
                                        return;
                                    }
                                    toast.success("Status urgent actualizat");
                                }}
                                disabled={isLoading}
                            >
                                <AlertTriangle className={cn("h-5 w-5", order.urgent && "fill-current")} />
                            </Button>
                            <div className="flex-1">
                                <Select
                                    defaultValue={order.status || undefined}
                                    onValueChange={handleStatusChange}
                                    disabled={isLoading}
                                >
                                    <SelectTrigger>
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
                        </div>

                        {/* Second row - Customer info */}
                        {order.customers && (
                            <div className="flex flex-wrap gap-2">
                                <Badge variant="secondary" className="flex items-center gap-1.5">
                                    <User className="w-3.5 h-3.5" />
                                    <span>{order.customers.prenume} {order.customers.nume}</span>
                                </Badge>
                                <Badge variant="secondary" className="flex items-center gap-1.5">
                                    <Phone className="w-3.5 h-3.5" />
                                    <span>{order.customers.telefon}</span>
                                </Badge>
                                <Badge variant="secondary" className="flex items-center gap-1.5">
                                    <Mail className="w-3.5 h-3.5" />
                                    <span>{order.customers.email}</span>
                                </Badge>
                            </div>
                        )}
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
                        {/* First row - Subtotal */}
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>Subtotal</span>
                            <span>{formatCurrency(order.total_comanda_fara_discount)} lei</span>
                        </div>

                        {/* Second row - Discount & Payment Method */}
                        <div className="flex items-center justify-between gap-2">
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

                            <div className="flex items-center gap-2 flex-1">
                                <Select
                                    defaultValue={currentDiscount.toString()}
                                    onValueChange={handleDiscountChange}
                                    disabled={isLoading}
                                >
                                    <SelectTrigger className="w-full">
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
                                    <span className="text-sm text-orange-500 whitespace-nowrap">
                                        -{formatCurrency(order.total_comanda_fara_discount - order.total_comanda_cu_discount)} lei
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Third row - Total */}
                        <div className="flex items-center justify-between pt-2 border-t">
                            <span className="font-medium">Total</span>
                            <span className="text-lg font-semibold">{formatCurrency(order.total_comanda_cu_discount)} lei</span>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
} 