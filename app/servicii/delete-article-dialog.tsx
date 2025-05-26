"use client"

import { useState, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { deleteArticle } from "./actions"

interface Service {
    id: number
    name: string
    price: number
    service_types: { name: string }
}

interface DeleteArticleDialogProps {
    articleName: string
    services: Service[]
    trigger: ReactNode
}

export function DeleteArticleDialog({ articleName, services, trigger }: DeleteArticleDialogProps) {
    const [open, setOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            await deleteArticle(services.map((s) => s.id))
            setOpen(false)
        } catch (error) {
            console.error("Error deleting article:", error)
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="w-[95vw] max-w-md">
                <DialogHeader>
                    <DialogTitle>Șterge Articol</DialogTitle>
                    <DialogDescription>
                        Ești sigur că vrei să ștergi articolul "{articleName}" cu toate serviciile asociate ({services.length}{" "}
                        servicii)? Această acțiune nu poate fi anulată.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col sm:flex-row gap-2 pt-4">
                    <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
                        Anulează
                    </Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={isDeleting} className="flex-1">
                        {isDeleting ? "Se șterge..." : "Șterge articol"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
