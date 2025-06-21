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
import { X } from 'lucide-react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';

interface Address {
    id: number;
    adresa: string;
    detalii?: string;
}

interface OrderAddressProps {
    orderId: number | null;
    type: 'colectare' | 'returnare';
    value: number | undefined;
    onChange: (id: number | undefined) => void;
    dateTime: string;
    onDateTimeChange: (date: string) => void;
    customerId: string | null;
    addresses: Address[];
    onAddAddress: (address: { adresa: string, detalii: string }) => Promise<Address | null>;
}

export default function OrderAddress({
    orderId,
    type,
    value,
    onChange,
    dateTime,
    onDateTimeChange,
    customerId,
    addresses,
    onAddAddress,
}: OrderAddressProps) {
    const [addOpen, setAddOpen] = useState(false);
    const [newAddress, setNewAddress] = useState({ adresa: '', detalii: '' });
    const [saving, setSaving] = useState(false);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        setIsActive(!!value);
    }, [value]);


    // Save selected address to order
    const handleAddressChange = async (addressId: string) => {
        const newId = addressId ? parseInt(addressId) : undefined;
        onChange(newId);

        if (!orderId || newId === undefined) return;

        setSaving(true);
        const supabase = createClient();
        const field = type === 'colectare' ? 'adresa_colectare_id' : 'adresa_returnare_id';
        const { error } = await supabase
            .from('orders')
            .update({ [field]: newId })
            .eq('id', orderId);
        setSaving(false);
        if (error) {
            toast.error('Eroare la salvarea adresei: ' + error.message);
        } else if (addressId) {
            setIsActive(true);
        }
    };

    // Add new address
    const handleAddAddress = async () => {
        if (!customerId) return;
        setSaving(true);
        const addedAddress = await onAddAddress(newAddress);
        setSaving(false);
        if (addedAddress) {
            await handleAddressChange(addedAddress.id.toString());
            setAddOpen(false);
            setNewAddress({ adresa: '', detalii: '' });
            toast.success('Adresă adăugată!');
        }
    };

    const handleCancelAddress = async () => {
        onChange(undefined);
        onDateTimeChange('');

        if (!orderId) return;

        setSaving(true);
        const supabase = createClient();
        const field =
            type === 'colectare' ? 'adresa_colectare_id' : 'adresa_returnare_id';
        const dateTimeField =
            type === 'colectare' ? 'data_colectare' : 'data_returnare';
        const { error } = await supabase
            .from('orders')
            .update({ [field]: null, [dateTimeField]: null })
            .eq('id', orderId);
        setSaving(false);
        if (error) {
            toast.error('Eroare la anularea adresei: ' + error.message);
        } else {
            setAddOpen(false);
        }
    };

    const updateDateTimeInDb = async (newDateTime: Date) => {
        onDateTimeChange(newDateTime.toISOString());
        if (!orderId) return;

        setSaving(true);
        const supabase = createClient();
        const field = type === 'colectare' ? 'data_colectare' : 'data_returnare';
        const { error } = await supabase
            .from('orders')
            .update({ [field]: newDateTime.toISOString() })
            .eq('id', orderId);
        setSaving(false);
        if (error) {
            toast.error('Eroare la salvarea datei și orei: ' + error.message);
        }
    };

    const handleDateChange = (selectedDate: Date | undefined) => {
        if (!selectedDate) return;

        const current = dateTime ? new Date(dateTime) : new Date();
        current.setFullYear(selectedDate.getFullYear());
        current.setMonth(selectedDate.getMonth());
        current.setDate(selectedDate.getDate());
        updateDateTimeInDb(current);
    };

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const [hours, minutes] = e.target.value.split(':').map(Number);
        const current = dateTime ? new Date(dateTime) : new Date();
        current.setHours(hours, minutes);
        updateDateTimeInDb(current);
    };


    const title = type === 'colectare' ? 'Adresă Colectare' : 'Adresă Returnare';
    const currentDateTime = dateTime ? new Date(dateTime) : null;

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
                    disabled={!customerId}
                >
                    Setează {title}
                </Button>
            )}

            {isActive && (
                <>
                    <Select
                        value={value?.toString() ?? ''}
                        onValueChange={handleAddressChange}
                        disabled={saving || !customerId}
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
                        disabled={!customerId}
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
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={'outline'}
                                    className="flex-1"
                                    disabled={saving}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {currentDateTime ? (
                                        format(currentDateTime, 'PPP', { locale: ro })
                                    ) : (
                                        <span>Alege data</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={currentDateTime ?? undefined}
                                    onSelect={handleDateChange}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        <Input
                            type="time"
                            className="w-32"
                            value={currentDateTime ? format(currentDateTime, 'HH:mm') : ''}
                            onChange={handleTimeChange}
                            disabled={saving}
                        />
                    </div>

                </>
            )}
        </Card>
    );
} 