import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface OrderStatus {
    id: number;
    name: string;
    label: string;
    color: string;
    position: number;
    status_final: boolean;
}

interface StatusSelectorProps {
    order: { urgent: boolean; status: string };
    statuses: OrderStatus[];
    isLoading: boolean;
    onUrgencyChange: (value: string) => void;
    onStatusChange: (value: string) => void;
}

export function StatusSelector({ order, statuses, isLoading, onUrgencyChange, onStatusChange }: StatusSelectorProps) {
    return (
        <div className="flex items-center gap-2 flex-wrap">
            <Select
                defaultValue={order.urgent ? "urgent" : "normal"}
                onValueChange={onUrgencyChange}
                disabled={isLoading}
            >
                <SelectTrigger className="w-[110px]">
                    <SelectValue placeholder="Urgenta" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
            </Select>
            <div className="flex-1 min-w-[180px]">
                <Select
                    defaultValue={order.status || undefined}
                    onValueChange={onStatusChange}
                    disabled={isLoading}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Selectează status" />
                    </SelectTrigger>
                    <SelectContent>
                        {statuses.map((status) => (
                            <SelectItem key={status.name} value={status.name}>
                                <div className="flex items-center gap-2">
                                    <Badge className={`${status.color} text-white`}>
                                        {status.label}
                                    </Badge>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
} 