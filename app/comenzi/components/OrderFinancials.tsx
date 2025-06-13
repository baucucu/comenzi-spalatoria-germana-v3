import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

interface OrderFinancialsProps {
    order: any;
    isLoading: boolean;
    currentDiscount: number;
    onPaymentMethodChange: (value: string) => void;
    onDiscountChange: (value: string) => void;
    PAYMENT_METHODS: { value: string; label: string }[];
    DISCOUNT_OPTIONS: { value: number; label: string }[];
    formatCurrency: (amount: number) => string;
}

export function OrderFinancials({
    order,
    isLoading,
    currentDiscount,
    onPaymentMethodChange,
    onDiscountChange,
    PAYMENT_METHODS,
    DISCOUNT_OPTIONS,
    formatCurrency,
}: OrderFinancialsProps) {
    return (
        <div className="sticky bottom-0 z-10 bg-background border-t">
            <div className="p-4 space-y-3">
                {/* Subtotal */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{formatCurrency(order.total_comanda_fara_discount)} lei</span>
                </div>
                {/* Discount & Payment Method */}
                <div className="flex items-center justify-between gap-2">
                    <Select
                        defaultValue={order.payment_method || undefined}
                        onValueChange={onPaymentMethodChange}
                        disabled={isLoading}
                    >
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Metodă plată" />
                        </SelectTrigger>
                        <SelectContent>
                            {PAYMENT_METHODS.map((method) => (
                                <SelectItem key={method.value} value={method.value}>
                                    {method.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <div className="flex items-center gap-2 flex-1">
                        <Select
                            defaultValue={currentDiscount.toString()}
                            onValueChange={onDiscountChange}
                            disabled={isLoading}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Discount" />
                            </SelectTrigger>
                            <SelectContent>
                                {DISCOUNT_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value.toString()}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {currentDiscount > 0 && (
                            <span className="text-sm text-orange-500 whitespace-nowrap">
                                -{formatCurrency(order.total_comanda_fara_discount - order.total_comanda_cu_discount)} lei
                            </span>
                        )}
                    </div>
                </div>
                {/* Total */}
                <div className="flex items-center justify-between pt-2 border-t">
                    <span className="font-medium">Total</span>
                    <span className="text-lg font-semibold">{formatCurrency(order.total_comanda_cu_discount)} lei</span>
                </div>
            </div>
        </div>
    );
} 