"use client";
import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ClientForm } from "./client-form";

interface ClientiDialogWrapperProps {
    onClientAdded?: () => void;
}

export function ClientiDialogWrapper({ onClientAdded }: ClientiDialogWrapperProps) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    Adaugă Client
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg w-full">
                <DialogHeader>
                    <DialogTitle>Adaugă Client Nou</DialogTitle>
                </DialogHeader>
                <ClientForm
                    mode="create"
                    onSuccess={() => {
                        setOpen(false);
                        if (onClientAdded) onClientAdded();
                    }}
                />
            </DialogContent>
        </Dialog>
    );
} 