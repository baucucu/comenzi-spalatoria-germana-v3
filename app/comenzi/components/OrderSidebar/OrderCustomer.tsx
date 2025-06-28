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

interface CustomerFull {
    id: string;
    nume: string;
    prenume: string;
    email: string;
    telefon: string;
}

export default function OrderCustomer({ orderId }: { orderId?: number | null }) {
    const [customers, setCustomers] = useState<CustomerFull[]>([]);
    const [search, setSearch] = useState("");
    const [filteredCustomers, setFilteredCustomers] = useState<CustomerFull[]>([]);
    const [addCustomerOpen, setAddCustomerOpen] = useState(false);
    const [newCustomer, setNewCustomer] = useState({ nume: "", prenume: "", email: "", telefon: "" });
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
        console.log('All customers:', customers);
        console.log('Search:', search);
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
        if (!orderId) return;
        const supabase = createClient();
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
        setAddingCustomer(true);
        const supabase = createClient();
        const { data, error } = await supabase
            .from("customers")
            .insert(newCustomer)
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
            setNewCustomer({ nume: "", prenume: "", email: "", telefon: "" });
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
                        placeholder="Nume"
                        value={newCustomer.nume}
                        onChange={e => setNewCustomer({ ...newCustomer, nume: e.target.value })}
                    />
                    <Input
                        placeholder="Prenume"
                        value={newCustomer.prenume}
                        onChange={e => setNewCustomer({ ...newCustomer, prenume: e.target.value })}
                    />
                    <Input
                        placeholder="Email"
                        value={newCustomer.email}
                        onChange={e => setNewCustomer({ ...newCustomer, email: e.target.value })}
                    />
                    <Input
                        placeholder="Telefon"
                        value={newCustomer.telefon}
                        onChange={e => setNewCustomer({ ...newCustomer, telefon: e.target.value })}
                    />
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