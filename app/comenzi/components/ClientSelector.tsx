import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { User, Phone, Mail, Pencil, X, Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { AddClientDialog } from "./AddClientDialog";
import { EditClientDialog } from "./EditClientDialog";

interface Client {
    id: string;
    prenume: string;
    nume: string;
    telefon: string;
    email?: string;
    accept_marketing_sms?: boolean;
    accept_marketing_email?: boolean;
}

interface ClientSelectorProps {
    order: any;
    customersList: Client[];
    customerPopoverOpen: boolean;
    setCustomerPopoverOpen: (open: boolean) => void;
    customerSearch: string;
    setCustomerSearch: (search: string) => void;
    onCustomerChange: (id: string) => Promise<void>;
    onClearClient: () => Promise<void>;
    onOrderUpdated?: () => void;
    refreshClient: () => void;
}

export function ClientSelector({
    order,
    customersList,
    customerPopoverOpen,
    setCustomerPopoverOpen,
    customerSearch,
    setCustomerSearch,
    onCustomerChange,
    onClearClient,
    onOrderUpdated,
    refreshClient,
}: ClientSelectorProps) {
    const [editClientDialogOpen, setEditClientDialogOpen] = useState(false);
    const [addClientDialogOpen, setAddClientDialogOpen] = useState(false);

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
                            await onClearClient();
                            if (typeof onOrderUpdated === "function") onOrderUpdated();
                        }}>
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                    <EditClientDialog
                        open={editClientDialogOpen}
                        onOpenChange={setEditClientDialogOpen}
                        initialValues={{
                            id: order.customers.id,
                            prenume: order.customers.prenume ?? "",
                            nume: order.customers.nume ?? "",
                            email: order.customers.email ?? "",
                            telefon: order.customers.telefon ?? "",
                            accept_marketing_sms: order.customers.accept_marketing_sms ?? false,
                            accept_marketing_email: order.customers.accept_marketing_email ?? false,
                        }}
                        onSuccess={() => {
                            setEditClientDialogOpen(false);
                            refreshClient();
                            if (typeof onOrderUpdated === "function") onOrderUpdated();
                        }}
                    />
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
                                            await onCustomerChange(c.id);
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
                    <AddClientDialog
                        open={addClientDialogOpen}
                        onOpenChange={setAddClientDialogOpen}
                        onSuccess={() => {
                            setAddClientDialogOpen(false);
                            refreshClient();
                        }}
                    />
                </div>
            )}
        </div>
    );
} 