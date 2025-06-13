"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Calendar, ChevronDown, CreditCard, FileText, Mail, Package, Phone, User, Search, Pencil, X, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import type { Order } from "./orders-table";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { ClientForm } from "@/app/clienti/client-form";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

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
    onOrderUpdated?: () => void;
}

// AddressDialog component (inline for now)
function AddressDialog({ open, onOpenChange, initial, onSave, loading }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initial?: { adresa: string; detalii?: string };
    onSave: (adresa: string, detalii: string) => Promise<void>;
    loading?: boolean;
}) {
    const [adresa, setAdresa] = useState(initial?.adresa || "");
    const [detalii, setDetalii] = useState(initial?.detalii || "");
    const [saving, setSaving] = useState(false);
    useEffect(() => {
        setAdresa(initial?.adresa || "");
        setDetalii(initial?.detalii || "");
    }, [initial, open]);
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{initial ? "Editează adresa" : "Adaugă adresă nouă"}</DialogTitle>
                    <DialogDescription>
                        Completează adresa și detaliile suplimentare (bloc, scară, apartament, etc).
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium mb-1">Adresă</label>
                        <Input value={adresa} onChange={e => setAdresa(e.target.value)} placeholder="Strada, număr..." required disabled={saving || loading} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Detalii</label>
                        <Input value={detalii} onChange={e => setDetalii(e.target.value)} placeholder="Bloc, scară, apartament, etaj, interfon, etc" disabled={saving || loading} />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline" disabled={saving || loading}>Anulează</Button>
                    </DialogClose>
                    <Button type="button" onClick={async () => {
                        setSaving(true);
                        await onSave(adresa, detalii);
                        setSaving(false);
                        onOpenChange(false);
                    }} disabled={saving || loading || !adresa.trim()}>
                        Salvează
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function OrderDetailsSidebar({
    order,
    isOpen,
    onOpenChange,
    onOrderUpdated,
}: OrderDetailsSidebarProps) {
    const [statuses, setStatuses] = useState<OrderStatus[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [addresses, setAddresses] = useState<{ id: number; adresa: string; detalii?: string }[]>([]);
    const [customersList, setCustomersList] = useState<{ id: string; prenume: string; nume: string; telefon: string; email?: string }[]>([]);
    const [customerPopoverOpen, setCustomerPopoverOpen] = useState(false);
    const [customerSearch, setCustomerSearch] = useState("");
    const [pickupDialogOpen, setPickupDialogOpen] = useState(false);
    const [deliveryDialogOpen, setDeliveryDialogOpen] = useState(false);
    const [editClientDialogOpen, setEditClientDialogOpen] = useState(false);
    const [addClientDialogOpen, setAddClientDialogOpen] = useState(false);
    const [refreshClient, setRefreshClient] = useState(0);
    const [pickupPopoverOpen, setPickupPopoverOpen] = useState(false);
    const [deliveryPopoverOpen, setDeliveryPopoverOpen] = useState(false);
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

    useEffect(() => {
        const fetchAddresses = async () => {
            if (order?.customers?.id) {
                const { data, error } = await supabase
                    .from("addresses")
                    .select("id, adresa, detalii")
                    .eq("customer_id", order.customers.id);
                if (!error && data) setAddresses(data);
            } else {
                setAddresses([]);
            }
        };
        fetchAddresses();
    }, [order?.customers?.id]);

    useEffect(() => {
        const fetchCustomers = async () => {
            const { data, error } = await supabase
                .from("customers")
                .select("id, prenume, nume, telefon, email");
            if (!error && data) setCustomersList(data);
        };
        fetchCustomers();
    }, []);

    useEffect(() => {
        const fetchAddresses = async () => {
            if (order?.customers?.id) {
                const { data, error } = await supabase
                    .from("addresses")
                    .select("id, adresa, detalii")
                    .eq("customer_id", order.customers.id);
                if (!error && data) setAddresses(data);
            } else {
                setAddresses([]);
            }
        };
        fetchAddresses();
    }, [order?.customers?.id, refreshClient]);

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

    const handleUrgencyChange = async (value: string) => {
        if (!order) return;
        setIsLoading(true);
        const { error } = await supabase
            .from("orders")
            .update({ urgent: value === "urgent" })
            .eq("id", order.id);
        setIsLoading(false);
        if (error) toast.error("Nu am putut actualiza urgenta");
        else toast.success("Urgenta actualizata");
    };

    const handlePickupAddressChange = async (value: string) => {
        if (!order) return;
        setIsLoading(true);
        const { error } = await supabase
            .from("orders")
            .update({ adresa_colectare_id: value === "null" ? null : Number(value) })
            .eq("id", order.id);
        setIsLoading(false);
        if (error) toast.error("Nu am putut actualiza adresa de colectare");
        else {
            toast.success("Adresa de colectare actualizata");
            if (typeof onOrderUpdated === "function") onOrderUpdated();
        }
    };

    const handleDeliveryAddressChange = async (value: string) => {
        if (!order) return;
        setIsLoading(true);
        const { error } = await supabase
            .from("orders")
            .update({ adresa_returnare_id: value === "null" ? null : Number(value) })
            .eq("id", order.id);
        setIsLoading(false);
        if (error) toast.error("Nu am putut actualiza adresa de livrare");
        else {
            toast.success("Adresa de livrare actualizata");
            if (typeof onOrderUpdated === "function") onOrderUpdated();
        }
    };

    const handleCustomerChange = async (value: string) => {
        if (!order) return;
        setIsLoading(true);
        const { error } = await supabase
            .from("orders")
            .update({ customer_id: value })
            .eq("id", order.id);
        setIsLoading(false);
        if (error) toast.error("Nu am putut actualiza clientul");
        else {
            toast.success("Client actualizat");
            if (typeof onOrderUpdated === "function") onOrderUpdated();
        }
    };

    const handleClearClient = async () => {
        if (!order) return;
        setIsLoading(true);
        const { error } = await supabase
            .from("orders")
            .update({ customer_id: null, adresa_colectare_id: null, adresa_returnare_id: null })
            .eq("id", order.id);
        setIsLoading(false);
        if (!error) {
            setRefreshClient(x => x + 1);
        }
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

    // Filtered customers for search
    const filteredCustomers = customersList.filter(c => {
        const q = customerSearch.toLowerCase();
        return (
            c.prenume.toLowerCase().includes(q) ||
            c.nume.toLowerCase().includes(q) ||
            (c.email && c.email.toLowerCase().includes(q)) ||
            (c.telefon && c.telefon.toLowerCase().includes(q))
        );
    });

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent className="flex flex-col p-0 w-full sm:max-w-xl">
                <SheetHeader>
                    <SheetTitle><VisuallyHidden>Detalii comandă</VisuallyHidden></SheetTitle>
                </SheetHeader>
                <Tabs defaultValue="details" className="w-full h-full flex flex-col flex-1">
                    <TabsList className="w-full mb-2">
                        <TabsTrigger value="details" className="flex-1">Detalii comandă</TabsTrigger>
                        <TabsTrigger value="items" className="flex-1">Articole</TabsTrigger>
                    </TabsList>
                    <TabsContent value="details" className="flex-1">
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {/* First row: order #, date */}
                            <div className="flex items-center gap-3 flex-wrap">
                                <span className="text-lg font-semibold">#{order.id}</span>
                                <span className="text-sm text-muted-foreground">
                                    {new Date(order.date_created).toLocaleDateString("ro-RO")}
                                </span>
                            </div>
                            {/* Second row: urgent and status selectors */}
                            <div className="flex items-center gap-2 flex-wrap">
                                <Select
                                    defaultValue={order.urgent ? "urgent" : "normal"}
                                    onValueChange={handleUrgencyChange}
                                    disabled={isLoading}
                                >
                                    <SelectTrigger className="w-[110px]">
                                        <SelectValue placeholder="Urgenta" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="normal">Normal</SelectItem>
                                        <SelectItem value="urgent">Urgent</SelectItem>
                                    </SelectContent>
                                </Select>
                                <div className="flex-1 min-w-[180px]">
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
                            {/* Client selector */}
                            <div className="flex flex-col gap-1 w-full">
                                <span className="text-sm font-medium">Client</span>
                                {order.customers ? (
                                    <div className="flex w-full gap-2 items-stretch">
                                        <div className="flex-1 border rounded-md px-3 py-2 bg-background flex flex-col gap-1 justify-center">
                                            <Badge variant="secondary" className="flex items-center gap-1.5">
                                                <User className="w-3.5 h-3.5" />
                                                <span>{order.customers.prenume} {order.customers.nume}</span>
                                            </Badge>
                                            <Badge variant="secondary" className="flex items-center gap-1.5">
                                                <Phone className="w-3.5 h-3.5" />
                                                <span>{order.customers.telefon}</span>
                                            </Badge>
                                            {order.customers.email && (
                                                <Badge variant="secondary" className="flex items-center gap-1.5">
                                                    <Mail className="w-3.5 h-3.5" />
                                                    <span>{order.customers.email}</span>
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-2 h-full justify-center" style={{ minWidth: 48 }}>
                                            <Button size="icon" variant="outline" onClick={() => setEditClientDialogOpen(true)}>
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button size="icon" variant="outline" onClick={async () => {
                                                await handleClearClient();
                                                if (typeof onOrderUpdated === "function") onOrderUpdated();
                                            }}>
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-start gap-2 w-full">
                                        <Popover open={customerPopoverOpen} onOpenChange={setCustomerPopoverOpen}>
                                            <PopoverTrigger asChild>
                                                <button
                                                    type="button"
                                                    className="w-full border rounded-md px-3 py-2 text-left bg-background hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
                                                >
                                                    <span className="text-muted-foreground">Selectează client</span>
                                                </button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[var(--radix-popover-trigger-width)] max-w-full p-2 text-sm overflow-x-auto">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Search className="w-4 h-4 text-muted-foreground" />
                                                    <Input
                                                        value={customerSearch}
                                                        onChange={e => setCustomerSearch(e.target.value)}
                                                        placeholder="Caută după nume, email, telefon"
                                                        className="h-8"
                                                        autoFocus
                                                    />
                                                </div>
                                                <div className="max-h-64 overflow-y-auto space-y-2">
                                                    {filteredCustomers.length === 0 && (
                                                        <div className="text-muted-foreground text-sm px-2 py-4 text-center">Niciun client găsit</div>
                                                    )}
                                                    {filteredCustomers.map(c => (
                                                        <button
                                                            key={c.id}
                                                            type="button"
                                                            className={cn(
                                                                "w-full text-left rounded-md px-2 py-2 hover:bg-accent",
                                                                order.customer_id === c.id && "bg-accent"
                                                            )}
                                                            onClick={async () => {
                                                                setCustomerPopoverOpen(false);
                                                                await handleCustomerChange(c.id);
                                                            }}
                                                        >
                                                            <div className="flex flex-col gap-1">
                                                                <Badge variant="secondary" className="flex items-center gap-1.5">
                                                                    <User className="w-3.5 h-3.5" />
                                                                    <span>{c.prenume} {c.nume}</span>
                                                                </Badge>
                                                                <Badge variant="secondary" className="flex items-center gap-1.5">
                                                                    <Phone className="w-3.5 h-3.5" />
                                                                    <span>{c.telefon}</span>
                                                                </Badge>
                                                                {c.email && (
                                                                    <Badge variant="secondary" className="flex items-center gap-1.5">
                                                                        <Mail className="w-3.5 h-3.5" />
                                                                        <span>{c.email}</span>
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                        <Button size="icon" variant="ghost" className="mt-1" onClick={() => setAddClientDialogOpen(true)}>
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                        {/* Add Client Dialog */}
                                        <Dialog open={addClientDialogOpen} onOpenChange={setAddClientDialogOpen}>
                                            <DialogContent className="max-w-lg w-full max-h-[90vh] overflow-y-auto">
                                                <DialogTitle><VisuallyHidden>Adaugă Client Nou</VisuallyHidden></DialogTitle>
                                                <DialogHeader>
                                                    <DialogTitle>Adaugă Client Nou</DialogTitle>
                                                </DialogHeader>
                                                <ClientForm
                                                    mode="create"
                                                    onSuccess={() => {
                                                        setAddClientDialogOpen(false);
                                                        setRefreshClient(x => x + 1);
                                                    }}
                                                />
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                )}
                            </div>
                            {/* Edit Client Dialog */}
                            <Dialog open={editClientDialogOpen} onOpenChange={setEditClientDialogOpen}>
                                <DialogContent className="max-w-lg w-full max-h-[90vh] overflow-y-auto">
                                    <DialogTitle><VisuallyHidden>Editează Client</VisuallyHidden></DialogTitle>
                                    <DialogHeader>
                                        <DialogTitle>Editează Client</DialogTitle>
                                    </DialogHeader>
                                    <ClientForm
                                        mode="edit"
                                        initialValues={
                                            order && order.customers
                                                ? {
                                                    id: order.customers.id,
                                                    prenume: order.customers.prenume ?? "",
                                                    nume: order.customers.nume ?? "",
                                                    email: order.customers.email ?? "",
                                                    telefon: order.customers.telefon ?? "",
                                                    accept_marketing_sms: order.customers.accept_marketing_sms ?? false,
                                                    accept_marketing_email: order.customers.accept_marketing_email ?? false,
                                                }
                                                : undefined
                                        }
                                        onSuccess={() => {
                                            setEditClientDialogOpen(false);
                                            setRefreshClient(x => x + 1);
                                            if (typeof onOrderUpdated === "function") onOrderUpdated();
                                        }}
                                    />
                                </DialogContent>
                            </Dialog>
                            {/* Pickup address selector */}
                            <div className="flex flex-col gap-1 w-full">
                                <span className="text-sm font-medium">Ridicare</span>
                                <Popover open={pickupPopoverOpen} onOpenChange={setPickupPopoverOpen}>
                                    <PopoverTrigger asChild>
                                        <button
                                            type="button"
                                            className={cn(
                                                "w-full border rounded-md p-3 text-left bg-muted hover:bg-accent text-sm",
                                                !order.customers && "opacity-50 cursor-not-allowed"
                                            )}
                                            disabled={!order.customers}
                                            onClick={() => setPickupPopoverOpen(true)}
                                        >
                                            {order && order.adresa_colectare_id && addresses.length > 0 ? (
                                                (() => {
                                                    const addr = addresses.find(a => String(a.id) === String(order.adresa_colectare_id));
                                                    return addr ? (
                                                        <div className="flex flex-col gap-1">
                                                            <span className="font-medium">{addr.adresa}</span>
                                                            {addr.detalii && <span className="text-xs text-muted-foreground">{addr.detalii}</span>}
                                                        </div>
                                                    ) : <span className="text-muted-foreground">Adresă necunoscută</span>;
                                                })()
                                            ) : (
                                                <span className="text-muted-foreground">În magazin</span>
                                            )}
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] max-w-full p-2 text-sm overflow-x-auto">
                                        <div className="space-y-2 max-h-64 overflow-y-auto max-w-full">
                                            <button
                                                className={cn("w-full text-left rounded-md px-2 py-2 hover:bg-accent text-sm", !order.adresa_colectare_id && "bg-accent")}
                                                onClick={() => {
                                                    handlePickupAddressChange("null");
                                                    setPickupPopoverOpen(false);
                                                }}
                                            >
                                                În magazin
                                            </button>
                                            {addresses.map(addr => (
                                                <button
                                                    key={addr.id}
                                                    className={cn("w-full text-left rounded-md px-2 py-2 hover:bg-accent text-sm", order.adresa_colectare_id === addr.id && "bg-accent")}
                                                    onClick={() => {
                                                        handlePickupAddressChange(String(addr.id));
                                                        setPickupPopoverOpen(false);
                                                    }}
                                                >
                                                    <div className="font-medium">{addr.adresa}</div>
                                                    {addr.detalii && <div className="text-xs text-muted-foreground">{addr.detalii}</div>}
                                                </button>
                                            ))}
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                            {/* Delivery address selector */}
                            <div className="flex flex-col gap-1 w-full">
                                <span className="text-sm font-medium">Livrare</span>
                                <Popover open={deliveryPopoverOpen} onOpenChange={setDeliveryPopoverOpen}>
                                    <PopoverTrigger asChild>
                                        <button
                                            type="button"
                                            className={cn(
                                                "w-full border rounded-md p-3 text-left bg-muted hover:bg-accent text-sm",
                                                !order.customers && "opacity-50 cursor-not-allowed"
                                            )}
                                            disabled={!order.customers}
                                            onClick={() => setDeliveryPopoverOpen(true)}
                                        >
                                            {order && order.adresa_returnare_id && addresses.length > 0 ? (
                                                (() => {
                                                    const addr = addresses.find(a => String(a.id) === String(order.adresa_returnare_id));
                                                    return addr ? (
                                                        <div className="flex flex-col gap-1">
                                                            <span className="font-medium">{addr.adresa}</span>
                                                            {addr.detalii && <span className="text-xs text-muted-foreground">{addr.detalii}</span>}
                                                        </div>
                                                    ) : <span className="text-muted-foreground">Adresă necunoscută</span>;
                                                })()
                                            ) : (
                                                <span className="text-muted-foreground">În magazin</span>
                                            )}
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] max-w-full p-2 text-sm overflow-x-auto">
                                        <div className="space-y-2 max-h-64 overflow-y-auto max-w-full">
                                            <button
                                                className={cn("w-full text-left rounded-md px-2 py-2 hover:bg-accent text-sm", !order.adresa_returnare_id && "bg-accent")}
                                                onClick={() => {
                                                    handleDeliveryAddressChange("null");
                                                    setDeliveryPopoverOpen(false);
                                                }}
                                            >
                                                În magazin
                                            </button>
                                            {addresses.map(addr => (
                                                <button
                                                    key={addr.id}
                                                    className={cn("w-full text-left rounded-md px-2 py-2 hover:bg-accent text-sm", order.adresa_returnare_id === addr.id && "bg-accent")}
                                                    onClick={() => {
                                                        handleDeliveryAddressChange(String(addr.id));
                                                        setDeliveryPopoverOpen(false);
                                                    }}
                                                >
                                                    <div className="font-medium">{addr.adresa}</div>
                                                    {addr.detalii && <div className="text-xs text-muted-foreground">{addr.detalii}</div>}
                                                </button>
                                            ))}
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="items" className="flex-1">
                        {/* Scrollable Content: Order Items and Financials */}
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
                    </TabsContent>
                </Tabs>
                {/* Persistent Sticky Footer: Financials */}
                <div className="sticky bottom-0 z-10 bg-background border-t">
                    <div className="p-4 space-y-3">
                        {/* Subtotal */}
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>Subtotal</span>
                            <span>{formatCurrency(order.total_comanda_fara_discount)} lei</span>
                        </div>
                        {/* Discount & Payment Method */}
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
                        {/* Total */}
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