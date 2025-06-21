'use client';
import { useEffect, useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import {
    Sheet,
    SheetTitle,
    SheetContent,
    SheetHeader,
    SheetFooter
} from "@/components/ui/sheet";
import { toast } from "sonner";
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import {
    Command,
    CommandInput,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandList
} from "@/components/ui/command";
import { ChevronsUpDown, Check, Paperclip, Shirt, Notebook } from "lucide-react";
import { cn } from "@/lib/utils";
import OrderStatusComponent from "./OrderSidebar/OrderStatusComponent";
import OrderCustomer from "./OrderSidebar/OrderCustomer";
import OrderAddress from "./OrderSidebar/OrderAddress";
import OrderPaymentMethod from "./OrderSidebar/OrderPaymentMethod";
import OrderDiscount from "./OrderSidebar/OrderDiscount";
import OrderItems from "./OrderSidebar/OrderItems";
import OrderFooter from "./OrderSidebar/OrderFooter";
import OrderNotes from "./OrderSidebar/OrderNotes";
import OrderMarcute from "./OrderSidebar/OrderMarcute";

import {
    Order,
    OrderStatus as OrderStatusType,
    CustomerFull,
    Service,
    Address,
    Discount,
    StatusHistory
} from "../types";

interface OrderSidebarProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingOrder: Order | null;
    onSaved: () => void;
}

// Notes type
interface OrderNote {
    id: number;
    note: string;
    created_at: string;
}

export default function OrderSidebar({ open, onOpenChange, editingOrder, onSaved }: OrderSidebarProps) {
    /* ---------- State ---------- */
    const [statuses, setStatuses] = useState<OrderStatusType[]>([]);

    const [customers, setCustomers] = useState<CustomerFull[]>([]);
    const [customerSearch, setCustomerSearch] = useState("");
    const [addCustomerOpen, setAddCustomerOpen] = useState(false);
    const [newCustomer, setNewCustomer] = useState({ nume: "", prenume: "", email: "", telefon: "" });
    const [addingCustomer, setAddingCustomer] = useState(false);

    const [services, setServices] = useState<Service[]>([]);
    const [items, setItems] = useState<{ id?: number; service_id: number; quantity: number; price: number; subtotal: number }[]>([]);

    const [addresses, setAddresses] = useState<Address[]>([]);
    const [addAddressOpen, setAddAddressOpen] = useState<{ type: 'colectare' | 'returnare' | null }>({ type: null });
    const [newAddress, setNewAddress] = useState({ adresa: '', detalii: '' });
    const [addingAddress, setAddingAddress] = useState(false);

    const [orderId, setOrderId] = useState<number | null>(null);
    const [statusHistory, setStatusHistory] = useState<StatusHistory[]>([]);
    const [customerComboboxOpen, setCustomerComboboxOpen] = useState(false);
    const [discounts, setDiscounts] = useState<Discount[]>([]);

    const [form, setForm] = useState({
        customer_id: "",
        status: "",
        total: "",
        date: "",
        adresa_colectare_id: undefined as number | undefined,
        adresa_returnare_id: undefined as number | undefined,
        urgent: false,
        payment_method: '',
        discount: '',
        marcute: '',
        data_comanda: '',
        data_colectare: null as string | null,
        data_returnare: null as string | null,
    });

    const [saving, setSaving] = useState(false);
    const justCreatedOrder = useRef(false);

    /* ---------- Effects ---------- */
    // Fetch statuses once
    useEffect(() => {
        const fetchStatuses = async () => {
            const supabase = createClient();
            const { data } = await supabase
                .from("order_statuses")
                .select("id, name, label, color");
            if (data) setStatuses(data);
        };
        fetchStatuses();
    }, []);

    // Initialise form when the sidebar opens / editingOrder changes
    useEffect(() => {
        if (!open) return;

        if (editingOrder) {
            setOrderId(editingOrder.id);
            setForm({
                customer_id: editingOrder.customers?.id || "",
                status: editingOrder.status || "",
                total: editingOrder.total_comanda_cu_discount.toString(),
                date: editingOrder.date_created ? editingOrder.date_created.slice(0, 10) : "",
                adresa_colectare_id: editingOrder.adresa_colectare_id,
                adresa_returnare_id: editingOrder.adresa_returnare_id,
                urgent: editingOrder.urgent || false,
                payment_method: editingOrder.payment_method || '',
                discount: '',
                marcute: editingOrder.marcute || '',
                data_comanda: editingOrder.data_comanda || '',
                data_colectare: editingOrder.data_colectare || null,
                data_returnare: editingOrder.data_returnare || null,
            });
            fetchOrderItems(editingOrder.id);
            fetchStatusHistory(editingOrder);
        } else {
            setOrderId(null);
            setForm({
                customer_id: "",
                status: 'noua',
                total: "0",
                date: new Date().toISOString().slice(0, 10),
                adresa_colectare_id: undefined,
                adresa_returnare_id: undefined,
                urgent: false,
                payment_method: 'Neachitat',
                discount: '',
                marcute: '',
                data_comanda: new Date().toISOString(),
                data_colectare: null,
                data_returnare: null
            });
            setItems([]);
            setStatusHistory([]);
        }
    }, [editingOrder, open, statuses]);

    // Fetch customers when the search text changes
    const fetchCustomers = async (search = "") => {
        const supabase = createClient();
        let query = supabase
            .from("customers")
            .select("id, nume, prenume, email, telefon")
            .order("nume");
        if (search) {
            const q = `%${search.toLowerCase()}%`;
            query = query.or(`nume.ilike.${q},prenume.ilike.${q},email.ilike.${q},telefon.ilike.${q}`);
        }
        const { data } = await query;
        if (data) setCustomers(data);
    };
    useEffect(() => {
        if (open) fetchCustomers(customerSearch);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [customerSearch, open]);

    // Fetch services once sidebar is opened
    const fetchServices = async () => {
        const supabase = createClient();
        const { data } = await supabase
            .from("services")
            .select("id, name, price, category:categories(name), service_type:service_types(name)")
            .order("name");
        if (data) {
            setServices(
                data.map((s: any) => ({
                    ...s,
                    category: Array.isArray(s.category) && s.category.length > 0 ? s.category[0] : null,
                    service_type: Array.isArray(s.service_type) && s.service_type.length > 0 ? s.service_type[0] : null,
                }))
            );
        }
    };
    useEffect(() => {
        if (open) fetchServices();
    }, [open]);

    // Fetch addresses for customer
    const fetchAddresses = async (customerId: string) => {
        if (!customerId) return setAddresses([]);
        const supabase = createClient();
        const { data } = await supabase
            .from('addresses')
            .select('id, adresa, detalii')
            .eq('customer_id', customerId)
            .order('id');
        if (data) setAddresses(data);
    };
    useEffect(() => {
        if (open) fetchAddresses(form.customer_id);
    }, [form.customer_id, open]);

    // Fetch discounts when sidebar opens
    const fetchDiscounts = async () => {
        const supabase = createClient();
        const { data } = await supabase.from("discounts").select("id, name, value").order("value");
        if (data) setDiscounts(data);
    };
    useEffect(() => {
        if (open) fetchDiscounts();
    }, [open]);

    /* ---------- Data helpers ---------- */
    const fetchOrderItems = async (orderId: number) => {
        const supabase = createClient();
        const { data: orderItemsData } = await supabase
            .from('order_services')
            .select('id, service_id, cantitate, total_articol, service:services(id, name, price, category:categories(name), service_type:service_types(name))')
            .eq('order_id', orderId);
        if (orderItemsData) {
            setItems(orderItemsData.map((item: any) => ({
                id: item.id,
                service_id: item.service_id,
                quantity: item.cantitate,
                price: item.service?.price || 0,
                subtotal: item.total_articol,
            })));
        }
    };

    const fetchStatusHistory = async (order: Order) => {
        setStatusHistory([{ status: order.status || '', changed_at: order.date_created }]);
    };

    /* ---------- Customer & Address helpers ---------- */
    const handleAddCustomer = async () => {
        setAddingCustomer(true);
        const supabase = createClient();
        const { data, error } = await supabase.from("customers").insert(newCustomer).select().single();
        setAddingCustomer(false);
        if (error) {
            toast.error("Eroare la adăugarea clientului: " + error.message);
        } else if (data) {
            setCustomers(prev => [data, ...prev]);
            setForm(f => ({ ...f, customer_id: data.id }));
            setAddCustomerOpen(false);
            setNewCustomer({ nume: "", prenume: "", email: "", telefon: "" });
            toast.success("Client adăugat!");
        }
    };

    const handleAddAddress = async (address: { adresa: string, detalii: string }) => {
        if (!form.customer_id) return null;
        setAddingAddress(true);
        const supabase = createClient();
        const { data, error } = await supabase
            .from('addresses')
            .insert({ ...address, customer_id: form.customer_id })
            .select()
            .single();
        setAddingAddress(false);
        if (error) {
            toast.error('Eroare la adăugarea adresei: ' + error.message);
            return null;
        }
        if (data) {
            setAddresses(prev => [data, ...prev]);
            toast.success('Adresă adăugată!');
            return data;
        }
        return null;
    };

    /* ---------- Items helpers ---------- */
    const handleAddItem = () => {
        if (services.length === 0) return;
        setItems(prev => [
            ...prev,
            {
                service_id: services[0].id,
                quantity: 1,
                price: services[0].price,
                subtotal: services[0].price,
            },
        ]);
    };

    const handleItemChange = (idx: number, field: string, value: any) => {
        setItems(items.map((item, i) =>
            i === idx ? {
                ...item,
                [field]: value,
                subtotal:
                    field === 'quantity' || field === 'price'
                        ? (field === 'quantity' ? value : item.quantity) * (field === 'price' ? value : item.price)
                        : item.subtotal,
            } : item
        ));
    };

    const handleRemoveItem = (idx: number) => {
        setItems(items.filter((_, i) => i !== idx));
    };

    /* ---------- Save helpers ---------- */
    const handleSaveOrder = async (silent: boolean = false) => {
        setSaving(true);
        const supabase = createClient();
        let order_id = orderId;
        let orderRes;
        const wasNewOrder = !orderId;

        if (orderId) {
            // Update: send all data
            const orderData: any = {
                customer_id: form.customer_id,
                total_comanda_cu_discount: parseFloat(form.total) || 0,
                adresa_colectare_id: form.adresa_colectare_id,
                adresa_returnare_id: form.adresa_returnare_id,
                urgent: form.urgent,
                payment_method: form.payment_method,
                discount: parseFloat(form.discount || '0'),
                marcute: form.marcute,
                data_comanda: form.data_comanda,
                data_colectare: form.data_colectare || null,
                data_returnare: form.data_returnare || null,
            };

            // Only include status if it has been changed from the initial 'noua'
            if (form.status !== 'noua') {
                orderData.status = form.status;
            }

            orderRes = await supabase
                .from('orders')
                .update(orderData)
                .eq('id', orderId)
                .select('id')
                .single();
            order_id = orderId;
        } else {
            // Insert: send minimal data
            const minimalOrderData = {
                customer_id: form.customer_id,
                data_comanda: form.data_comanda || new Date().toISOString().slice(0, 10),
                // Defaults from DB schema
                subtotal_articole: 0,
                total_comanda_cu_discount: 0,
            };
            orderRes = await supabase
                .from('orders')
                .insert(minimalOrderData)
                .select('id')
                .single();
            order_id = orderRes.data?.id ?? null;
            if (order_id) {
                setOrderId(order_id);
                justCreatedOrder.current = true;
            }
        }

        if (orderRes.error || !order_id) {
            setSaving(false);
            if (!silent) toast.error('Eroare la salvare comandă: ' + orderRes.error?.message);
            return;
        }

        // Upsert order_services
        let existingItems: any[] = [];
        if (orderId) {
            const { data } = await supabase
                .from('order_services')
                .select('id')
                .eq('order_id', order_id);
            existingItems = data || [];
        }

        if (orderId) {
            const toDelete = existingItems.filter(ei => !items.some(i => i.id === ei.id));
            if (toDelete.length > 0) {
                await supabase
                    .from('order_services')
                    .delete()
                    .in('id', toDelete.map(i => i.id));
            }
        }

        for (const item of items) {
            if (item.id) {
                await supabase
                    .from('order_services')
                    .update({
                        service_id: item.service_id,
                        cantitate: item.quantity,
                        total_articol: item.quantity * item.price,
                    })
                    .eq('id', item.id);
            } else {
                await supabase.from('order_services').insert({
                    order_id,
                    service_id: item.service_id,
                    cantitate: item.quantity,
                    total_articol: item.quantity * item.price,
                });
            }
        }

        setSaving(false);
        if (!silent) {
            toast.success(wasNewOrder ? 'Comanda a fost adăugată!' : 'Comanda a fost actualizată!');
            onOpenChange(false);
            onSaved();
        }
    };

    // Autosave
    const firstRender = useRef(true);
    useEffect(() => {
        if (!open) {
            firstRender.current = true; // Reset on close
            return;
        }

        if (firstRender.current) {
            firstRender.current = false;
            return;
        }

        if (justCreatedOrder.current) {
            justCreatedOrder.current = false; // Consume the flag and skip the first autosave
            return;
        }

        // For new orders, only autosave if a customer is selected.
        if (!orderId && !form.customer_id) {
            return;
        }

        const timeout = setTimeout(() => handleSaveOrder(true), 800);
        return () => clearTimeout(timeout);
    }, [form, items, open, orderId]);

    /* ---------- JSX ---------- */
    return (
        <Sheet open={open} onOpenChange={onOpenChange} >
            <SheetContent className="max-w-lg w-full h-full flex flex-col p-0 gap-0">
                <SheetHeader className="p-4 border-b">
                    <SheetTitle className="flex gap-2 items-center">
                        <span className="font-bold text-lg">
                            Comanda #{orderId ?? 'Nouă'}
                        </span>
                        <span className="text-sm text-muted-foreground">
                            {form.date || new Date().toLocaleDateString()}
                        </span>
                    </SheetTitle>
                </SheetHeader>
                <Tabs defaultValue="detalii" className="flex flex-1 flex-col overflow-hidden">
                    <TabsList className="w-full justify-around rounded-none border-b bg-transparent p-0">
                        <TabsTrigger value="detalii" className="flex-1 flex items-center justify-center gap-2">
                            <Paperclip className="w-4 h-4" />
                            Comanda
                        </TabsTrigger>
                        <TabsTrigger value="articole" className="flex-1 flex items-center justify-center gap-2">
                            <Shirt className="w-4 h-4" />
                            Articole
                        </TabsTrigger>
                        <TabsTrigger value="notite" className="flex-1 flex items-center justify-center gap-2">
                            <Notebook className="w-4 h-4" />
                            Notițe
                        </TabsTrigger>
                    </TabsList>
                    <main className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/25">
                        <TabsContent value="detalii" className="m-0 flex flex-col gap-4">
                            <OrderStatusComponent
                                orderId={orderId ?? null}
                                status={form.status}
                                urgent={form.urgent}
                                onStatusChange={status => setForm(f => ({ ...f, status }))}
                                onUrgentChange={urgent => setForm(f => ({ ...f, urgent }))}
                            />
                            <OrderMarcute
                                orderId={orderId ?? null}
                                value={form.marcute}
                                onChange={marcute => setForm(f => ({ ...f, marcute }))}
                            />
                            <OrderCustomer
                                orderId={orderId ?? null}
                                value={form.customer_id}
                                onChange={(id) => {
                                    setForm(f => ({ ...f, customer_id: id, adresa_colectare_id: undefined, adresa_returnare_id: undefined }));
                                    fetchAddresses(id);
                                }}
                            />
                            <OrderAddress
                                orderId={orderId ?? null}
                                type="colectare"
                                value={form.adresa_colectare_id}
                                onChange={id => setForm(f => ({ ...f, adresa_colectare_id: id }))}
                                dateTime={form.data_colectare ?? ''}
                                onDateTimeChange={date => setForm(f => ({ ...f, data_colectare: date }))}
                                customerId={form.customer_id}
                                addresses={addresses}
                                onAddAddress={handleAddAddress}
                            />
                            <OrderAddress
                                orderId={orderId ?? null}
                                type="returnare"
                                value={form.adresa_returnare_id}
                                onChange={id => setForm(f => ({ ...f, adresa_returnare_id: id }))}
                                dateTime={form.data_returnare ?? ''}
                                onDateTimeChange={date => setForm(f => ({ ...f, data_returnare: date }))}
                                customerId={form.customer_id}
                                addresses={addresses}
                                onAddAddress={handleAddAddress}
                            />
                            <OrderPaymentMethod
                                orderId={orderId ?? null}
                                value={form.payment_method}
                                onChange={payment_method => setForm(f => ({ ...f, payment_method }))}
                            />
                            <OrderDiscount orderId={orderId ?? null} />
                        </TabsContent>
                        <TabsContent value="articole" className="m-0 flex flex-col gap-4">
                            <OrderItems orderId={orderId ?? null} />
                        </TabsContent>
                        <TabsContent value="notite" className="m-0 flex flex-col gap-4">
                            <OrderNotes orderId={orderId ?? null} />
                        </TabsContent>
                    </main>
                </Tabs>
                <OrderFooter orderId={orderId ?? null} />
            </SheetContent>
        </Sheet>
    );
} 