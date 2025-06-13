import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { ClientForm } from "@/app/clienti/client-form";

interface EditClientDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialValues: {
        id: string;
        prenume: string;
        nume: string;
        email: string;
        telefon: string;
        accept_marketing_sms: boolean;
        accept_marketing_email: boolean;
    };
    onSuccess: () => void;
}

export function EditClientDialog({ open, onOpenChange, initialValues, onSuccess }: EditClientDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <DialogTitle><VisuallyHidden>Editează Client</VisuallyHidden></DialogTitle>
                <DialogHeader>
                    <DialogTitle>Editează Client</DialogTitle>
                </DialogHeader>
                <ClientForm
                    mode="edit"
                    initialValues={initialValues}
                    onSuccess={onSuccess}
                />
            </DialogContent>
        </Dialog>
    );
} 