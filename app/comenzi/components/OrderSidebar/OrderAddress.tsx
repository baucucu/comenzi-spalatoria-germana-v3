'use client';

import { useEffect, useState, useRef } from 'react';
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
import { X } from 'lucide-react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import { DateTimePicker } from '@/components/datetimepicker';

interface Address {
    id: number;
    adresa: string;
    detalii?: string;
}

interface OrderAddressProps {
    orderId: number | null;
    type: 'colectare' | 'returnare';
}

export default function OrderAddress({ orderId, type }: OrderAddressProps) {
    const [addOpen, setAddOpen] = useState(false);
    const [newAddress, setNewAddress] = useState({ adresa: '', detalii: '' });
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(false);
    const supabase = createClient();

    // Real-time state
    const [order, setOrder] = useState<any>(null);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [customerId, setCustomerId] = useState<string | null>(null);
    const [addressId, setAddressId] = useState<number | undefined>(undefined);
    const [dateTime, setDateTime] = useState<string>("");
    const [isActive, setIsActive] = useState(false);
    const lastAddedAddressId = useRef<number | null>(null);

    // Subscribe to order changes
    useEffect(() => {
        if (!orderId) {
            setOrder(null);
            setCustomerId(null);
            setAddressId(undefined);
            setDateTime("");
            setIsActive(false);
            return;
        }
        setLoading(true);
        let ignore = false;
        const fetchOrder = async () => {
            const addressField = type === 'colectare' ? 'adresa_colectare_id' : 'adresa_returnare_id';
            const dateTimeField = type === 'colectare' ? 'data_colectare' : 'data_returnare';
            const { data, error } = await supabase
                .from('orders')
                .select(`id, customer_id, ${addressField}, ${dateTimeField}`)
                .eq('id', orderId)
                .single();
            setLoading(false);
            if (error) {
                toast.error('Eroare la încărcarea adresei: ' + error.message);
                setOrder(null);
                setCustomerId(null);
                setAddressId(undefined);
                setDateTime("");
                setIsActive(false);
                return;
            }
            if (!ignore) {
                setOrder(data);
                setCustomerId((data as Record<string, any>).customer_id ?? null);
                setAddressId((data as Record<string, any>)[addressField] ?? undefined);
                setDateTime((data as Record<string, any>)[dateTimeField] ?? "");
                setIsActive(!!(data as Record<string, any>)[addressField]);
            }
        };
        fetchOrder();
        // Real-time subscription
        const channel = supabase.channel(`order-address-${orderId}-${type}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` }, (payload) => {
                fetchOrder();
            })
            .subscribe();
        return () => {
            ignore = true;
            supabase.removeChannel(channel);
        };
    }, [orderId, type]);

    // Subscribe to addresses for the current customer
    useEffect(() => {
        if (!customerId) {
            setAddresses([]);
            return;
        }
        let ignore = false;
        const fetchAddresses = async () => {
            const { data, error } = await supabase
                .from('addresses')
                .select('id, adresa, detalii')
                .eq('customer_id', customerId)
                .order('id');
            if (error) {
                toast.error('Eroare la încărcarea adreselor: ' + error.message);
                setAddresses([]);
                return;
            }
            if (!ignore) {
                setAddresses(data || []);
            }
        };
        fetchAddresses();
        // Real-time subscription
        const channel = supabase.channel(`order-addresses-${customerId}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'addresses', filter: `customer_id=eq.${customerId}` }, (payload) => {
                fetchAddresses();
            })
            .subscribe();
        return () => {
            ignore = true;
            supabase.removeChannel(channel);
        };
    }, [customerId]);

    // When customer changes, reset address selection
    useEffect(() => {
        setAddressId(undefined);
        setDateTime("");
        setIsActive(false);
    }, [customerId, type]);

    // Save selected address to order
    const handleAddressChange = async (addressIdStr: string) => {
        const newId = addressIdStr ? parseInt(addressIdStr) : undefined;
        setAddressId(newId);
        if (!orderId || newId === undefined) return;
        setSaving(true);
        const addressField = type === 'colectare' ? 'adresa_colectare_id' : 'adresa_returnare_id';
        // When selecting a new address, clear date/time
        const dateTimeField = type === 'colectare' ? 'data_colectare' : 'data_returnare';
        const { error } = await supabase
            .from('orders')
            .update({
                [addressField]: newId,
                [dateTimeField]: null,
            })
            .eq('id', orderId);
        setSaving(false);
        if (error) {
            toast.error('Eroare la salvarea adresei: ' + error.message);
        } else {
            setDateTime("");
            setIsActive(true);
        }
    };

    // Add new address
    const handleAddAddress = async () => {
        if (!customerId) return;
        setSaving(true);
        const { data, error } = await supabase
            .from('addresses')
            .insert({
                ...newAddress,
                customer_id: customerId,
            })
            .select('id, adresa, detalii')
            .single();
        setSaving(false);
        if (error) {
            toast.error('Eroare la adăugarea adresei: ' + error.message);
            return;
        }
        if (data) {
            lastAddedAddressId.current = data.id;
            setAddOpen(false);
            setNewAddress({ adresa: '', detalii: '' });
            toast.success('Adresă adăugată!');
        }
    };

    // When a new address is added, select it automatically
    useEffect(() => {
        if (lastAddedAddressId.current && addresses.some(a => a.id === lastAddedAddressId.current)) {
            handleAddressChange(lastAddedAddressId.current.toString());
            lastAddedAddressId.current = null;
        }
    }, [addresses]);

    const handleCancelAddress = async () => {
        setAddressId(undefined);
        setDateTime("");
        setIsActive(false);
        if (!orderId) return;
        setSaving(true);
        const addressField = type === 'colectare' ? 'adresa_colectare_id' : 'adresa_returnare_id';
        const dateTimeField = type === 'colectare' ? 'data_colectare' : 'data_returnare';
        const { error } = await supabase
            .from('orders')
            .update({ [addressField]: null, [dateTimeField]: null })
            .eq('id', orderId);
        setSaving(false);
        if (error) {
            toast.error('Eroare la anularea adresei: ' + error.message);
        } else {
            setAddOpen(false);
        }
    };

    const updateDateTimeInDb = async (newDateTime: Date | null) => {
        setDateTime(newDateTime ? newDateTime.toISOString() : '');
        if (!orderId) return;
        setSaving(true);
        const field = type === 'colectare' ? 'data_colectare' : 'data_returnare';
        const { error } = await supabase
            .from('orders')
            .update({ [field]: newDateTime ? newDateTime.toISOString() : null })
            .eq('id', orderId);
        setSaving(false);
        if (error) {
            toast.error('Eroare la salvarea datei și orei: ' + error.message);
        }
    };

    // Date/time pickers: autosave to DB when user picks a value
    const handleDateTimeChange = (dt: Date | undefined) => {
        if (!dt || dt.toString() === 'Invalid Date') {
            updateDateTimeInDb(null);
        } else {
            updateDateTimeInDb(dt);
        }
    };

    const title = type === 'colectare' ? 'Adresă Colectare' : 'Adresă Returnare';
    const currentDateTime = (dateTime && new Date(dateTime).toString() !== 'Invalid Date') ? new Date(dateTime) : null;

    return (
        <Card className="p-4 flex flex-col gap-2">
            <div className="flex justify-between items-center">
                <Label>{title}</Label>
                {isActive && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCancelAddress}
                        disabled={saving}
                    >
                        <X className="w-4 h-4 mr-2" />
                        Anulează
                    </Button>
                )}
            </div>
            {!isActive && (
                <Button
                    variant="secondary"
                    onClick={() => setIsActive(true)}
                    disabled={!customerId || loading}
                >
                    Setează {title}
                </Button>
            )}
            {isActive && (
                <>
                    <Select
                        value={addressId?.toString() ?? ''}
                        onValueChange={handleAddressChange}
                        disabled={saving || !customerId || loading}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Selectează o adresă..." />
                        </SelectTrigger>
                        <SelectContent>
                            {addresses.map(addr => (
                                <SelectItem key={addr.id} value={addr.id.toString()}>
                                    {addr.adresa}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button
                        size="sm"
                        variant={addOpen ? 'destructive' : 'secondary'}
                        onClick={() => setAddOpen(v => !v)}
                        disabled={!customerId || loading}
                    >
                        {addOpen ? 'Anulează' : 'Adaugă adresă nouă'}
                    </Button>
                    {addOpen && (
                        <div className="border rounded p-3 mt-2 flex flex-col gap-2 bg-muted/50">
                            <GeoapifyAutocomplete
                                value={newAddress.adresa}
                                onChange={adresa =>
                                    setNewAddress(prev => ({ ...prev, adresa }))
                                }
                                placeholder="Caută adresă..."
                            />
                            <Input
                                placeholder="Detalii (apt, interfon...)"
                                value={newAddress.detalii}
                                onChange={e =>
                                    setNewAddress(prev => ({ ...prev, detalii: e.target.value }))
                                }
                            />
                            <Button size="sm" onClick={handleAddAddress} disabled={saving}>
                                {saving ? 'Se adaugă...' : 'Salvează adresa'}
                            </Button>
                        </div>
                    )}
                    <div className="flex gap-2">
                        <div className="w-full">
                            <DateTimePicker
                                value={currentDateTime ?? undefined}
                                onChange={handleDateTimeChange}
                                disabled={saving || loading}
                            />
                        </div>
                    </div>
                </>
            )}
            {(loading || saving) && (
                <div className="text-xs text-muted-foreground">
                    {loading ? 'Se încarcă...' : 'Se salvează...'}
                </div>
            )}
        </Card>
    );
} 