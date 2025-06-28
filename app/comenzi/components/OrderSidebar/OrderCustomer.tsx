"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import {
    Command,
    CommandInput,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandList
} from "@/components/ui/command";
import { ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

interface CustomerFull {
    id: string;
    nume: string;
    prenume: string;
    email: string;
    telefon: string;
}

export default function OrderCustomer({ orderId, onOrderCreated }: { orderId?: number | null, onOrderCreated?: (orderId: number) => void }) {
    const [customers, setCustomers] = useState<CustomerFull[]>([]);
    const [search, setSearch] = useState("");
    const [filteredCustomers, setFilteredCustomers] = useState<CustomerFull[]>([]);
    const [addCustomerOpen, setAddCustomerOpen] = useState(false);
    const [newCustomer, setNewCustomer] = useState({ nume: "", prenume: "", email: "", telefon: "", accept_marketing_email: false, accept_marketing_sms: false });
    const [addingCustomer, setAddingCustomer] = useState(false);
    const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
    const [customerComboboxOpen, setCustomerComboboxOpen] = useState(false);

    // Fetch all customers on mount
    useEffect(() => {
        const fetchCustomers = async () => {
            const supabase = createClient();
            const { data, error } = await supabase
                .from("customers")
                .select("id, nume, prenume, email, telefon")
                .order("nume")
                .limit(1000);
            if (error) {
                toast.error("Eroare la încărcarea clienților: " + error.message);
                return;
            }
            setCustomers(data || []);
        };
        fetchCustomers();
    }, []);

    // Filter customers client-side
    useEffect(() => {
        if (!search.trim()) {
            setFilteredCustomers(customers);
            return;
        }
        const terms = search.trim().toLowerCase().split(/\s+/).filter(Boolean);
        const filtered = customers.filter(c =>
            terms.every(term =>
                (c.nume && c.nume.toLowerCase().includes(term)) ||
                (c.prenume && c.prenume.toLowerCase().includes(term)) ||
                (c.email && c.email.toLowerCase().includes(term)) ||
                (c.telefon && c.telefon.toLowerCase().includes(term))
            )
        );
        console.log('Filtered customers:', filtered);
        setFilteredCustomers(filtered);
    }, [search, customers]);

    // Fetch selected customer for orderId
    useEffect(() => {
        if (!orderId) {
            setSelectedCustomerId("");
            return;
        }
        const fetchOrderCustomer = async () => {
            const supabase = createClient();
            const { data, error } = await supabase
                .from("orders")
                .select("customer_id")
                .eq("id", orderId)
                .single();
            if (data && data.customer_id) setSelectedCustomerId(data.customer_id);
        };
        fetchOrderCustomer();
    }, [orderId]);

    // Update order's customer
    const handleCustomerChange = async (customerId: string) => {
        setSelectedCustomerId(customerId);
        const supabase = createClient();
        if (!orderId) {
            // Create new order with status 'noua' and selected customer
            const { data, error } = await supabase
                .from("orders")
                .insert({ status: "noua", customer_id: customerId, data_comanda: new Date().toISOString() })
                .select("id")
                .single();
            if (error) {
                toast.error("Eroare la crearea comenzii: " + error.message);
                return;
            }
            if (data && onOrderCreated) {
                onOrderCreated(data.id);
            }
            return;
        }
        const { error } = await supabase
            .from("orders")
            .update({ customer_id: customerId })
            .eq("id", orderId);
        if (error) {
            toast.error("Eroare la actualizarea clientului: " + error.message);
        }
    };

    // Add new customer
    const handleAddCustomer = async () => {
        // Validate required fields
        if (!newCustomer.nume.trim() || !newCustomer.prenume.trim() || !newCustomer.telefon.trim()) {
            toast.error("Nume, prenume și telefon sunt obligatorii.");
            return;
        }
        setAddingCustomer(true);
        const supabase = createClient();
        const { data, error } = await supabase
            .from("customers")
            .insert({
                nume: newCustomer.nume,
                prenume: newCustomer.prenume,
                email: newCustomer.email,
                telefon: newCustomer.telefon,
                accept_marketing_email: newCustomer.accept_marketing_email,
                accept_marketing_sms: newCustomer.accept_marketing_sms
            })
            .select()
            .single();
        setAddingCustomer(false);
        if (error) {
            toast.error("Eroare la adăugarea clientului: " + error.message);
            return;
        } else if (data) {
            setCustomers(prev => [data, ...prev]);
            handleCustomerChange(data.id);
            setAddCustomerOpen(false);
            setNewCustomer({ nume: "", prenume: "", email: "", telefon: "", accept_marketing_email: false, accept_marketing_sms: false });
            toast.success("Client adăugat!");
        }
    };

    return (
        <Card className="p-4 flex flex-col gap-2">
            <Label>Client</Label>
            <Popover
                open={customerComboboxOpen}
                onOpenChange={setCustomerComboboxOpen}
                modal={true}
            >
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={customerComboboxOpen}
                        className="w-full justify-between overflow-hidden"
                    >
                        <span className="truncate">
                            {selectedCustomerId ? (
                                (() => {
                                    const sel = customers.find(c => c.id === selectedCustomerId);
                                    if (!sel) return 'Selectează client...';
                                    return `${sel.nume} ${sel.prenume}${sel.telefon ? ` - ${sel.telefon}` : ''}${sel.email ? ` - ${sel.email}` : ''}`;
                                })()
                            ) : (
                                'Selectează client...'
                            )}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]">
                    <Command>
                        <CommandInput
                            placeholder="Caută client..."
                            value={search}
                            onValueChange={setSearch}
                        />
                        <CommandList>
                            {filteredCustomers.length === 0 ? (
                                <CommandEmpty>Niciun client găsit.</CommandEmpty>
                            ) : (
                                <CommandGroup>
                                    {filteredCustomers.map(c => {
                                        const display = `${c.nume} ${c.prenume}${c.telefon ? ` - ${c.telefon}` : ''}${c.email ? ` - ${c.email}` : ''}`;
                                        return (
                                            <CommandItem
                                                key={c.id}
                                                value={`${c.nume} ${c.prenume} ${c.email} ${c.telefon}`}
                                                onSelect={() => {
                                                    handleCustomerChange(c.id);
                                                    setCustomerComboboxOpen(false);
                                                }}
                                            >
                                                <Check
                                                    className={cn(
                                                        'mr-2 h-4 w-4',
                                                        selectedCustomerId === c.id ? 'opacity-100' : 'opacity-0'
                                                    )}
                                                />
                                                {display}
                                            </CommandItem>
                                        );
                                    })}
                                </CommandGroup>
                            )}
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
            <Button
                size="sm"
                variant={addCustomerOpen ? 'destructive' : 'secondary'}
                onClick={() => setAddCustomerOpen(v => !v)}
            >
                {addCustomerOpen ? 'Anulează' : 'Adaugă client nou'}
            </Button>
            {addCustomerOpen && (
                <div className="border rounded p-3 mt-2 flex flex-col gap-2 bg-muted/50">
                    <Input
                        placeholder="Nume*"
                        value={newCustomer.nume}
                        onChange={e => setNewCustomer({ ...newCustomer, nume: e.target.value })}
                    />
                    <Input
                        placeholder="Prenume*"
                        value={newCustomer.prenume}
                        onChange={e => setNewCustomer({ ...newCustomer, prenume: e.target.value })}
                    />
                    <Input
                        placeholder="Telefon*"
                        value={newCustomer.telefon}
                        onChange={e => setNewCustomer({ ...newCustomer, telefon: e.target.value })}
                    />
                    <Input
                        placeholder="Email"
                        value={newCustomer.email}
                        onChange={e => setNewCustomer({ ...newCustomer, email: e.target.value })}
                    />
                    <div className="flex items-center justify-between gap-2">
                        <Label htmlFor="accept_marketing_sms">Marketing SMS</Label>
                        <Switch
                            id="accept_marketing_sms"
                            checked={newCustomer.accept_marketing_sms}
                            onCheckedChange={checked => setNewCustomer({ ...newCustomer, accept_marketing_sms: checked })}
                        />
                    </div>
                    <div className="flex items-center justify-between gap-2">
                        <Label htmlFor="accept_marketing_email">Marketing Email</Label>
                        <Switch
                            id="accept_marketing_email"
                            checked={newCustomer.accept_marketing_email}
                            onCheckedChange={checked => setNewCustomer({ ...newCustomer, accept_marketing_email: checked })}
                        />
                    </div>
                    <Button size="sm" onClick={handleAddCustomer} disabled={addingCustomer}>
                        {addingCustomer ? 'Se adaugă...' : 'Salvează clientul'}
                    </Button>
                </div>
            )}
            {(addingCustomer) && (
                <div className="text-xs text-muted-foreground">
                    {'Se salvează...'}
                </div>
            )}
        </Card>
    );
}