"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { deleteService } from "./actions"
import { Trash2 } from "lucide-react"

interface DeleteServiceDialogProps {
    serviceId: number
    serviceName: string
}

export function DeleteServiceDialog({ serviceId, serviceName }: DeleteServiceDialogProps) {
    const [open, setOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            await deleteService(serviceId)
            setOpen(false)
        } catch (error) {
            console.error("Error deleting service:", error)
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                    <Trash2 className="w-4 h-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="mx-4">
                <DialogHeader>
                    <DialogTitle>Șterge Serviciu</DialogTitle>
                    <DialogDescription>
                        Ești sigur că vrei să ștergi serviciul "{serviceName}"? Această acțiune nu poate fi anulată.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col sm:flex-row gap-2 pt-4">
                    <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
                        Anulează
                    </Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={isDeleting} className="flex-1">
                        {isDeleting ? "Se șterge..." : "Șterge"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
