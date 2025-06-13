import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import GeoapifyAutocomplete from "@/components/GeoapifyAutocomplete";
import React from "react";
import { Textarea } from "@/components/ui/textarea";

interface AddressInputCardProps {
    adresa: string;
    detalii?: string;
    onAdresaChange: (value: string) => void;
    onDetaliiChange: (value: string) => void;
    onDelete: () => void;
    disabled?: boolean;
}

export const AddressInputCard: React.FC<AddressInputCardProps> = ({
    adresa,
    detalii,
    onAdresaChange,
    onDetaliiChange,
    onDelete,
    disabled,
}) => {
    return (
        <div className="border rounded-lg p-3 mb-2 relative bg-white shadow-sm flex flex-col gap-2">
            <button
                className="absolute top-2 right-2 text-red-500 hover:bg-red-100 rounded-full p-1"
                onClick={onDelete}
                type="button"
                aria-label="Șterge adresa"
                disabled={disabled}
            >
                <Trash2 className="w-4 h-4" />
            </button>
            <div>
                <Label className="mb-1 block">Adresă</Label>
                <GeoapifyAutocomplete
                    value={adresa}
                    onChange={onAdresaChange}
                    placeholder="Introduceți adresa..."
                />
            </div>
            <div>
                <Label className="mb-1 block">Detalii</Label>
                <Textarea
                    value={detalii || ""}
                    onChange={e => onDetaliiChange(e.target.value)}
                    placeholder="Detalii (bloc, scară, apartament, etc)"
                    disabled={disabled}
                    rows={2}
                />
            </div>
        </div>
    );
}; 