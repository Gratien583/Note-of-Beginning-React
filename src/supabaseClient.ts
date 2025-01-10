import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "";
const supabaseKey = "";

if (!supabaseUrl || !supabaseKey) {
    throw new Error('SupabaseのURLまたはキーが設定されていません。');
}

// Supabaseクライアントの作成
export const supabase = createClient(supabaseUrl, supabaseKey);
