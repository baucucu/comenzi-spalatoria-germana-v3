"use client";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { DialogDescription } from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import GeoapifyAutocomplete from "@/components/GeoapifyAutocomplete";

interface ClientFormProps {
    mode: "create" | "edit";
    initialValues?: {
        prenume: string;
        nume: string;
        email: string;
        telefon: string;
        accept_marketing_sms: boolean;
        accept_marketing_email: boolean;
    };
    onSuccess?: () => void;
}

export function ClientForm({ mode, initialValues, onSuccess }: ClientFormProps) {
    const [prenume, setPrenume] = useState(initialValues?.prenume || "");
    const [nume, setNume] = useState(initialValues?.nume || "");
    const [email, setEmail] = useState(initialValues?.email || "");
    const [telefon, setTelefon] = useState(initialValues?.telefon || "");
    const [acceptSms, setAcceptSms] = useState(initialValues?.accept_marketing_sms || false);
    const [acceptEmail, setAcceptEmail] = useState(initialValues?.accept_marketing_email || false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [addresses, setAddresses] = useState<{ id?: number, adresa: string, tempKey?: string }[]>([]);
    const [originalAddresses, setOriginalAddresses] = useState<{ id: number, adresa: string, tempKey?: string }[]>([]);
    const [deletingAddressId, setDeletingAddressId] = useState<number | null>(null);

    useEffect(() => {
        if (mode === "edit" && (initialValues as any)?.id) {
            const fetchAddresses = async () => {
                const supabase = (await import("@/utils/supabase/client")).createClient();
                const { data, error } = await supabase
                    .from("addresses")
                    .select("id, adresa")
                    .eq("customer_id", (initialValues as any).id);
                if (!error && data) {
                    setAddresses(data.map((a: any) => ({ id: a.id, adresa: a.adresa })));
                    setOriginalAddresses(data.map((a: any) => ({ id: a.id, adresa: a.adresa })));
                }
            };
            fetchAddresses();
        }
    }, [mode, initialValues]);

    const handleAddAddress = () =>
        setAddresses([
            ...addresses,
            { adresa: "", tempKey: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) }
        ]);
    const handleAddressChange = (idx: number, value: string) => {
        setAddresses(addresses.map((addr, i) => i === idx ? { ...addr, adresa: value } : addr));
    };
    const handleRemoveAddress = async (idx: number) => {
        const addr = addresses[idx];
        if (addr.id) {
            setDeletingAddressId(addr.id);
            const supabase = (await import("@/utils/supabase/client")).createClient();
            const { error } = await supabase.from("addresses").delete().eq("id", addr.id);
            setDeletingAddressId(null);
            if (error) {
                if (error.message && error.message.includes("violates foreign key constraint")) {
                    toast("Adresa nu poate fi stearsa pentru ca este folosita in Comenzi.", {
                        description: "Aceasta adresă este folosită într-o comandă și nu poate fi ștearsă.",
                    });
                } else {
                    setError(error.message || "Eroare la ștergerea adresei");
                }
                return;
            }
        }
        setAddresses(addresses.filter((_, i) => i !== idx));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        const supabase = (await import("@/utils/supabase/client")).createClient();
        try {
            let customerId;
            if (mode === "create") {
                const { data, error } = await supabase.from("customers").insert({
                    prenume,
                    nume,
                    email,
                    telefon,
                    accept_marketing_sms: acceptSms,
                    accept_marketing_email: acceptEmail,
                }).select("id").single();
                if (error) throw error;
                customerId = data.id;
            } else {
                const { error } = await supabase.from("customers").update({
                    prenume,
                    nume,
                    email,
                    telefon,
                    accept_marketing_sms: acceptSms,
                    accept_marketing_email: acceptEmail,
                }).eq("id", (initialValues as any)?.id);
                if (error) throw error;
                customerId = (initialValues as any)?.id;
            }
            // Upsert addresses
            if (customerId) {
                // 1. Delete removed addresses
                if (mode === "edit") {
                    const removed = originalAddresses.filter(orig => !addresses.some(addr => addr.id === orig.id));
                    if (removed.length > 0) {
                        const idsToDelete = removed.map(r => r.id);
                        await supabase.from("addresses").delete().in("id", idsToDelete);
                    }
                }
                // 2. Upsert (update or insert)
                for (const addr of addresses) {
                    if (addr.id) {
                        // Update if changed
                        const orig = originalAddresses.find(a => a.id === addr.id);
                        if (orig && orig.adresa !== addr.adresa) {
                            await supabase.from("addresses").update({ adresa: addr.adresa }).eq("id", addr.id);
                        }
                    } else if (addr.adresa.trim()) {
                        // Insert new
                        await supabase.from("addresses").insert({ adresa: addr.adresa.trim(), customer_id: customerId });
                    }
                }
            }
            if (onSuccess) onSuccess();
        } catch (err: any) {
            setError(err.message || "Eroare la salvare");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <h2 className="text-2xl font-semibold leading-tight">
                    {mode === "create" ? "Adaugă Client Nou" : "Editează Client"}
                </h2>
                <DialogDescription>
                    Completează informațiile pentru a {mode === "create" ? "adauga un client nou." : "edita clientul."}
                </DialogDescription>
            </div>
            <div className="space-y-4">
                <div className="space-y-1">
                    <Label htmlFor="prenume">Prenume</Label>
                    <Input id="prenume" value={prenume} onChange={e => setPrenume(e.target.value)} required placeholder="ex: Andrei" />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="nume">Nume</Label>
                    <Input id="nume" value={nume} onChange={e => setNume(e.target.value)} required placeholder="ex: Popescu" />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="ex: andrei@email.com" />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="telefon">Telefon</Label>
                    <Input id="telefon" value={telefon} onChange={e => setTelefon(e.target.value)} required placeholder="ex: 0722123456" />
                </div>
                <div className="flex items-center justify-between py-2">
                    <Label htmlFor="acceptSms">Marketing SMS</Label>
                    <Switch id="acceptSms" checked={acceptSms} onCheckedChange={setAcceptSms} />
                </div>
                <div className="flex items-center justify-between py-2">
                    <Label htmlFor="acceptEmail">Marketing Email</Label>
                    <Switch id="acceptEmail" checked={acceptEmail} onCheckedChange={setAcceptEmail} />
                </div>
                {/* Addresses section */}
                <div className="pt-4">
                    <Label className="block mb-2 text-base font-semibold">Adrese</Label>
                    <div className="flex flex-col gap-2">
                        {addresses.map((addr, idx) => (
                            <div key={addr.id || addr.tempKey} className="flex gap-2 items-center">
                                <GeoapifyAutocomplete
                                    value={addr.adresa}
                                    onChange={value => handleAddressChange(idx, value)}
                                    placeholder="Introduceți adresa..."
                                />
                                <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveAddress(idx)} disabled={deletingAddressId === addr.id}>
                                    {deletingAddressId === addr.id ? (
                                        <span className="animate-spin w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full inline-block" />
                                    ) : (
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    )}
                                </Button>
                            </div>
                        ))}
                        <Button type="button" variant="outline" className="mt-2 w-fit" onClick={handleAddAddress}>
                            <Plus className="w-4 h-4 mr-1" /> Adaugă adresă
                        </Button>
                    </div>
                </div>
                {error && <div className="text-red-500 text-sm pt-2">{error}</div>}
            </div>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
                <Button type="button" variant="outline" disabled={loading} onClick={onSuccess}>Anulează</Button>
                <Button type="submit" disabled={loading}>{loading ? "Se salvează..." : mode === "create" ? "Adaugă client" : "Salvează modificările"}</Button>
            </div>
        </form>
    );
} 