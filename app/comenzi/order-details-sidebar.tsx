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
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { AddressDialog } from "./components/AddressDialog";
import { EditClientDialog } from "./components/EditClientDialog";
import { AddClientDialog } from "./components/AddClientDialog";
import { StatusSelector } from "./components/StatusSelector";
import { ClientSelector } from "./components/ClientSelector";
import { AddressSelector } from "./components/AddressSelector";
import { OrderFinancials } from "./components/OrderFinancials";
import { OrderItemsTab } from "./components/OrderItemsTab";
import { OrderDetailsTab } from "./components/OrderDetailsTab";

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
                    <TabsContent value="details" className="flex flex-col h-full">
                        <OrderDetailsTab
                            order={order}
                            statuses={statuses}
                            isLoading={isLoading}
                            onUrgencyChange={handleUrgencyChange}
                            onStatusChange={handleStatusChange}
                            customersList={customersList}
                            customerPopoverOpen={customerPopoverOpen}
                            setCustomerPopoverOpen={setCustomerPopoverOpen}
                            customerSearch={customerSearch}
                            setCustomerSearch={setCustomerSearch}
                            onCustomerChange={handleCustomerChange}
                            onClearClient={handleClearClient}
                            onOrderUpdated={onOrderUpdated}
                            refreshClient={() => setRefreshClient(x => x + 1)}
                            addresses={addresses}
                            pickupPopoverOpen={pickupPopoverOpen}
                            setPickupPopoverOpen={setPickupPopoverOpen}
                            deliveryPopoverOpen={deliveryPopoverOpen}
                            setDeliveryPopoverOpen={setDeliveryPopoverOpen}
                            onPickupChange={handlePickupAddressChange}
                            onDeliveryChange={handleDeliveryAddressChange}
                            formatDate={formatDate}
                        />
                    </TabsContent>
                    <TabsContent value="items" className="flex-1">
                        <OrderItemsTab order={order} formatCurrency={formatCurrency} />
                    </TabsContent>
                </Tabs>
                <OrderFinancials
                    order={order}
                    isLoading={isLoading}
                    currentDiscount={currentDiscount}
                    onPaymentMethodChange={handlePaymentMethodChange}
                    onDiscountChange={handleDiscountChange}
                    PAYMENT_METHODS={PAYMENT_METHODS}
                    DISCOUNT_OPTIONS={DISCOUNT_OPTIONS}
                    formatCurrency={formatCurrency}
                />
            </SheetContent>
        </Sheet>
    );
} 