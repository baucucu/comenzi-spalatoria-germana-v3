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
    const [isActive, setIsActive] = useState(false);
    const [dateTime, setDateTime] = useState<Date | null>(null);

    // Fetch customerId for the order
    useEffect(() => {
        if (!orderId) {
            setCustomerId(null);
            setIsActive(false);
            setSelectedAddress('');
            return;
        }
        const fetchOrderData = async () => {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('orders')
                .select(
                    'customer_id, adresa_colectare_id, adresa_returnare_id, data_colectare, data_returnare'
                )
                .eq('id', orderId)
                .single();
            if (error) {
                setCustomerId(null);
                return;
            }
            setCustomerId(data.customer_id);

            const addressId =
                type === 'colectare'
                    ? data.adresa_colectare_id
                    : data.adresa_returnare_id;

            const dateTimeValue =
                type === 'colectare' ? data.data_colectare : data.data_returnare;
            setDateTime(dateTimeValue ? new Date(dateTimeValue) : null);

            if (addressId) {
                setSelectedAddress(addressId.toString());
                setIsActive(true);
            } else {
                setSelectedAddress('');
                setIsActive(false);
            }
        };
        fetchOrderData();
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
        } else if (value) {
            setIsActive(true);
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
            await handleAddressChange(data.id.toString());
        }
        toast.success('Adresă adăugată!');
    };

    const handleCancelAddress = async () => {
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
            setSelectedAddress('');
            setDateTime(null);
            setIsActive(false);
            setAddOpen(false);
        }
    };

    const updateDateTimeInDb = async (newDateTime: Date) => {
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

        const newDateTime = dateTime ? new Date(dateTime) : new Date();
        newDateTime.setFullYear(selectedDate.getFullYear());
        newDateTime.setMonth(selectedDate.getMonth());
        newDateTime.setDate(selectedDate.getDate());

        if (!dateTime) {
            newDateTime.setHours(12, 0, 0, 0);
        }

        setDateTime(newDateTime);
        updateDateTimeInDb(newDateTime);
    };

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const timeValue = e.target.value;
        if (!timeValue) return;

        const [hours, minutes] = timeValue.split(':').map(Number);
        if (isNaN(hours) || isNaN(minutes)) return;

        const newDateTime = dateTime ? new Date(dateTime) : new Date();
        newDateTime.setHours(hours, minutes, 0, 0);

        setDateTime(newDateTime);
        updateDateTimeInDb(newDateTime);
    };

    if (!customerId) {
        return null;
    }

    return (
        <Card className="p-4 flex flex-col gap-2 relative">
            <Label>
                {type === 'colectare' ? 'Adresă colectare' : 'Adresă returnare'}
            </Label>
            {!isActive ? (
                <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setIsActive(true)}
                    disabled={saving}
                >
                    {`Adaugă adresă de ${type}`}
                </Button>
            ) : (
                <>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 text-red-500 hover:text-red-700"
                        onClick={handleCancelAddress}
                        disabled={saving}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                    <div className="flex flex-col gap-2 pt-2">
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
                                    <SelectItem
                                        key={addr.id}
                                        value={addr.id.toString()}
                                    >
                                        {addr.adresa}{' '}
                                        {addr.detalii ? `(${addr.detalii})` : ''}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {selectedAddress && (
                            <div className="flex flex-col gap-2 pt-2">
                                <Label>Data și ora de {type}</Label>
                                <div className="flex gap-2">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={'outline'}
                                                className="flex-1 justify-start text-left font-normal"
                                                disabled={saving}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {dateTime ? (
                                                    format(dateTime, 'PPP', {
                                                        locale: ro,
                                                    })
                                                ) : (
                                                    <span>Alege data</span>
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={dateTime ?? undefined}
                                                onSelect={handleDateChange}
                                                initialFocus
                                                locale={ro}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <Input
                                        type="time"
                                        value={
                                            dateTime
                                                ? format(dateTime, 'HH:mm')
                                                : ''
                                        }
                                        onChange={handleTimeChange}
                                        disabled={saving || !dateTime}
                                        className="w-32"
                                    />
                                </div>
                            </div>
                        )}

                        <Button
                            size="sm"
                            variant={addOpen ? 'destructive' : 'secondary'}
                            onClick={() => setAddOpen(v => !v)}
                            disabled={saving}
                        >
                            {addOpen ? 'Anulează' : 'Adaugă adresă nouă'}
                        </Button>
                    </div>
                    {addOpen && (
                        <div className="border rounded p-3 mt-2 flex flex-col gap-2 bg-muted/50">
                            <GeoapifyAutocomplete
                                value={newAddress.adresa}
                                onChange={val =>
                                    setNewAddress(a => ({ ...a, adresa: val }))
                                }
                                placeholder="Adresă (București sau Ilfov)"
                            />
                            <textarea
                                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring resize-none min-h-[40px]"
                                placeholder="Detalii (opțional)"
                                value={newAddress.detalii}
                                onChange={e =>
                                    setNewAddress(a => ({
                                        ...a,
                                        detalii: e.target.value,
                                    }))
                                }
                                disabled={saving}
                                rows={2}
                            />
                            <Button
                                type="button"
                                size="sm"
                                onClick={handleAddAddress}
                                disabled={saving || !newAddress.adresa}
                            >
                                {saving ? 'Se adaugă...' : 'Salvează adresa'}
                            </Button>
                        </div>
                    )}
                </>
            )}
        </Card>
    );
} 