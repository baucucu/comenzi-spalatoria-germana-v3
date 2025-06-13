import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { ClientForm } from "@/app/clienti/client-form";

interface AddClientDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function AddClientDialog({ open, onOpenChange, onSuccess }: AddClientDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <DialogTitle><VisuallyHidden>Adaugă Client Nou</VisuallyHidden></DialogTitle>
                <DialogHeader>
                    <DialogTitle>Adaugă Client Nou</DialogTitle>
                </DialogHeader>
                <ClientForm
                    mode="create"
                    onSuccess={onSuccess}
                />
            </DialogContent>
        </Dialog>
    );
} 