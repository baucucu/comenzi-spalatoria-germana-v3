'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import GeoapifyAutocomplete from '@/components/GeoapifyAutocomplete';

interface Address {
    id: number;
    adresa: string;
    detalii: string;
}

interface OrderAddressProps {
    orderId: number | null;
    type: 'colectare' | 'returnare';
}

export default function OrderAddress({ orderId, type }: OrderAddressProps) {
    const [customerId, setCustomerId] = useState<string | null>(null);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddress, setSelectedAddress] = useState<string>('');
    const [addOpen, setAddOpen] = useState(false);
    const [newAddress, setNewAddress] = useState({ adresa: '', detalii: '' });
    const [saving, setSaving] = useState(false);

    // Fetch customerId for the order
    useEffect(() => {
        if (!orderId) {
            setCustomerId(null);
            return;
        }
        const fetchCustomerId = async () => {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('orders')
                .select('customer_id, adresa_colectare_id, adresa_returnare_id')
                .eq('id', orderId)
                .single();
            if (error) return;
            setCustomerId(data.customer_id);
            if (type === 'colectare') {
                setSelectedAddress(data.adresa_colectare_id ? data.adresa_colectare_id.toString() : '');
            } else {
                setSelectedAddress(data.adresa_returnare_id ? data.adresa_returnare_id.toString() : '');
            }
        };
        fetchCustomerId();
    }, [orderId, type]);

    // Fetch addresses for customer
    useEffect(() => {
        if (!customerId) {
            setAddresses([]);
            return;
        }
        const fetchAddresses = async () => {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('addresses')
                .select('id, adresa, detalii')
                .eq('customer_id', customerId)
                .order('id');
            if (error) {
                toast.error('Eroare la încărcarea adreselor: ' + error.message);
                return;
            }
            setAddresses(data || []);
        };
        fetchAddresses();
    }, [customerId]);

    // Save selected address to order
    const handleAddressChange = async (value: string) => {
        setSelectedAddress(value);
        if (!orderId) return;
        setSaving(true);
        const supabase = createClient();
        const field = type === 'colectare' ? 'adresa_colectare_id' : 'adresa_returnare_id';
        const { error } = await supabase
            .from('orders')
            .update({ [field]: value ? parseInt(value) : null })
            .eq('id', orderId);
        setSaving(false);
        if (error) {
            toast.error('Eroare la salvarea adresei: ' + error.message);
        }
    };

    // Add new address
    const handleAddAddress = async () => {
        if (!customerId) return;
        setSaving(true);
        const supabase = createClient();
        const { data, error } = await supabase
            .from('addresses')
            .insert({ ...newAddress, customer_id: customerId })
            .select()
            .single();
        setSaving(false);
        if (error) {
            toast.error('Eroare la adăugarea adresei: ' + error.message);
            return;
        }
        setAddresses(prev => [data, ...prev]);
        setSelectedAddress(data.id.toString());
        setAddOpen(false);
        setNewAddress({ adresa: '', detalii: '' });
        // Save new address to order
        if (orderId) {
            const field = type === 'colectare' ? 'adresa_colectare_id' : 'adresa_returnare_id';
            await supabase
                .from('orders')
                .update({ [field]: data.id })
                .eq('id', orderId);
        }
        toast.success('Adresă adăugată!');
    };

    return (
        <Card className="p-4 flex flex-col gap-2">
            <Label>{type === 'colectare' ? 'Adresă colectare' : 'Adresă returnare'}</Label>
            <div className="flex flex-col gap-2">
                <Select
                    value={selectedAddress}
                    onValueChange={handleAddressChange}
                    disabled={saving || addresses.length === 0}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selectează adresa" />
                    </SelectTrigger>
                    <SelectContent>
                        {addresses.map(addr => (
                            <SelectItem key={addr.id} value={addr.id.toString()}>
                                {addr.adresa} {addr.detalii ? `(${addr.detalii})` : ''}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button
                    size="sm"
                    variant={addOpen ? 'destructive' : 'secondary'}
                    onClick={() => setAddOpen(v => !v)}
                >
                    {addOpen ? 'Anulează' : 'Adaugă adresă nouă'}
                </Button>
            </div>
            {addOpen && (
                <div className="border rounded p-3 mt-2 flex flex-col gap-2 bg-muted/50">
                    <GeoapifyAutocomplete
                        value={newAddress.adresa}
                        onChange={val => setNewAddress(a => ({ ...a, adresa: val }))}
                        placeholder="Adresă (București sau Ilfov)"
                    />
                    <textarea
                        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring resize-none min-h-[40px]"
                        placeholder="Detalii (opțional)"
                        value={newAddress.detalii}
                        onChange={e => setNewAddress(a => ({ ...a, detalii: e.target.value }))}
                        disabled={saving}
                        rows={2}
                    />
                    <Button type="button" size="sm" onClick={handleAddAddress} disabled={saving || !newAddress.adresa}>
                        {saving ? 'Se adaugă...' : 'Salvează adresa'}
                    </Button>
                </div>
            )}
        </Card>
    );
} 