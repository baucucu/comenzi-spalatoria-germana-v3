"use client"

import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Edit, Trash2, Key, MoreVertical, Plus, Loader2 } from "lucide-react"
import { useState } from "react"
import { createClient } from "@/utils/supabase/client"

interface User {
    id: string
    email: string
    role: string
    created_at: string
}

interface UtilizatoriTableProps {
    users: User[]
}

const ROLES = [
    { value: "manager", label: "Manager" },
    { value: "receptie", label: "Receptie" },
    { value: "curier", label: "Curier" },
]

export default function UtilizatoriTable({ users }: UtilizatoriTableProps) {
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [dialogType, setDialogType] = useState<null | "edit" | "reset" | "delete" | "add">(null)
    const [form, setForm] = useState({ email: "", role: "receptie", password: "" })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [open, setOpen] = useState(false)

    // Supabase client
    const supabase = createClient()

    // Dialog logic
    const handleAdd = async () => {
        setLoading(true)
        setError(null)
        const { error } = await supabase.auth.signUp({
            email: form.email,
            password: form.password,
        })
        if (!error) {
            await supabase.from("profiles").insert({ email: form.email, role: form.role })
            setDialogType(null)
            setOpen(false)
        } else {
            setError(error.message)
        }
        setLoading(false)
    }
    const handleEdit = async () => {
        setLoading(true)
        setError(null)
        if (!selectedUser) return
        const { error } = await supabase.from("profiles").update({ role: form.role }).eq("id", selectedUser.id)
        if (!error) {
            setDialogType(null)
            setOpen(false)
        } else setError(error.message)
        setLoading(false)
    }
    const handleReset = async () => {
        setLoading(true)
        setError(null)
        if (!selectedUser) return
        const { error } = await supabase.auth.api.resetPasswordForEmail(selectedUser.email)
        if (!error) {
            setDialogType(null)
            setOpen(false)
        } else setError(error.message)
        setLoading(false)
    }
    const handleDelete = async () => {
        setLoading(true)
        setError(null)
        if (!selectedUser) return
        const { error } = await supabase.from("profiles").delete().eq("id", selectedUser.id)
        if (!error) {
            setDialogType(null)
            setOpen(false)
        } else setError(error.message)
        setLoading(false)
    }

    // Dialog triggers
    const openAddDialog = () => {
        setForm({ email: "", role: "receptie", password: "" })
        setDialogType("add")
        setOpen(true)
    }
    const openEditDialog = (user: User) => {
        setSelectedUser(user)
        setForm({ email: user.email, role: user.role, password: "" })
        setDialogType("edit")
        setOpen(true)
    }
    const openResetDialog = (user: User) => {
        setSelectedUser(user)
        setDialogType("reset")
        setOpen(true)
    }
    const openDeleteDialog = (user: User) => {
        setSelectedUser(user)
        setDialogType("delete")
        setOpen(true)
    }
    const closeDialog = () => {
        setDialogType(null)
        setSelectedUser(null)
        setOpen(false)
        setError(null)
    }

    return (
        <div className="container mx-auto p-6">
            <Card>
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6">
                    <CardTitle className="text-2xl font-semibold">Utilizatori</CardTitle>
                    <Dialog open={dialogType === "add" && open} onOpenChange={v => { if (!v) closeDialog() }}>
                        <DialogTrigger asChild>
                            <Button
                                type="button"
                                className="bg-slate-800 hover:bg-slate-700 w-full sm:w-auto"
                                onClick={openAddDialog}
                            >
                                <Plus className="w-5 h-5 mr-2" /> Adaugă Utilizator
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="w-[95vw] max-w-md min-w-[350px] p-6">
                            <DialogHeader>
                                <DialogTitle>Adaugă Utilizator</DialogTitle>
                            </DialogHeader>
                            <form className="space-y-4 py-4" onSubmit={e => { e.preventDefault(); handleAdd() }}>
                                <div>
                                    <Label htmlFor="email" className="block mb-1">Email</Label>
                                    <Input id="email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required autoFocus className="w-full" />
                                </div>
                                <div>
                                    <Label htmlFor="role" className="block mb-1">Rol</Label>
                                    <Select value={form.role} onValueChange={role => setForm(f => ({ ...f, role }))}>
                                        <SelectTrigger id="role" className="w-full">
                                            <SelectValue placeholder="Selectează rolul" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ROLES.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="password" className="block mb-1">Parolă</Label>
                                    <Input id="password" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required className="w-full" />
                                </div>
                                {error && <div className="text-red-600 text-sm mb-4">{error}</div>}
                                <div className="flex justify-end gap-2">
                                    <Button type="button" onClick={closeDialog} disabled={loading} variant="outline">Anulează</Button>
                                    <Button type="submit" disabled={loading} className="bg-slate-800 hover:bg-slate-700">{loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Se salvează...</>) : "Adaugă"}</Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent>
                    {users.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">Nu există utilizatori. Adaugă primul utilizator!</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table className="w-full mt-2">
                                <TableHeader>
                                    <TableRow className="border-b border-muted-foreground/10">
                                        <TableHead className="text-slate-600 font-semibold text-base px-6 py-3">Email</TableHead>
                                        <TableHead className="text-slate-600 font-semibold text-base px-6 py-3">Rol</TableHead>
                                        <TableHead className="text-slate-600 font-semibold text-base px-6 py-3 text-right">Acțiuni</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.map((user, idx) => (
                                        <TableRow key={user.id} className={"hover:bg-slate-50 " + (idx !== users.length - 1 ? "border-b border-muted-foreground/10" : "")}>
                                            <TableCell className="px-6 py-4 font-medium text-foreground align-middle">{user.email}</TableCell>
                                            <TableCell className="px-6 py-4 font-medium text-foreground align-middle capitalize">{user.role}</TableCell>
                                            <TableCell className="px-6 py-4 text-right align-middle">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button type="button" className="h-8 w-8 p-0 hover:bg-accent hover:text-accent-foreground">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => openEditDialog(user)}>
                                                            <Edit className="w-4 h-4 mr-2" /> Editează
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => openResetDialog(user)}>
                                                            <Key className="w-4 h-4 mr-2" /> Resetează Parola
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => openDeleteDialog(user)} className="text-red-600">
                                                            <Trash2 className="w-4 h-4 mr-2" /> Șterge
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                    {/* Edit Dialog */}
                    <Dialog open={dialogType === "edit" && open} onOpenChange={v => { if (!v) closeDialog() }}>
                        <DialogContent className="w-[95vw] max-w-md">
                            <DialogHeader>
                                <DialogTitle>Editează Utilizator</DialogTitle>
                            </DialogHeader>
                            <form className="grid gap-4 py-4" onSubmit={e => { e.preventDefault(); handleEdit() }}>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="email-edit" className="text-right">Email</Label>
                                    <Input id="email-edit" type="email" value={form.email} disabled className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="role-edit" className="text-right">Rol</Label>
                                    <Select value={form.role} onValueChange={role => setForm(f => ({ ...f, role }))}>
                                        <SelectTrigger id="role-edit" className="col-span-3">
                                            <SelectValue placeholder="Selectează rolul" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ROLES.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                {error && <div className="text-red-600 text-sm mb-4 col-span-4">{error}</div>}
                                <div className="flex justify-end gap-2 col-span-4">
                                    <Button type="button" onClick={closeDialog} disabled={loading} className="border border-input bg-background hover:bg-accent hover:text-accent-foreground">Anulează</Button>
                                    <Button type="submit" disabled={loading} className="bg-slate-800 hover:bg-slate-700">{loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Se salvează...</>) : "Salvează"}</Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                    {/* Reset Password Dialog */}
                    <Dialog open={dialogType === "reset" && open} onOpenChange={v => { if (!v) closeDialog() }}>
                        <DialogContent className="w-[95vw] max-w-md">
                            <DialogHeader>
                                <DialogTitle>Resetează Parola</DialogTitle>
                            </DialogHeader>
                            <div className="mb-4">Ești sigur că vrei să trimiți un email de resetare a parolei către <b>{selectedUser?.email}</b>?</div>
                            {error && <div className="text-red-600 text-sm mb-4">{error}</div>}
                            <div className="flex justify-end gap-2">
                                <Button type="button" onClick={closeDialog} disabled={loading} className="border border-input bg-background hover:bg-accent hover:text-accent-foreground">Anulează</Button>
                                <Button type="button" onClick={handleReset} disabled={loading} className="bg-slate-800 hover:bg-slate-700">{loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Se trimite...</>) : "Resetează"}</Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                    {/* Delete Dialog */}
                    <Dialog open={dialogType === "delete" && open} onOpenChange={v => { if (!v) closeDialog() }}>
                        <DialogContent className="w-[95vw] max-w-md">
                            <DialogHeader>
                                <DialogTitle>Șterge Utilizator</DialogTitle>
                            </DialogHeader>
                            <div className="mb-4">Ești sigur că vrei să ștergi utilizatorul <b>{selectedUser?.email}</b>?</div>
                            {error && <div className="text-red-600 text-sm mb-4">{error}</div>}
                            <div className="flex justify-end gap-2">
                                <Button type="button" onClick={closeDialog} disabled={loading} className="border border-input bg-background hover:bg-accent hover:text-accent-foreground">Anulează</Button>
                                <Button type="button" onClick={handleDelete} disabled={loading} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Se șterge...</>) : "Șterge"}</Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </CardContent>
            </Card>
        </div>
    )
}
