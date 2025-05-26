"use client"

import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Edit, Trash2, Key, MoreVertical, Plus } from "lucide-react"
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
        <Card className="border border-muted bg-background rounded-2xl shadow-sm">
            <CardHeader className="pb-0">
                <CardTitle className="text-2xl font-bold text-foreground mb-6">Utilizatori</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
                <Dialog open={dialogType === "add" && open} onOpenChange={v => { if (!v) closeDialog() }}>
                    <DialogTrigger asChild>
                        <Button type="button" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-base py-6 mb-6" onClick={openAddDialog}>
                            <Plus className="w-5 h-5 mr-2" /> Adaugă Utilizator
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[400px]">
                        <DialogHeader>
                            <DialogTitle>Adaugă Utilizator</DialogTitle>
                        </DialogHeader>
                        <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleAdd() }}>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required autoFocus />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role">Rol</Label>
                                <Select value={form.role} onValueChange={role => setForm(f => ({ ...f, role }))}>
                                    <SelectTrigger id="role">
                                        <SelectValue placeholder="Selectează rolul" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ROLES.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Parolă</Label>
                                <Input id="password" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
                            </div>
                            {error && <div className="text-red-500 text-sm">{error}</div>}
                            <DialogFooter>
                                <Button type="button" variant="secondary" onClick={closeDialog}>Anulează</Button>
                                <Button type="submit" disabled={loading}>Adaugă</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
                <div className="overflow-x-auto">
                    <Table className="w-full mt-2">
                        <TableHeader>
                            <TableRow className="border-b border-muted-foreground/10">
                                <TableHead className="text-muted-foreground font-semibold text-base px-6 py-3">Email</TableHead>
                                <TableHead className="text-muted-foreground font-semibold text-base px-6 py-3">Rol</TableHead>
                                <TableHead className="text-muted-foreground font-semibold text-base px-6 py-3 text-right">Acțiuni</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user, idx) => (
                                <TableRow key={user.id} className={idx !== users.length - 1 ? "border-b border-muted-foreground/10" : ""}>
                                    <TableCell className="px-6 py-4 font-medium text-foreground align-middle">{user.email}</TableCell>
                                    <TableCell className="px-6 py-4 font-medium text-foreground align-middle capitalize">{user.role}</TableCell>
                                    <TableCell className="px-6 py-4 text-right align-middle">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreVertical className="w-5 h-5" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => openEditDialog(user)}>
                                                    <Edit className="w-4 h-4 mr-2" /> Editează
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => openResetDialog(user)}>
                                                    <Key className="w-4 h-4 mr-2" /> Resetează Parola
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => openDeleteDialog(user)}>
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
                {/* Edit Dialog */}
                <Dialog open={dialogType === "edit" && open} onOpenChange={v => { if (!v) closeDialog() }}>
                    <DialogContent className="sm:max-w-[400px]">
                        <DialogHeader>
                            <DialogTitle>Editează Utilizator</DialogTitle>
                        </DialogHeader>
                        <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleEdit() }}>
                            <div className="space-y-2">
                                <Label htmlFor="email-edit">Email</Label>
                                <Input id="email-edit" type="email" value={form.email} disabled />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role-edit">Rol</Label>
                                <Select value={form.role} onValueChange={role => setForm(f => ({ ...f, role }))}>
                                    <SelectTrigger id="role-edit">
                                        <SelectValue placeholder="Selectează rolul" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ROLES.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            {error && <div className="text-red-500 text-sm">{error}</div>}
                            <DialogFooter>
                                <Button type="button" variant="secondary" onClick={closeDialog}>Anulează</Button>
                                <Button type="submit" disabled={loading}>Salvează</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
                {/* Reset Password Dialog */}
                <Dialog open={dialogType === "reset" && open} onOpenChange={v => { if (!v) closeDialog() }}>
                    <DialogContent className="sm:max-w-[400px]">
                        <DialogHeader>
                            <DialogTitle>Resetează Parola</DialogTitle>
                        </DialogHeader>
                        <div className="mb-4">Ești sigur că vrei să trimiți un email de resetare a parolei către <b>{selectedUser?.email}</b>?</div>
                        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
                        <DialogFooter>
                            <Button type="button" variant="secondary" onClick={closeDialog}>Anulează</Button>
                            <Button type="button" onClick={handleReset} disabled={loading}>Resetează</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                {/* Delete Dialog */}
                <Dialog open={dialogType === "delete" && open} onOpenChange={v => { if (!v) closeDialog() }}>
                    <DialogContent className="sm:max-w-[400px]">
                        <DialogHeader>
                            <DialogTitle>Șterge Utilizator</DialogTitle>
                        </DialogHeader>
                        <div className="mb-4">Ești sigur că vrei să ștergi utilizatorul <b>{selectedUser?.email}</b>?</div>
                        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
                        <DialogFooter>
                            <Button type="button" variant="secondary" onClick={closeDialog}>Anulează</Button>
                            <Button type="button" variant="destructive" onClick={handleDelete} disabled={loading}>Șterge</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    )
}
