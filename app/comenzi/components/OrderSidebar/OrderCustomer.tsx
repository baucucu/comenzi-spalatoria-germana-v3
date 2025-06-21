"use client";

import { useState } from "react";
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
import { useCustomer } from "./useCustomer";

export default function OrderCustomer({
    orderId,
    value,
    onChange,
}: {
    orderId?: number | null,
    value?: string,
    onChange?: (id: string) => void,
}) {
    const {
        customers,
        customerSearch,
        setCustomerSearch,
        addCustomerOpen,
        setAddCustomerOpen,
        newCustomer,
        setNewCustomer,
        addingCustomer,
        selectedCustomerId,
        handleAddCustomer,
        handleCustomerChange
    } = useCustomer(orderId, value, onChange);

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
                                                console.log(c.id);
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
        </Card>
    );
}