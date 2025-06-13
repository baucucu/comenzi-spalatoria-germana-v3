import { StatusSelector } from "./StatusSelector";
import { ClientSelector } from "./ClientSelector";
import { AddressSelector } from "./AddressSelector";

interface OrderDetailsTabProps {
    order: any;
    statuses: any[];
    isLoading: boolean;
    onUrgencyChange: (value: string) => void;
    onStatusChange: (value: string) => void;
    customersList: any[];
    customerPopoverOpen: boolean;
    setCustomerPopoverOpen: (open: boolean) => void;
    customerSearch: string;
    setCustomerSearch: (search: string) => void;
    onCustomerChange: (id: string) => Promise<void>;
    onClearClient: () => Promise<void>;
    onOrderUpdated?: () => void;
    refreshClient: () => void;
    addresses: any[];
    pickupPopoverOpen: boolean;
    setPickupPopoverOpen: (open: boolean) => void;
    deliveryPopoverOpen: boolean;
    setDeliveryPopoverOpen: (open: boolean) => void;
    onPickupChange: (value: string) => void;
    onDeliveryChange: (value: string) => void;
    formatDate: (date: string | null) => string;
}

export function OrderDetailsTab(props: OrderDetailsTabProps) {
    const {
        order,
        statuses,
        isLoading,
        onUrgencyChange,
        onStatusChange,
        customersList,
        customerPopoverOpen,
        setCustomerPopoverOpen,
        customerSearch,
        setCustomerSearch,
        onCustomerChange,
        onClearClient,
        onOrderUpdated,
        refreshClient,
        addresses,
        pickupPopoverOpen,
        setPickupPopoverOpen,
        deliveryPopoverOpen,
        setDeliveryPopoverOpen,
        onPickupChange,
        onDeliveryChange,
        formatDate,
    } = props;
    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* First row: order #, date */}
            <div className="flex items-center gap-3 flex-wrap">
                <span className="text-lg font-semibold">#{order.id}</span>
                <span className="text-sm text-muted-foreground">
                    {formatDate(order.date_created)}
                </span>
            </div>
            {/* Second row: urgent and status selectors */}
            <StatusSelector
                order={order}
                statuses={statuses}
                isLoading={isLoading}
                onUrgencyChange={onUrgencyChange}
                onStatusChange={onStatusChange}
            />
            {/* Client selector */}
            <ClientSelector
                order={order}
                customersList={customersList}
                customerPopoverOpen={customerPopoverOpen}
                setCustomerPopoverOpen={setCustomerPopoverOpen}
                customerSearch={customerSearch}
                setCustomerSearch={setCustomerSearch}
                onCustomerChange={onCustomerChange}
                onClearClient={onClearClient}
                onOrderUpdated={onOrderUpdated}
                refreshClient={refreshClient}
            />
            {/* Pickup and Delivery address selectors */}
            <AddressSelector
                order={order}
                addresses={addresses}
                pickupPopoverOpen={pickupPopoverOpen}
                setPickupPopoverOpen={setPickupPopoverOpen}
                deliveryPopoverOpen={deliveryPopoverOpen}
                setDeliveryPopoverOpen={setDeliveryPopoverOpen}
                onPickupChange={onPickupChange}
                onDeliveryChange={onDeliveryChange}
            />
        </div>
    );
} 