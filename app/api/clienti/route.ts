import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { searchParams } = new URL(req.url);

        const page = parseInt(searchParams.get('page') || '1', 10);
        const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
        const search = (searchParams.get('search') || '').trim();

        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        let query = supabase
            .from('customers')
            .select('*')
            .order('prenume')
            .order('nume')
            .range(from, to);

        if (search) {
            const q = `%${search.toLowerCase()}%`;
            query = query.or(
                `nume.ilike.${q},prenume.ilike.${q},email.ilike.${q},telefon.ilike.${q}`
            );
        }

        const { data: clienti, error } = await query;

        if (error) {
            return NextResponse.json({ clienti: [], hasMore: false, error: error.message }, { status: 500 });
        }

        const hasMore = clienti && clienti.length === pageSize;

        return NextResponse.json({ clienti, hasMore });
    } catch (e) {
        return NextResponse.json({ clienti: [], hasMore: false, error: 'Internal server error' }, { status: 500 });
    }
} 