import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shirt } from 'lucide-react';
import React from 'react';

interface Service {
    id: number;
    name: string;
    price: number;
    category: { name: string } | null;
    service_type: { name: string } | null;
}

interface OrderItemProps {
    item: {
        id?: number;
        service_id: number;
        quantity: number;
        price: number;
        subtotal: number;
    };
    service: Service | undefined;
    saving: boolean;
    onChange: (field: string, value: any) => void;
    onRemove: () => void;
}

export default function OrderItem({ item, service, saving, onChange, onRemove }: OrderItemProps) {
    return (
        <Card className="w-full p-2 sm:p-3 flex flex-col justify-between min-h-0">
            <div className="flex items-center gap-3 w-full">
                <Shirt className="text-xl text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                    <CardTitle className="text-base font-semibold truncate leading-tight p-0 m-0" title={service?.name}>
                        {service?.name || 'Serviciu'}
                    </CardTitle>
                    <div className="flex gap-1 items-center flex-wrap text-xs">
                        {service?.service_type?.name && (
                            <Badge variant="secondary" className="text-xs px-2 py-0.5 font-normal rounded-md">
                                {service.service_type.name}
                            </Badge>
                        )}
                        {service?.category?.name && (
                            <Badge variant="outline" className="text-xs px-2 py-0.5 font-normal rounded-md">
                                {service.category.name}
                            </Badge>
                        )}
                        <span className="text-xs text-muted-foreground font-medium ml-1">
                            {item.price} RON / buc
                        </span>
                    </div>
                </div>
                <Button
                    variant="destructive"
                    size="icon"
                    onClick={onRemove}
                    disabled={saving}
                    aria-label="Șterge articol"
                    className="ml-2 w-9 h-9"
                >
                    ×
                </Button>
            </div>
            <CardContent className="p-0 pt-2 flex items-center gap-2 w-full min-h-0">
                <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={() => onChange('quantity', Math.max(1, item.quantity - 1))}
                    disabled={saving || item.quantity <= 1}
                    className="rounded-md w-8 h-8 text-base border"
                >
                    –
                </Button>
                <span className="font-medium text-base w-7 text-center select-none">
                    {item.quantity}
                </span>
                <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={() => onChange('quantity', item.quantity + 1)}
                    disabled={saving}
                    className="rounded-md w-8 h-8 text-base border"
                >
                    +
                </Button>
                <span className="ml-auto font-bold text-base whitespace-nowrap">
                    {item.subtotal} RON
                </span>
            </CardContent>
        </Card>
    );
} 