'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface OrderNotesProps {
    orderId: number | null;
}

interface OrderNote {
    note: string;
    created_at: string;
}

export default function OrderNotes({ orderId }: OrderNotesProps) {
    const [notes, setNotes] = useState<OrderNote[]>([]);
    const [newNote, setNewNote] = useState('');
    const [loadingNotes, setLoadingNotes] = useState(false);
    const [addingNote, setAddingNote] = useState(false);

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

    const handleAddNote = async () => {
        if (!orderId || !newNote.trim()) return;
        setAddingNote(true);
        const newNoteObj: OrderNote = {
            note: newNote,
            created_at: new Date().toISOString(),
        };
        const updatedNotes = [...notes, newNoteObj];
        const supabase = createClient();
        const { error } = await supabase
            .from('orders')
            .update({ notes: updatedNotes })
            .eq('id', orderId);
        setAddingNote(false);
        if (error) {
            toast.error('Eroare la adăugarea notiței: ' + error.message);
            return;
        }
        setNotes(updatedNotes);
        setNewNote('');
        toast.success('Notiță adăugată!');
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
                <textarea
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring resize-none min-h-[40px]"
                    placeholder="Adaugă o notiță nouă..."
                    value={newNote}
                    onChange={e => setNewNote(e.target.value)}
                    rows={2}
                    disabled={addingNote}
                />
                <div className="flex justify-end">
                    <Button size="sm" onClick={handleAddNote} disabled={addingNote || !newNote.trim()}>
                        {addingNote ? 'Se adaugă...' : 'Adaugă notiță'}
                    </Button>
                </div>
            </div>
            <div className="flex flex-col gap-2">
                {loadingNotes ? (
                    <div className="text-muted-foreground text-sm">Se încarcă notițele...</div>
                ) : notes.length === 0 ? (
                    <div className="text-muted-foreground text-sm">Nu există notițe pentru această comandă.</div>
                ) : (
                    notes.map((note, idx) => (
                        <div key={idx} className="border rounded p-3 bg-muted/50">
                            <div className="text-xs text-muted-foreground mb-1">
                                {new Date(note.created_at).toLocaleString('ro-RO')}
                            </div>
                            <div className="whitespace-pre-line">
                                {note.note}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
