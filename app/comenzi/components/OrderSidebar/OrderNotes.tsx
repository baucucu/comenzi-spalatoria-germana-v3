'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface OrderNotesProps {
    orderId: number | null;
}

interface OrderNote {
    title: string;
    note: string;
    created_at: string;
}

export default function OrderNotes({ orderId }: OrderNotesProps) {
    const [notes, setNotes] = useState<OrderNote[]>([]);
    const [title, setTitle] = useState('');
    const [note, setNote] = useState('');
    const [loadingNotes, setLoadingNotes] = useState(false);
    const [savingNote, setSavingNote] = useState(false);
    const [showAddNoteForm, setShowAddNoteForm] = useState(false);

    useEffect(() => {
        if (!orderId) {
            setNotes([]);
            return;
        }
        const fetchNotes = async () => {
            setLoadingNotes(true);
            const supabase = createClient();
            const { data, error } = await supabase
                .from('orders')
                .select('notes')
                .eq('id', orderId)
                .single();
            setLoadingNotes(false);
            if (error) {
                toast.error('Eroare la încărcarea notițelor: ' + error.message);
                return;
            }
            setNotes(Array.isArray(data?.notes) ? data.notes : []);
        };
        fetchNotes();
    }, [orderId]);

    const handleSaveNote = async () => {
        if (!orderId || !note.trim()) return;
        setSavingNote(true);
        const newNoteObj: OrderNote = {
            title,
            note,
            created_at: new Date().toISOString(),
        };
        const updatedNotes = [...notes, newNoteObj];
        const supabase = createClient();
        const { error } = await supabase
            .from('orders')
            .update({ notes: updatedNotes })
            .eq('id', orderId);
        setSavingNote(false);
        if (error) {
            toast.error('Eroare la salvarea notiței: ' + error.message);
            return;
        }
        setNotes(updatedNotes);
        setTitle('');
        setNote('');
        setShowAddNoteForm(false);
        toast.success('Notiță salvată!');
    };

    const handleCancel = () => {
        setTitle('');
        setNote('');
        setShowAddNoteForm(false);
    };

    return (
        <div className="flex flex-col h-full max-h-full">
            <div className="sticky top-0 bg-background z-10 py-2 border-b mb-2">
                {!showAddNoteForm && (
                    <Button size="sm" onClick={() => setShowAddNoteForm(true)} className="w-full">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Adaugă notă
                    </Button>
                )}
            </div>

            {showAddNoteForm && (
                <div className="mb-4 p-4 border rounded-lg bg-muted/20">
                    <div className="mb-2">
                        <Label htmlFor="note-title">Titlu (opțional)</Label>
                        <Input
                            id="note-title"
                            placeholder="Titlul notiței"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            disabled={savingNote}
                            className="mt-1"
                        />
                    </div>
                    <div className="mb-4">
                        <Label htmlFor="note-body">Notiță</Label>
                        <Textarea
                            id="note-body"
                            placeholder="Introduceți descrierea notiței..."
                            value={note}
                            onChange={e => setNote(e.target.value)}
                            disabled={savingNote}
                            className="mt-1 min-h-[80px] resize-none"
                            required
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={handleCancel} disabled={savingNote}>
                            Anulează
                        </Button>
                        <Button size="sm" onClick={handleSaveNote} disabled={savingNote || !note.trim()}>
                            {savingNote ? 'Se salvează...' : 'Salvează nota'}
                        </Button>
                    </div>
                </div>
            )}

            {/* Notes list */}
            {!showAddNoteForm && (
                <div className="flex-1 overflow-y-auto pr-1 space-y-2">
                    {loadingNotes ? (
                        <div className="text-muted-foreground text-sm">Se încarcă notițele...</div>
                    ) : notes.length === 0 ? (
                        <div className="text-muted-foreground text-sm">Nu există notițe pentru această comandă.</div>
                    ) : (
                        [...notes].reverse().map((note, idx) => (
                            <div key={idx} className="border rounded p-3 bg-muted/50">
                                {note.title && <div className="font-semibold mb-1">{note.title}</div>}
                                <div className="text-xs text-muted-foreground mb-1">
                                    {new Date(note.created_at).toLocaleString('ro-RO')}
                                </div>
                                <div className="whitespace-pre-line">{note.note}</div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
