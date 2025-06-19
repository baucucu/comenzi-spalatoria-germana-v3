'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Bold, Italic, Underline, List, Image, Tag, Archive, Trash2 } from 'lucide-react';

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
    const [addingNote, setAddingNote] = useState(false);
    const noteRef = useRef<HTMLDivElement>(null);

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
        if (!orderId || !note.trim() || !title.trim()) return;
        setAddingNote(true);
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
        setAddingNote(false);
        if (error) {
            toast.error('Eroare la adăugarea notiței: ' + error.message);
            return;
        }
        setNotes(updatedNotes);
        setTitle('');
        setNote('');
        toast.success('Notiță adăugată!');
    };

    // Formatting handlers
    const format = (command: string) => {
        document.execCommand(command, false);
        if (noteRef.current) {
            setNote(noteRef.current.innerHTML);
        }
    };

    return (
        <div className="flex flex-col h-full max-h-full">
            {/* Notes list */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-2">
                {loadingNotes ? (
                    <div className="text-muted-foreground text-sm">Se încarcă notițele...</div>
                ) : notes.length === 0 ? (
                    <div className="text-muted-foreground text-sm">Nu există notițe pentru această comandă.</div>
                ) : (
                    notes.map((note, idx) => (
                        <div key={idx} className="border rounded p-3 bg-muted/50">
                            <div className="font-semibold mb-1">{note.title}</div>
                            <div className="text-xs text-muted-foreground mb-1">
                                {new Date(note.created_at).toLocaleString('ro-RO')}
                            </div>
                            <div className="whitespace-pre-line" dangerouslySetInnerHTML={{ __html: note.note }} />
                        </div>
                    ))
                )}
            </div>
            {/* Sticky new note input */}
            <div className="sticky bottom-0 left-0 right-0 bg-background border-t pt-4 pb-2 mt-2 z-10">
                <div className="mb-2">
                    <input
                        className="w-full border-b outline-none text-base font-medium mb-2 px-1 py-1"
                        placeholder="Title"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        disabled={addingNote}
                    />
                </div>
                <div className="rounded border bg-white">
                    {/* Toolbar */}
                    <div className="flex items-center gap-2 px-2 py-1 border-b">
                        <button type="button" className="p-1" title="Bold Ctrl+B" onClick={() => format('bold')}><Bold size={16} /></button>
                        <button type="button" className="p-1" title="Italic Ctrl+I" onClick={() => format('italic')}><Italic size={16} /></button>
                        <button type="button" className="p-1" title="Underline Ctrl+U" onClick={() => format('underline')}><Underline size={16} /></button>
                        <button type="button" className="p-1" title="List" onClick={() => format('insertUnorderedList')}><List size={16} /></button>
                        <span className="flex-1" />
                        <button type="button" className="p-1" title="Image"><Image size={16} /></button>
                        <button type="button" className="p-1" title="Tag"><Tag size={16} /></button>
                        <button type="button" className="p-1" title="Archive"><Archive size={16} /></button>
                        <button type="button" className="p-1" title="Delete"><Trash2 size={16} /></button>
                    </div>
                    {/* Contenteditable note input */}
                    <div className="relative">
                        <div
                            ref={noteRef}
                            className="w-full px-3 py-2 min-h-[60px] outline-none resize-none"
                            contentEditable
                            suppressContentEditableWarning
                            onInput={e => setNote((e.target as HTMLDivElement).innerHTML)}
                            onBlur={e => setNote((e.target as HTMLDivElement).innerHTML)}
                            dangerouslySetInnerHTML={{ __html: note }}
                            style={{ whiteSpace: 'pre-wrap' }}
                        />
                        {(!note || note === '<br>') && (
                            <span className="absolute left-3 top-2 text-muted-foreground pointer-events-none select-none">
                                Enter note description...
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex justify-between items-center mt-2">
                    <div className="flex gap-2 text-muted-foreground">
                        {/* Placeholder for future icons/actions */}
                    </div>
                    <Button size="sm" onClick={handleAddNote} disabled={addingNote || !note.trim() || !title.trim()}>
                        {addingNote ? 'Se adaugă...' : 'Add Note'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
