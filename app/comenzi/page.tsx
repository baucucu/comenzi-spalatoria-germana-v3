'use client';
import { PageContentWrapper } from "@/components/ui/page-content-wrapper";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useEffect, useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { toast } from "sonner";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface OrderStatus {
    id: number;
    name: string;
    label: string;
    color: string;
}

interface Customer {
    id: string;
    nume: string;
    prenume: string;
    telefon?: string;
    email?: string;
}

interface Order {
    id: number;
    date_created: string;
    status: string | null;
    total_comanda_cu_discount: number;
    customers: Customer | null;
    adresa_colectare_id?: number;
    adresa_returnare_id?: number;
    urgent?: boolean;
    payment_method?: string;
    notes?: string;
    data_comanda?: string;
    data_colectare?: string;
    data_returnare?: string;
    adresa_colectare?: { adresa: string } | null;
    adresa_returnare?: { adresa: string } | null;
}

interface CustomerFull {
    id: string;
    nume: string;
    prenume: string;
    email: string;
    telefon: string;
}

interface Service {
    id: number;
    name: string;
    price: number;
    category: { name: string };
    service_type: { name: string };
}

interface Address {
    id: number;
    adresa: string;
    detalii?: string;
}

interface StatusHistory {
    status: string;
    changed_at: string;
}

export default function ComenziPage() {
    const [search, setSearch] = useState("");
    const [statuses, setStatuses] = useState<OrderStatus[]>([]);
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState<Order | null>(null);
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

    useEffect(() => {
        // Fetch statuses
        const fetchStatuses = async () => {
            const supabase = createClient();
            const { data, error } = await supabase.from("order_statuses").select("id, name, label, color");
            if (!error && data) setStatuses(data);
        };
        fetchStatuses();
    }, []);

    // Sidebar form state
    const [form, setForm] = useState({ customer: "", status: "", total: "", date: "", adresa_colectare_id: undefined as number | undefined, adresa_returnare_id: undefined as number | undefined, urgent: false, payment_method: '', discount: '', notes: '', data_comanda: '', data_colectare: '', data_returnare: '' });
    const [saving, setSaving] = useState(false);

    // Fetch customers (with search)
    const fetchCustomers = async (search = "") => {
        const supabase = createClient();
        let query = supabase.from("customers").select("id, nume, prenume, email, telefon").order("nume");
        if (search) {
            const q = `%${search.toLowerCase()}%`;
            query = query.or(
                `nume.ilike.${q},prenume.ilike.${q},email.ilike.${q},telefon.ilike.${q}`
            );
        }
        const { data, error } = await query;
        if (!error && data) setCustomers(data);
    };
    useEffect(() => { fetchCustomers(customerSearch); }, [customerSearch, sidebarOpen]);

    const handleAddCustomer = async () => {
        setAddingCustomer(true);
        const supabase = createClient();
        const { data, error } = await supabase.from("customers").insert(newCustomer).select().single();
        setAddingCustomer(false);
        if (error) {
            toast.error("Eroare la adăugarea clientului: " + error.message);
        } else if (data) {
            setCustomers((prev) => [data, ...prev]);
            setForm((f) => ({ ...f, customer: data.id }));
            setAddCustomerOpen(false);
            setNewCustomer({ nume: "", prenume: "", email: "", telefon: "" });
            toast.success("Client adăugat!");
        }
    };

    // Open sidebar for new order
    const handleAddOrder = () => {
        setEditingOrder(null);
        setOrderId(null);
        setForm({ customer: "", status: "", total: "", date: "", adresa_colectare_id: undefined, adresa_returnare_id: undefined, urgent: false, payment_method: '', discount: '', notes: '', data_comanda: '', data_colectare: '', data_returnare: '' });
        setItems([]);
        setSidebarOpen(true);
    };
    // Open sidebar for editing
    const handleEditOrder = (order: Order) => {
        setEditingOrder(order);
        setOrderId(order.id);
        setForm({
            customer: order.customers?.id || "",
            status: order.status || "",
            total: order.total_comanda_cu_discount.toString(),
            date: order.date_created ? order.date_created.slice(0, 10) : "",
            adresa_colectare_id: order.adresa_colectare_id,
            adresa_returnare_id: order.adresa_returnare_id,
            urgent: order.urgent || false,
            payment_method: order.payment_method || '',
            discount: '',
            notes: order.notes || '',
            data_comanda: order.data_comanda || '',
            data_colectare: order.data_colectare || '',
            data_returnare: order.data_returnare || '',
        });
        fetchOrderItems(order.id);
        fetchStatusHistory(order);
        setSidebarOpen(true);
    };
    // Fetch order items when editing
    const fetchOrderItems = async (orderId: number) => {
        const supabase = createClient();
        const { data: orderItemsData, error: orderItemsError } = await supabase.from('order_services').select('id, service_id, cantitate, total_articol, service:services(id, name, price, category:categories(name), service_type:service_types(name))').eq('order_id', orderId);
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
    // Fetch orders with joins and search
    const fetchOrders = async () => {
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
            .order('date_created', { ascending: false });
        if (search.trim()) {
            // Use full-text search on search_vector and also filter by order number
            query = query.or(`
                search_vector@@plainto_tsquery.romanian.${search},
                id.eq.${parseInt(search).toString() || ''}
            `);
        }
        const { data, error } = await query;
        if (!error && data) {
            setOrders(
                data.map((order: any) => ({
                    ...order,
                    customers: order.customers || null,
                    adresa_colectare: order.adresa_colectare || null,
                    adresa_returnare: order.adresa_returnare || null,
                }))
            );
        } else {
            setOrders([]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, sidebarOpen]);

    // Save (add or edit). If silent=true, don't close sidebar or show toast.
    const handleSaveOrder = async (silent: boolean = false) => {
        setSaving(true);
        const supabase = createClient();
        let order_id = orderId;
        let orderRes;
        if (editingOrder) {
            // Update order
            orderRes = await supabase.from("orders").update({
                customer_id: form.customer,
                status: form.status,
                total_comanda_cu_discount: parseFloat(form.total),
                date_created: form.date || new Date().toISOString(),
                adresa_colectare_id: form.adresa_colectare_id,
                adresa_returnare_id: form.adresa_returnare_id,
                urgent: form.urgent,
                payment_method: form.payment_method,
                discount: parseFloat(form.discount || '0'),
                notes: form.notes,
                data_comanda: form.data_comanda,
                data_colectare: form.data_colectare,
                data_returnare: form.data_returnare,
            }).eq("id", editingOrder.id).select('id').single();
            order_id = editingOrder.id;
        } else {
            // Insert order
            orderRes = await supabase.from("orders").insert({
                customer_id: form.customer,
                status: form.status,
                total_comanda_cu_discount: parseFloat(form.total),
                date_created: form.date || new Date().toISOString(),
                adresa_colectare_id: form.adresa_colectare_id,
                adresa_returnare_id: form.adresa_returnare_id,
                urgent: form.urgent,
                payment_method: form.payment_method,
                discount: parseFloat(form.discount || '0'),
                notes: form.notes,
                data_comanda: form.data_comanda,
                data_colectare: form.data_colectare,
                data_returnare: form.data_returnare,
            }).select('id').single();
            order_id = orderRes.data?.id;
        }
        if (orderRes.error || !order_id) {
            setSaving(false);
            if (!silent) toast.error("Eroare la salvare comandă: " + orderRes.error?.message);
            return;
        }
        // Upsert order_services
        // 1. Fetch existing items for edit
        let existingItems: any[] = [];
        if (editingOrder) {
            const { data } = await supabase.from('order_services').select('id').eq('order_id', order_id);
            existingItems = data || [];
        }
        // 2. Delete removed items
        if (editingOrder) {
            const toDelete = existingItems.filter(ei => !items.some(i => i.id === ei.id));
            if (toDelete.length > 0) {
                await supabase.from('order_services').delete().in('id', toDelete.map(i => i.id));
            }
        }
        // 3. Upsert current items
        for (const item of items) {
            if (item.id) {
                // Update
                await supabase.from('order_services').update({
                    service_id: item.service_id,
                    cantitate: item.quantity,
                    total_articol: item.quantity * item.price,
                }).eq('id', item.id);
            } else {
                // Insert
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
            toast.success(editingOrder ? "Comanda a fost actualizată!" : "Comanda a fost adăugată!");
            setSidebarOpen(false);
        }
        fetchOrders(); // Refresh orders after save
    };

    // Autosave on any change (debounced)
    const firstRender = useRef(true);
    useEffect(() => {
        if (!sidebarOpen) return;
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }
        const timeout = setTimeout(() => {
            handleSaveOrder(true);
        }, 800);
        return () => clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form, items]);

    // Fetch services
    const fetchServices = async () => {
        const supabase = createClient();
        const { data: servicesData, error: servicesError } = await supabase
            .from("services")
            .select("id, name, price, category:categories(name), service_type:service_types(name)")
            .order("name");
        if (!servicesError && servicesData) setServices(servicesData.map((s: any) => ({
            ...s,
            category: Array.isArray(s.category) && s.category.length > 0 ? s.category[0] : null,
            service_type: Array.isArray(s.service_type) && s.service_type.length > 0 ? s.service_type[0] : null,
        })));
    };
    useEffect(() => { fetchServices(); }, [sidebarOpen]);

    // Add item
    const handleAddItem = () => {
        setItems([...items, { service_id: services[0]?.id || 0, quantity: 1, price: services[0]?.price || 0, subtotal: services[0]?.price || 0 }]);
    };
    // Update item
    const handleItemChange = (idx: number, field: string, value: any) => {
        setItems(items.map((item, i) => i === idx ? { ...item, [field]: value, subtotal: field === 'quantity' || field === 'price' ? (field === 'quantity' ? value : item.quantity) * (field === 'price' ? value : item.price) : item.subtotal } : item));
    };
    // Remove item
    const handleRemoveItem = (idx: number) => {
        setItems(items.filter((_, i) => i !== idx));
    };

    // Fetch addresses for selected customer
    const fetchAddresses = async (customerId: string) => {
        if (!customerId) return setAddresses([]);
        const supabase = createClient();
        const { data, error } = await supabase.from('addresses').select('id, adresa, detalii').eq('customer_id', customerId).order('id');
        if (!error && data) setAddresses(data);
    };
    useEffect(() => { fetchAddresses(form.customer); }, [form.customer, sidebarOpen]);

    const handleAddAddress = async (type: 'colectare' | 'returnare') => {
        setAddingAddress(true);
        const supabase = createClient();
        const { data, error } = await supabase.from('addresses').insert({ ...newAddress, customer_id: form.customer }).select().single();
        setAddingAddress(false);
        if (error) {
            toast.error('Eroare la adăugarea adresei: ' + error.message);
        } else if (data) {
            setAddresses((prev) => [data, ...prev]);
            setForm((f) => ({ ...f, [type === 'colectare' ? 'adresa_colectare_id' : 'adresa_returnare_id']: data.id }));
            setAddAddressOpen({ type: null });
            setNewAddress({ adresa: '', detalii: '' });
            toast.success('Adresă adăugată!');
        }
    };

    // Fetch status history (fallback to current status/date_created)
    const fetchStatusHistory = async (order: Order) => {
        // If order_status_history table exists, fetch from there
        // For now, fallback to current status and date_created
        setStatusHistory([{ status: order.status || '', changed_at: order.date_created }]);
    };

    return (
        <PageContentWrapper>
            <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h1 className="text-2xl font-semibold">Comenzi</h1>
                    <Button variant="default" onClick={handleAddOrder}>Adaugă Comandă Nouă</Button>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <Input
                        placeholder="Caută comenzi..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="max-w-xs"
                    />
                </div>
                {/* Orders table */}
                <div className="border rounded p-0 overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="bg-muted">
                                <th className="px-2 py-2 text-left">#</th>
                                <th className="px-2 py-2 text-left">Data</th>
                                <th className="px-2 py-2 text-left">Client</th>
                                <th className="px-2 py-2 text-left">Status</th>
                                <th className="px-2 py-2 text-left">Urgent</th>
                                <th className="px-2 py-2 text-left">Ridicare</th>
                                <th className="px-2 py-2 text-left">Livrare</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={7} className="text-center py-8">Se încarcă...</td></tr>
                            ) : orders.length === 0 ? (
                                <tr><td colSpan={7} className="text-center py-8">Nicio comandă găsită.</td></tr>
                            ) : (
                                orders.map(order => (
                                    <tr key={order.id} className="border-b cursor-pointer hover:bg-accent" onClick={() => handleEditOrder(order)}>
                                        <td className="px-2 py-2 font-semibold">{order.id}</td>
                                        <td className="px-2 py-2">{new Date(order.date_created).toLocaleDateString()}</td>
                                        <td className="px-2 py-2">
                                            {order.customers ? (
                                                <div className="flex flex-col">
                                                    <span>{order.customers.nume} {order.customers.prenume}</span>
                                                    {order.customers.telefon && <span className="text-xs text-muted-foreground">{order.customers.telefon}</span>}
                                                    {order.customers.email && <span className="text-xs text-muted-foreground">{order.customers.email}</span>}
                                                </div>
                                            ) : <span className="text-muted-foreground">-</span>}
                                        </td>
                                        <td className="px-2 py-2">{order.status}</td>
                                        <td className="px-2 py-2">{order.urgent ? '✔️' : ''}</td>
                                        <td className="px-2 py-2">
                                            {order.adresa_colectare_id ? (order.adresa_colectare?.adresa || '-') : <span className="text-xs text-muted-foreground">Magazin</span>}
                                        </td>
                                        <td className="px-2 py-2">
                                            {order.adresa_returnare_id ? (order.adresa_returnare?.adresa || '-') : <span className="text-xs text-muted-foreground">Magazin</span>}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Right overlay sidebar for add/edit order */}
                <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                    <SheetContent className="max-w-lg w-full h-full grid grid-rows-[auto,1fr,auto] p-0">
                        <Tabs defaultValue="detalii" className="contents">
                            {/* Header (row-1) */}
                            <header className="border-b px-4 py-2 bg-background/90 backdrop-blur flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-lg">Comanda #{editingOrder?.id ?? 'Nouă'}</span>
                                    <span className="text-sm text-muted-foreground">{form.date || new Date().toLocaleDateString()}</span>
                                </div>
                                <TabsList className="-mx-4 mt-2 border-t">
                                    <TabsTrigger value="detalii">Detalii comanda</TabsTrigger>
                                    <TabsTrigger value="articole">Articole comanda</TabsTrigger>
                                </TabsList>
                            </header>

                            {/* Main scroll area (row-2) */}
                            <main className="overflow-y-auto px-4 space-y-4 flex-1">
                                <TabsContent value="detalii" className="flex flex-col gap-4">
                                    {/* Card 1: Status comanda */}
                                    <Card className="p-4 flex flex-col gap-2">
                                        <Label>Status comanda</Label>
                                        <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Selectează status..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {statuses.map(s => (
                                                    <SelectItem key={s.name} value={s.name}>{s.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <div className="flex items-center gap-2 mt-2">
                                            <Label>Urgent</Label>
                                            <Switch checked={form.urgent} onCheckedChange={v => setForm({ ...form, urgent: v })} />
                                        </div>
                                    </Card>
                                    {/* Card 2: Client */}
                                    <Card className="p-4 flex flex-col gap-2">
                                        <Label>Client</Label>
                                        <div className="flex gap-2 items-center">
                                            <Select value={form.customer} onValueChange={v => setForm({ ...form, customer: v })}>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Selectează client..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {customers.map(c => (
                                                        <SelectItem key={c.id} value={c.id}>{c.nume} {c.prenume} ({c.telefon})</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <Button size="sm" variant="outline" onClick={() => setAddCustomerOpen(v => !v)}>
                                            {addCustomerOpen ? "Anulează" : "Adaugă client nou"}
                                        </Button>
                                        {addCustomerOpen && (
                                            <div className="border rounded p-3 mt-2 flex flex-col gap-2 bg-muted/50">
                                                <Input placeholder="Nume" value={newCustomer.nume} onChange={e => setNewCustomer({ ...newCustomer, nume: e.target.value })} />
                                                <Input placeholder="Prenume" value={newCustomer.prenume} onChange={e => setNewCustomer({ ...newCustomer, prenume: e.target.value })} />
                                                <Input placeholder="Email" value={newCustomer.email} onChange={e => setNewCustomer({ ...newCustomer, email: e.target.value })} />
                                                <Input placeholder="Telefon" value={newCustomer.telefon} onChange={e => setNewCustomer({ ...newCustomer, telefon: e.target.value })} />
                                                <Button size="sm" onClick={handleAddCustomer} disabled={addingCustomer}>{addingCustomer ? "Se adaugă..." : "Salvează clientul"}</Button>
                                            </div>
                                        )}
                                    </Card>
                                    {/* Card 3: Adrese */}
                                    <Card className="p-4 flex flex-col gap-2">
                                        <Label>Adresă ridicare</Label>
                                        <div className="flex gap-2 items-center">
                                            <Select value={form.adresa_colectare_id?.toString() || ''} onValueChange={v => setForm({ ...form, adresa_colectare_id: parseInt(v) })}>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Selectează adresă..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {addresses.map(a => (
                                                        <SelectItem key={a.id} value={a.id.toString()}>{a.adresa}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <Button size="sm" variant={addAddressOpen.type === "colectare" ? "destructive" : "secondary"} onClick={() => setAddAddressOpen({ type: addAddressOpen.type === 'colectare' ? null : 'colectare' })}>
                                            {addAddressOpen.type === 'colectare' ? 'Anulează' : 'Adaugă adresă'}
                                        </Button>
                                        {addAddressOpen.type === 'colectare' && (
                                            <div className="border rounded p-3 mt-2 flex flex-col gap-2 bg-muted/50">
                                                <Textarea placeholder="Adresă (autocomplete)" value={newAddress.adresa} onChange={e => setNewAddress({ ...newAddress, adresa: e.target.value })} />
                                                <Textarea placeholder="Detalii adresă" value={newAddress.detalii} onChange={e => setNewAddress({ ...newAddress, detalii: e.target.value })} />
                                                <Button size="sm" variant="default" onClick={() => handleAddAddress('colectare')} disabled={addingAddress}>{addingAddress ? 'Se adaugă...' : 'Salvează adresa'}</Button>
                                            </div>
                                        )}
                                    </Card>
                                    <Card className="p-4 flex flex-col gap-2">
                                        <Label>Adresă livrare</Label>
                                        <div className="flex gap-2 items-center">
                                            <Select value={form.adresa_returnare_id?.toString() || ''} onValueChange={v => setForm({ ...form, adresa_returnare_id: parseInt(v) })}>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Selectează adresă..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {addresses.map(a => (
                                                        <SelectItem key={a.id} value={a.id.toString()}>{a.adresa}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <Button size="sm" variant={addAddressOpen.type === "returnare" ? "destructive" : "secondary"} onClick={() => setAddAddressOpen({ type: addAddressOpen.type === 'returnare' ? null : 'returnare' })}>
                                            {addAddressOpen.type === 'returnare' ? 'Anulează' : 'Adaugă adresă'}
                                        </Button>
                                        {addAddressOpen.type === 'returnare' && (
                                            <div className="border rounded p-3 mt-2 flex flex-col gap-2 bg-muted/50">
                                                <Textarea placeholder="Adresă (autocomplete)" value={newAddress.adresa} onChange={e => setNewAddress({ ...newAddress, adresa: e.target.value })} />
                                                <Textarea placeholder="Detalii adresă" value={newAddress.detalii} onChange={e => setNewAddress({ ...newAddress, detalii: e.target.value })} />
                                                <Button size="sm" variant="default" onClick={() => handleAddAddress('returnare')} disabled={addingAddress}>{addingAddress ? 'Se adaugă...' : 'Salvează adresa'}</Button>
                                            </div>
                                        )}
                                    </Card>
                                    {/* Card 4: Metodă plată */}
                                    <Card className="p-4 flex flex-col gap-2">
                                        <Label>Metodă plată</Label>
                                        <Select value={form.payment_method} onValueChange={v => setForm({ ...form, payment_method: v })}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Selectează metodă plată..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="cash">Cash</SelectItem>
                                                <SelectItem value="card">Card</SelectItem>
                                                <SelectItem value="OP">OP</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </Card>
                                    {/* Card 5: Discount */}
                                    <Card className="p-4 flex flex-col gap-2">
                                        <Label>Discount (RON)</Label>
                                        <Input type="number" min={0} value={form.discount} onChange={e => setForm({ ...form, discount: e.target.value })} placeholder="Introduceti discount..." />
                                    </Card>
                                </TabsContent>
                                <TabsContent value="articole" className="flex flex-col gap-4">
                                    <Card className="p-4 flex flex-col gap-2">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-semibold">Articole în comandă</span>
                                            <Button size="sm" variant="outline" onClick={handleAddItem}>Adaugă articol</Button>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full text-sm">
                                                <thead>
                                                    <tr>
                                                        <th className="px-2 py-1 text-left">Articol</th>
                                                        <th className="px-2 py-1 text-left">Tip</th>
                                                        <th className="px-2 py-1 text-left">Categorie</th>
                                                        <th className="px-2 py-1 text-left">Cantitate</th>
                                                        <th className="px-2 py-1 text-left">Preț/articol</th>
                                                        <th className="px-2 py-1 text-left">Total</th>
                                                        <th className="px-2 py-1"></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {items.length === 0 ? (
                                                        <tr><td colSpan={7} className="text-center py-4 text-muted-foreground">Niciun articol adăugat.</td></tr>
                                                    ) : (
                                                        items.map((item, idx) => {
                                                            const service = services.find(s => s.id === item.service_id);
                                                            return (
                                                                <tr key={idx}>
                                                                    <td className="px-2 py-1">
                                                                        <Select value={item.service_id.toString()} onValueChange={v => handleItemChange(idx, 'service_id', parseInt(v))}>
                                                                            <SelectTrigger className="w-32"><SelectValue placeholder="Articol" /></SelectTrigger>
                                                                            <SelectContent>
                                                                                {services.map(s => (
                                                                                    <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                                                                                ))}
                                                                            </SelectContent>
                                                                        </Select>
                                                                    </td>
                                                                    <td className="px-2 py-1">{service?.service_type?.name || '-'}</td>
                                                                    <td className="px-2 py-1">{service?.category?.name || '-'}</td>
                                                                    <td className="px-2 py-1"><Input type="number" min={1} className="w-16" value={item.quantity} onChange={e => handleItemChange(idx, 'quantity', parseInt(e.target.value))} /></td>
                                                                    <td className="px-2 py-1"><Input type="number" min={0} className="w-20" value={item.price} onChange={e => handleItemChange(idx, 'price', parseFloat(e.target.value))} /></td>
                                                                    <td className="px-2 py-1">{(item.quantity * item.price).toFixed(2)} RON</td>
                                                                    <td className="px-2 py-1"><Button size="icon" variant="ghost" onClick={() => handleRemoveItem(idx)} aria-label="Șterge"><span aria-hidden>×</span></Button></td>
                                                                </tr>
                                                            );
                                                        })
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </Card>
                                </TabsContent>
                            </main>

                            {/* Footer (row-3) */}
                            <footer className="border-t px-4 py-4 bg-background/90 backdrop-blur flex flex-col gap-2">
                                {(() => {
                                    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
                                    const discountVal = parseFloat(form.discount || '0') || 0;
                                    const total = subtotal - discountVal;
                                    return (
                                        <>
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold">Subtotal:</span>
                                                <span>{subtotal.toFixed(2)} RON</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold">Discount:</span>
                                                <span>- {discountVal.toFixed(2)} RON</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold">Total:</span>
                                                <span>{total.toFixed(2)} RON</span>
                                            </div>
                                        </>
                                    );
                                })()}
                            </footer>
                        </Tabs>
                    </SheetContent>
                </Sheet>
            </div>
        </PageContentWrapper >
    );
} 