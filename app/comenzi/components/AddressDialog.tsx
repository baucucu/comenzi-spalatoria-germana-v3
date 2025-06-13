import { useEffect, useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AddressDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initial?: { adresa: string; detalii?: string };
    onSave: (adresa: string, detalii: string) => Promise<void>;
    loading?: boolean;
}

export function AddressDialog({ open, onOpenChange, initial, onSave, loading }: AddressDialogProps) {
    const [adresa, setAdresa] = useState(initial?.adresa || "");
    const [detalii, setDetalii] = useState(initial?.detalii || "");
    const [saving, setSaving] = useState(false);
    useEffect(() => {
        setAdresa(initial?.adresa || "");
        setDetalii(initial?.detalii || "");
    }, [initial, open]);
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{initial ? "Editează adresa" : "Adaugă adresă nouă"}</DialogTitle>
                    <DialogDescription>
                        Completează adresa și detaliile suplimentare (bloc, scară, apartament, etc).
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium mb-1">Adresă</label>
                        <Input value={adresa} onChange={e => setAdresa(e.target.value)} placeholder="Strada, număr..." required disabled={saving || loading} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Detalii</label>
                        <Input value={detalii} onChange={e => setDetalii(e.target.value)} placeholder="Bloc, scară, apartament, etaj, interfon, etc" disabled={saving || loading} />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline" disabled={saving || loading}>Anulează</Button>
                    </DialogClose>
                    <Button type="button" onClick={async () => {
                        setSaving(true);
                        await onSave(adresa, detalii);
                        setSaving(false);
                        onOpenChange(false);
                    }} disabled={saving || loading || !adresa.trim()}>
                        Salvează
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
} 