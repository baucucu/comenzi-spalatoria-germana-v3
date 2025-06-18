'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

interface Service {
    id: number;
    name: string;
    price: number;
    category: { name: string } | null;
    service_type: { name: string } | null;
}

interface OrderItem {
    id?: number;
    service_id: number;
    quantity: number;
    price: number;
    subtotal: number;
}

interface OrderItemsProps {
    orderId: number | null;
}

export default function OrderItems({ orderId }: OrderItemsProps) {
    const [services, setServices] = useState<Service[]>([]);
    const [items, setItems] = useState<OrderItem[]>([]);
    const [saving, setSaving] = useState(false);

    // Fetch services
    useEffect(() => {
        const fetchServices = async () => {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('services')
                .select('id, name, price, category:categories(name), service_type:service_types(name)')
                .order('name');

            if (error) {
                toast.error('Eroare la încărcarea serviciilor: ' + error.message);
                return;
            }

            if (data) {
                setServices(data.map(s => ({
                    ...s,
                    category: Array.isArray(s.category) && s.category.length > 0 ? s.category[0] : null,
                    service_type: Array.isArray(s.service_type) && s.service_type.length > 0 ? s.service_type[0] : null,
                })));
            }
        };

        fetchServices();
    }, []);

    // Fetch order items
    useEffect(() => {
        if (!orderId) {
            setItems([]);
            return;
        }

        const fetchOrderItems = async () => {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('order_services')
                .select('id, service_id, cantitate, total_articol, service:services(id, name, price)')
                .eq('order_id', orderId);

            if (error) {
                toast.error('Eroare la încărcarea articolelor: ' + error.message);
                return;
            }

            if (data) {
                setItems(data.map(item => ({
                    id: item.id,
                    service_id: item.service_id,
                    quantity: item.cantitate,
                    price: item.service?.price || 0,
                    subtotal: item.total_articol,
                })));
            }
        };

        fetchOrderItems();
    }, [orderId]);

    const handleAddItem = () => {
        if (services.length === 0) return;

        const newItem: OrderItem = {
            service_id: services[0].id,
            quantity: 1,
            price: services[0].price,
            subtotal: services[0].price,
        };

        setItems(prev => [...prev, newItem]);

        if (orderId) {
            saveItem(newItem);
        }
    };

    const handleItemChange = async (idx: number, field: string, value: any) => {
        const updatedItems = items.map((item, i) => {
            if (i !== idx) return item;

            const updatedItem = {
                ...item,
                [field]: value,
            };

            // Recalculate subtotal if quantity or price changed
            if (field === 'quantity' || field === 'price') {
                updatedItem.subtotal = updatedItem.quantity * updatedItem.price;
            }

            return updatedItem;
        });

        setItems(updatedItems);

        if (orderId) {
            await saveItem(updatedItems[idx]);
        }
    };

    const handleRemoveItem = async (idx: number) => {
        const item = items[idx];
        setItems(items.filter((_, i) => i !== idx));

        if (orderId && item.id) {
            setSaving(true);
            const supabase = createClient();
            const { error } = await supabase
                .from('order_services')
                .delete()
                .eq('id', item.id);

            setSaving(false);

            if (error) {
                toast.error('Eroare la ștergerea articolului: ' + error.message);
                return;
            }
        }
    };

    const saveItem = async (item: OrderItem) => {
        if (!orderId) return;

        setSaving(true);
        const supabase = createClient();

        if (item.id) {
            // Update
            const { error } = await supabase
                .from('order_services')
                .update({
                    service_id: item.service_id,
                    cantitate: item.quantity,
                    total_articol: item.subtotal,
                })
                .eq('id', item.id);

            setSaving(false);

            if (error) {
                toast.error('Eroare la actualizarea articolului: ' + error.message);
            }
        } else {
            // Insert
            const { error, data } = await supabase
                .from('order_services')
                .insert({
                    order_id: orderId,
                    service_id: item.service_id,
                    cantitate: item.quantity,
                    total_articol: item.subtotal,
                })
                .select('id')
                .single();

            setSaving(false);

            if (error) {
                toast.error('Eroare la adăugarea articolului: ' + error.message);
            } else if (data) {
                // Update local state with the new ID
                setItems(prev => prev.map(i =>
                    i === item ? { ...i, id: data.id } : i
                ));
            }
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <Label>Articole comandă</Label>
                <Button
                    onClick={handleAddItem}
                    variant="outline"
                    size="sm"
                    disabled={saving || services.length === 0}
                >
                    Adaugă articol
                </Button>
            </div>

            <div className="space-y-4">
                {items.map((item, idx) => (
                    <Card key={idx} className="p-4 space-y-4">
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <Label>Serviciu</Label>
                                <Select
                                    value={item.service_id.toString()}
                                    onValueChange={(value) => handleItemChange(idx, 'service_id', parseInt(value))}
                                    disabled={saving}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {services.map((service) => (
                                            <SelectItem key={service.id} value={service.id.toString()}>
                                                {service.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="w-24">
                                <Label>Cantitate</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    value={item.quantity}
                                    onChange={(e) => handleItemChange(idx, 'quantity', parseInt(e.target.value) || 0)}
                                    disabled={saving}
                                />
                            </div>

                            <div className="w-24">
                                <Label>Preț</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={item.price}
                                    onChange={(e) => handleItemChange(idx, 'price', parseFloat(e.target.value) || 0)}
                                    disabled={saving}
                                />
                            </div>

                            <div className="w-24">
                                <Label>Subtotal</Label>
                                <Input
                                    type="number"
                                    value={item.subtotal}
                                    disabled
                                />
                            </div>

                            <Button
                                variant="destructive"
                                size="icon"
                                className="mt-auto"
                                onClick={() => handleRemoveItem(idx)}
                                disabled={saving}
                            >
                                ×
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
} 