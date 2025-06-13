"use client";

import { AlertTriangle, Calendar, ChevronDown, CreditCard, FileText, Mail, Package, Phone, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { Order } from "./orders-table";

interface OrderDetailsSidebarProps {
    order: Order | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onEdit?: (order: Order) => void;
    onDelete?: (order: Order) => void;
}

export function OrderDetailsSidebar({
    order,
    isOpen,
    onOpenChange,
    onEdit,
    onDelete
}: OrderDetailsSidebarProps) {
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

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent className="flex flex-col p-0 w-full sm:max-w-xl">
                {/* Sticky Header */}
                <div className="sticky top-0 z-10 bg-background border-b">
                    <div className="p-6">
                        <SheetHeader>
                            <div className="flex items-center justify-between">
                                <SheetTitle>Comanda #{order.id}</SheetTitle>
                                {order.urgent && (
                                    <Badge variant="outline" className="text-orange-500 border-orange-500">
                                        <AlertTriangle className="w-4 h-4 mr-1" />
                                        Urgentă
                                    </Badge>
                                )}
                            </div>
                        </SheetHeader>

                        <div className="mt-4">
                            {order.status && (
                                <Badge className="text-white text-lg bg-primary">
                                    {order.status}
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto">
                    <div className="p-6 space-y-6">
                        {/* Financial Details */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                <CreditCard className="w-4 h-4" />
                                Detalii Financiare
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Inițial</p>
                                    <p className="font-medium">{formatCurrency(order.total_comanda)} lei</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Final</p>
                                    <p className="font-medium">{formatCurrency(order.total_comanda_cu_discount)} lei</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Metodă Plată</p>
                                    <p>{order.payment_method || "-"}</p>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Customer Details */}
                        {order.customers && (
                            <>
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        Detalii Client
                                    </h3>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">
                                                {order.customers.prenume} {order.customers.nume}
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            <Badge variant="outline" className="flex items-center gap-1">
                                                <Phone className="w-3 h-3" />
                                                {order.customers.telefon}
                                            </Badge>
                                            <Badge variant="outline" className="flex items-center gap-1">
                                                <Mail className="w-3 h-3" />
                                                {order.customers.email}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                                <Separator />
                            </>
                        )}

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
                <div className="sticky bottom-0 z-10 bg-background border-t p-6">
                    <div className="flex gap-2">
                        <Button onClick={() => onEdit?.(order)} className="flex-1">
                            Editează Comanda
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                if (onDelete) {
                                    onDelete(order);
                                    onOpenChange(false);
                                }
                            }}
                            className="flex-1"
                        >
                            Șterge Comanda
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
} 