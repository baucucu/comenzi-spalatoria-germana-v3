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

export default function OrderCustomer({ orderId }: { orderId?: number | null }) {
    const [customers, setCustomers] = useState<any[]>([]);
    const [customerSearch, setCustomerSearch] = useState("");
    const [addCustomerOpen, setAddCustomerOpen] = useState(false);
    const [newCustomer, setNewCustomer] = useState({ nume: "", prenume: "", email: "", telefon: "" });
    const [addingCustomer, setAddingCustomer] = useState(false);
    const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const supabase = createClient();

    // Fetch order's customer when orderId changes
    useEffect(() => {
        if (!orderId) {
            setSelectedCustomerId("");
            return;
        }
        setLoading(true);
        const fetchOrderCustomer = async () => {
            const { data, error } = await supabase
                .from("orders")
                .select("customer_id")
                .eq("id", orderId)
                .single();
            setLoading(false);
            if (error) {
                toast.error("Eroare la încărcarea clientului: " + error.message);
                setSelectedCustomerId("");
                return;
            }
            setSelectedCustomerId(data?.customer_id || "");
        };
        fetchOrderCustomer();
    }, [orderId]);

    // Fetch customers when search changes
    useEffect(() => {
        let isCancelled = false;
        const fetchCustomers = async () => {
            let query = supabase
                .from("customers")
                .select("id, nume, prenume, email, telefon")
                .order("nume");
            if (customerSearch.trim()) {
                const cleanedSearch = customerSearch.trim().replace(/[&|!():*]/g, "");
                const tsQuery = cleanedSearch
                    .split(/\s+/)
                    .filter(Boolean)
                    .map(term => `${term}:*`)
                    .join(" & ");
                if (tsQuery) {
                    query = query.textSearch("fts", tsQuery, {
                        config: "romanian",
                        type: "tsquery",
                    } as any);
                }
            }
            const { data } = await query;
            if (!isCancelled) {
                setCustomers(data || []);
            }
        };
        const timeoutId = setTimeout(() => {
            fetchCustomers();
        }, 300);
        return () => {
            clearTimeout(timeoutId);
            isCancelled = true;
        };
    }, [customerSearch]);

    // Add new customer
    const handleAddCustomer = async () => {
        setAddingCustomer(true);
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
            await handleCustomerChange(data.id);
            setAddCustomerOpen(false);
            setNewCustomer({ nume: "", prenume: "", email: "", telefon: "" });
            toast.success("Client adăugat!");
        }
    };

    // Update order's customer
    const handleCustomerChange = async (customerId: string) => {
        // Only update if the selected customer is different from the current one
        if (!orderId || customerId === selectedCustomerId) return;
        setSelectedCustomerId(customerId);
        setLoading(true);
        const { error } = await supabase
            .from("orders")
            .update({
                customer_id: customerId,
                adresa_colectare_id: null,
                adresa_returnare_id: null,
                data_colectare: null,
                data_returnare: null,
            })
            .eq("id", orderId);
        setLoading(false);
        if (error) {
            toast.error("Eroare la actualizarea clientului: " + error.message);
        }
    };

    const [customerComboboxOpen, setCustomerComboboxOpen] = useState(false);

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
                        disabled={loading}
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
                            onValueChange={setCustomerSearch}
                        />
                        <CommandList>
                            <CommandEmpty>Niciun client găsit.</CommandEmpty>
                            <CommandGroup>
                                {customers.map(c => {
                                    const display = `${c.nume} ${c.prenume}${c.telefon ? ` - ${c.telefon}` : ''}${c.email ? ` - ${c.email}` : ''}`;
                                    return (
                                        <CommandItem
                                            key={c.id}
                                            value={c.id}
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
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
            <Button
                size="sm"
                variant={addCustomerOpen ? 'destructive' : 'secondary'}
                onClick={() => setAddCustomerOpen(v => !v)}
                disabled={loading}
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
            {(loading || addingCustomer) && (
                <div className="text-xs text-muted-foreground">
                    {loading ? 'Se încarcă...' : 'Se salvează...'}
                </div>
            )}
        </Card>
    );
}