import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
        <Card className="p-4 space-y-2">
            <div className="flex items-center gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-base">{service?.name || 'Serviciu'}</span>
                        {service?.service_type?.name && (
                            <Badge variant="secondary">{service.service_type.name}</Badge>
                        )}
                        {service?.category?.name && (
                            <Badge variant="outline">{service.category.name}</Badge>
                        )}
                    </div>
                </div>
                <Button
                    variant="destructive"
                    size="icon"
                    onClick={onRemove}
                    disabled={saving}
                    aria-label="Șterge articol"
                >
                    ×
                </Button>
            </div>
            <div className="flex gap-4 items-end">
                <div className="w-32">
                    <Label>Cantitate</Label>
                    <div className="flex items-center gap-1">
                        <Button
                            type="button"
                            size="icon"
                            variant="outline"
                            onClick={() => onChange('quantity', Math.max(1, item.quantity - 1))}
                            disabled={saving || item.quantity <= 1}
                        >
                            -
                        </Button>
                        <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={e => onChange('quantity', Math.max(1, parseInt(e.target.value) || 1))}
                            disabled={saving}
                            className="w-14 text-center"
                        />
                        <Button
                            type="button"
                            size="icon"
                            variant="outline"
                            onClick={() => onChange('quantity', item.quantity + 1)}
                            disabled={saving}
                        >
                            +
                        </Button>
                    </div>
                </div>
                <div className="w-24">
                    <Label>Preț</Label>
                    <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.price}
                        onChange={e => onChange('price', parseFloat(e.target.value) || 0)}
                        disabled={saving}
                    />
                </div>
                <div className="w-24">
                    <Label>Total</Label>
                    <Input
                        type="number"
                        value={item.subtotal}
                        disabled
                    />
                </div>
            </div>
        </Card>
    );
} 