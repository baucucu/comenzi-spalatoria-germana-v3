'use client';

import { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

import OrderItem from './OrderItem';
import { Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { matchesSearch } from '@/app/servicii/utils';

interface Service {
    id: number;
    name: string;
    price: number;
    unit: string;
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
    const [category, setCategory] = useState<string>('toate');
    const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);

    // Fetch services
    useEffect(() => {
        const fetchServices = async () => {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('services')
                .select('id, name, price, unit, category:categories(name), service_type:service_types(name)')
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
                .select('id, service_id, cantitate, total_articol, service:services(id, name, price, unit)')
                .eq('order_id', orderId);

            if (error) {
                toast.error('Eroare la încărcarea articolelor: ' + error.message);
                return;
            }

            if (data) {
                setItems(data.map(item => {
                    const serviceData = Array.isArray(item.service) ? item.service[0] : item.service;
                    return {
                        id: item.id,
                        service_id: item.service_id,
                        quantity: item.cantitate,
                        price: serviceData?.price || 0,
                        subtotal: item.total_articol,
                    };
                }));
            }
        };

        fetchOrderItems();
    }, [orderId]);

    // Fetch categories from DB
    useEffect(() => {
        const fetchCategories = async () => {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('categories')
                .select('id, name')
                .order('name');
            if (!error && data) setCategories(data);
        };
        fetchCategories();
    }, []);

    // Switch to 'catalog' if items is empty
    useEffect(() => {
        if (items.length === 0) {
            setView('catalog');
        }
    }, [items.length]);

    // Helper to get unique categories from services
    const categoriesFromServices = useMemo(() => {
        const cats = new Set<string>();
        services.forEach(s => {
            if (s.category?.name) cats.add(s.category.name);
        });
        return Array.from(cats);
    }, [services]);

    const filterOptions = [
        { key: 'comanda', label: 'Comanda' },
        { key: 'toate', label: 'Toate' },
        ...categories.map(c => ({ key: c.id.toString(), label: c.name })),
    ];

    const isCategorySelected = (key: string) => category === key;

    const handleCategorySelect = (key: string) => setCategory(key);

    const filteredServices = useMemo(() => {
        let filtered = services;
        if (search.trim()) {
            const q = search.trim();
            filtered = filtered.filter(s =>
                matchesSearch(s.name, q) ||
                (s.category?.name && matchesSearch(s.category.name, q)) ||
                (s.service_type?.name && matchesSearch(s.service_type.name, q))
            );
        }
        if (category !== 'toate' && category !== 'comanda') {
            const selectedCat = categories.find(c => c.id.toString() === category)?.name;
            if (selectedCat) {
                filtered = filtered.filter(s => s.category?.name === selectedCat);
            }
        }
        return filtered;
    }, [services, search, category, categories]);

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

    const handleItemChange = async (id: number | undefined, field: string, value: any, serviceObj?: Service) => {
        let updatedItems = [...items];
        let itemToUpdate: OrderItem | undefined;
        let idx = -1;
        if (id !== undefined) {
            idx = items.findIndex(i => i.id === id);
        }
        // Fallback for items without id (not yet saved)
        if (idx === -1 && id === undefined && serviceObj) {
            idx = items.findIndex(i => i.service_id === serviceObj.id && i.id === undefined);
        }
        const service = serviceObj || (idx !== -1 ? services.find(s => s.id === items[idx].service_id) : undefined);
        if (!service || idx === -1) return;

        // Update existing item
        itemToUpdate = {
            ...items[idx],
            [field]: value,
        };
        if (field === 'quantity' || field === 'price') {
            itemToUpdate.subtotal = itemToUpdate.quantity * itemToUpdate.price;
        }
        updatedItems[idx] = itemToUpdate;

        setItems(updatedItems);

        if (orderId) {
            await saveItem(itemToUpdate);
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
            <div className="flex flex-col gap-2 sticky top-0 shadow-sm bg-background z-10">
                {/* Search bar */}
                <div className="flex items-center gap-2 pb-2">
                    <Search className="w-5 h-5 text-muted-foreground" />
                    <Input
                        className="flex-1"
                        placeholder="Caută articole, categorii sau servicii..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                {/* Filter badges */}
                <div className="flex gap-2 px-2 pb-2 flex-wrap">
                    {filterOptions.map(opt => (
                        <Badge
                            key={opt.key}
                            variant={isCategorySelected(opt.key) ? 'default' : 'secondary'}
                            className="cursor-pointer select-none"
                            onClick={() => handleCategorySelect(opt.key)}
                            style={{ userSelect: 'none' }}
                        >
                            {opt.label}
                        </Badge>
                    ))}
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
                                onChange={(id: number | undefined, field: string, value: any) => { void handleItemChange(id, field, value, service); }}
                                onRemove={() => handleRemoveItem(idx)}
                                onAddAnother={() => {
                                    if (!service) return;
                                    const newItem = {
                                        service_id: service.id,
                                        quantity: 1,
                                        price: service.price,
                                        subtotal: service.price,
                                    };
                                    setItems(prev => [...prev, newItem]);
                                    if (orderId) {
                                        saveItem(newItem);
                                    }
                                }}
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
                                onChange={(id: number | undefined, field: string, value: any) => { void handleItemChange(id, field, value, service); }}
                                onRemove={itemIdx >= 0 ? () => handleRemoveItem(itemIdx) : () => { }}
                            />
                        );
                    })}
            </div>
        </div>
    );
} 