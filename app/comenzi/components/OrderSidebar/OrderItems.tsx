'use client';

import { useEffect, useState, useMemo } from 'react';
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
import OrderItem from './OrderItem';
import { Search } from 'lucide-react';

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
    const [view, setView] = useState<'comanda' | 'catalog'>('comanda');
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState<'toate' | 'casa' | 'haine' | 'speciale' | 'comanda'>('toate');

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
                const mapped: Service[] = (data as any[]).map(s => {
                    let category = null;
                    if (Array.isArray(s.category)) {
                        category = s.category.length > 0 && typeof s.category[0]?.name === 'string' ? { name: s.category[0].name } : null;
                    } else if (typeof s.category?.name === 'string') {
                        category = { name: s.category.name };
                    }
                    let service_type = null;
                    if (Array.isArray(s.service_type)) {
                        service_type = s.service_type.length > 0 && typeof s.service_type[0]?.name === 'string' ? { name: s.service_type[0].name } : null;
                    } else if (typeof s.service_type?.name === 'string') {
                        service_type = { name: s.service_type.name };
                    }
                    return {
                        ...s,
                        category,
                        service_type,
                    } as Service;
                });
                setServices(mapped);
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

    // Switch to 'catalog' if items is empty
    useEffect(() => {
        if (items.length === 0) {
            setView('catalog');
        }
    }, [items.length]);

    // Helper to get unique categories from services
    const categories = useMemo(() => {
        const cats = new Set<string>();
        services.forEach(s => {
            if (s.category?.name) cats.add(s.category.name);
        });
        return Array.from(cats);
    }, [services]);

    const filteredServices = useMemo(() => {
        let filtered = services;
        if (search.trim()) {
            const q = search.trim().toLowerCase();
            filtered = filtered.filter(s =>
                s.name.toLowerCase().includes(q) ||
                (s.category?.name?.toLowerCase().includes(q)) ||
                (s.service_type?.name?.toLowerCase().includes(q))
            );
        }
        if (category === 'casa') {
            filtered = filtered.filter(s => s.category?.name?.toLowerCase().includes('casă'));
        } else if (category === 'haine') {
            filtered = filtered.filter(s => s.category?.name?.toLowerCase().includes('haine'));
        } else if (category === 'speciale') {
            filtered = filtered.filter(s => s.category?.name?.toLowerCase().includes('speciale'));
        }
        return filtered;
    }, [services, search, category]);

    const filteredItems = useMemo(() => {
        if (category === 'comanda') {
            return items.filter(item => item.quantity > 0);
        }
        return items;
    }, [items, category]);

    const handleAddItem = () => {
        if (services.length === 0) return;
        const firstService = services[0] as Service;
        if (!firstService || typeof firstService.price !== 'number') return;

        const newItem: OrderItem = {
            service_id: firstService.id,
            quantity: 1,
            price: firstService.price,
            subtotal: firstService.price,
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
        <div className="space-y-4 flex-1">
            <div className="flex flex-col gap-2 sticky top-0 bg-background z-10">
                {/* Search bar */}
                <div className="flex items-center gap-2 p-2">
                    <Search className="w-5 h-5 text-muted-foreground" />
                    <Input
                        className="flex-1"
                        placeholder="Caută articole, categorii sau servicii..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                {/* Filter badges */}
                <div className="flex gap-2 px-2 pb-2">
                    <button
                        className={`px-4 py-1 rounded-full text-sm ${category === 'toate' ? 'bg-black text-white' : 'bg-muted text-foreground'}`}
                        onClick={() => setCategory('toate')}
                        type="button"
                    >
                        Toate
                    </button>
                    <button
                        className={`px-4 py-1 rounded-full font-semibold text-sm ${category === 'casa' ? 'bg-black text-white' : 'bg-muted text-foreground'}`}
                        onClick={() => setCategory('casa')}
                        type="button"
                    >
                        Articole de casă
                    </button>
                    <button
                        className={`px-4 py-1 rounded-full font-semibold text-sm ${category === 'haine' ? 'bg-black text-white' : 'bg-muted text-foreground'}`}
                        onClick={() => setCategory('haine')}
                        type="button"
                    >
                        Haine
                    </button>
                    <button
                        className={`px-4 py-1 rounded-full font-semibold text-sm ${category === 'speciale' ? 'bg-black text-white' : 'bg-muted text-foreground'}`}
                        onClick={() => setCategory('speciale')}
                        type="button"
                    >
                        Haine Speciale
                    </button>
                    <button
                        className={`px-4 py-1 rounded-full font-semibold text-sm ${category === 'comanda' ? 'bg-black text-white' : 'bg-muted text-foreground'}`}
                        onClick={() => setCategory('comanda')}
                        type="button"
                    >
                        Comanda
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                {category === 'comanda'
                    ? items.filter(item => item.quantity > 0).map((item, idx) => {
                        const service = services.find(s => s.id === item.service_id);
                        return (
                            <OrderItem
                                key={item.id ?? idx}
                                item={item}
                                service={service}
                                saving={saving}
                                onChange={(field, value) => handleItemChange(idx, field, value)}
                                onRemove={() => handleRemoveItem(idx)}
                            />
                        );
                    })
                    : filteredServices.map((service, idx) => {
                        // Find if this service is already in items
                        const itemIdx = items.findIndex(i => i.service_id === service.id);
                        const item = items[itemIdx] || { service_id: service.id, quantity: 0, price: service.price, subtotal: 0 };
                        return (
                            <OrderItem
                                key={service.id}
                                item={item}
                                service={service}
                                saving={saving}
                                onChange={(field, value) => handleItemChange(itemIdx >= 0 ? itemIdx : items.length, field, value)}
                                onRemove={itemIdx >= 0 ? () => handleRemoveItem(itemIdx) : () => { }}
                            />
                        );
                    })}
            </div>
        </div>
    );
} 