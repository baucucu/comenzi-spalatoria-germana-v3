import { Package, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface OrderItemsTabProps {
    order: any;
    formatCurrency: (amount: number) => string;
}

export function OrderItemsTab({ order, formatCurrency }: OrderItemsTabProps) {
    return (
        <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
                {/* Order Items */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        Articole Comandă
                    </h3>
                    <div className="space-y-4">
                        {order.order_services.map((item: any) => (
                            <div key={item.id} className="border rounded-lg p-3 space-y-2">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">{item.services.name}</p>
                                        <div className="flex gap-2 mt-1">
                                            <Badge variant="outline">{item.services.categories.name}</Badge>
                                            <Badge variant="outline">{item.services.service_types.name}</Badge>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-muted-foreground">
                                            {item.quantity} x {formatCurrency(item.price)} lei
                                        </p>
                                        <p className="font-bold">{formatCurrency(item.subtotal)} lei</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Notes */}
                {order.notes && (
                    <>
                        <Separator />
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                Note
                            </h3>
                            <p className="whitespace-pre-wrap">{order.notes}</p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
} 