"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { DialogDescription } from "@/components/ui/dialog";

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        const supabase = (await import("@/utils/supabase/client")).createClient();
        try {
            if (mode === "create") {
                const { error } = await supabase.from("customers").insert({
                    prenume,
                    nume,
                    email,
                    telefon,
                    accept_marketing_sms: acceptSms,
                    accept_marketing_email: acceptEmail,
                });
                if (error) throw error;
            } else {
                // For edit mode, you should pass the client id in initialValues
                const { error } = await supabase.from("customers").update({
                    prenume,
                    nume,
                    email,
                    telefon,
                    accept_marketing_sms: acceptSms,
                    accept_marketing_email: acceptEmail,
                }).eq("id", (initialValues as any)?.id);
                if (error) throw error;
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
                {error && <div className="text-red-500 text-sm pt-2">{error}</div>}
            </div>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
                <Button type="button" variant="outline" disabled={loading} onClick={onSuccess}>Anulează</Button>
                <Button type="submit" disabled={loading}>{loading ? "Se salvează..." : mode === "create" ? "Adaugă client" : "Salvează modificările"}</Button>
            </div>
        </form>
    );
} 