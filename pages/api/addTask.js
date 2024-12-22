// pages/api/addTask.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { title, assigned_to, status } = req.body;

        const { data, error } = await supabase
            .from('shared_tasks')
            .insert([
                { title, assigned_to, status }
            ])
            .single();  // `.single()` ensures only a single object is returned

        if (error) {
            return res.status(500).json({ message: error.message });
        }

        return res.status(200).json(data);  // Send back the added task
    }

    res.status(405).json({ message: 'Method Not Allowed' });
}
