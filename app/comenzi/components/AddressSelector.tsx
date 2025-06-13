import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface Address {
    id: number;
    adresa: string;
    detalii?: string;
}

interface AddressSelectorProps {
    order: any;
    addresses: Address[];
    pickupPopoverOpen: boolean;
    setPickupPopoverOpen: (open: boolean) => void;
    deliveryPopoverOpen: boolean;
    setDeliveryPopoverOpen: (open: boolean) => void;
    onPickupChange: (value: string) => void;
    onDeliveryChange: (value: string) => void;
}

export function AddressSelector({
    order,
    addresses,
    pickupPopoverOpen,
    setPickupPopoverOpen,
    deliveryPopoverOpen,
    setDeliveryPopoverOpen,
    onPickupChange,
    onDeliveryChange,
}: AddressSelectorProps) {
    return (
        <>
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
                                    onPickupChange("null");
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
                                        onPickupChange(String(addr.id));
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
                                    onDeliveryChange("null");
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
                                        onDeliveryChange(String(addr.id));
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
        </>
    );
} 