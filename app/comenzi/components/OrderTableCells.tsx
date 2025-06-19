import { Order } from "../types";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";
import { useOrderStatuses } from "./useOrderStatuses";

export function OrderMainCell({ order }: { order: Order }) {
    return (
        <div className="flex flex-col items-start gap-0.5">
            <span className="font-semibold">{order.id}</span>
            <span className="text-xs text-muted-foreground">
                {new Date(order.date_created).toLocaleDateString()}
            </span>
            {/* {order.urgent && (
                <Badge variant="destructive" className="flex items-center gap-1 px-1.5 py-0.5 text-xs mt-0.5">
                    <AlertCircle className="w-3 h-3 mr-1" /> Urgent
                </Badge>
            )} */}
        </div>
    );
}

export function OrderStatusCell({ status }: { status: string }) {
    const { statuses, loading } = useOrderStatuses();
    if (loading) return <Badge variant="secondary">...</Badge>;
    const found = statuses.find(s => s.name === status);
    if (!found) return <Badge variant="secondary">Necunoscut</Badge>;
    // Use the color from the database as a className, fallback to default if not present
    return (
        <Badge className={found.color ? `${found.color} text-white` : undefined} variant={found.color ? undefined : "secondary"}>
            {found.label}
        </Badge>
    );
}

export function OrderUrgentCell({ urgent }: { urgent: boolean }) {
    return (
        <Badge variant="destructive" className="">
            <AlertCircle className="w-3 h-3 mr-1" /> Urgent
        </Badge>
    );
}

export function OrderClientCell({ order }: { order: Order }) {
    const c = order.customers;
    if (!c) return <span className="text-muted-foreground">-</span>;
    return (
        <div className="flex flex-col">
            <span>
                {c.nume} {c.prenume}
            </span>
            {c.telefon && (
                <span className="text-xs text-muted-foreground">{c.telefon}</span>
            )}
            {c.email && (
                <span className="text-xs text-muted-foreground">{c.email}</span>
            )}
        </div>
    );
} 