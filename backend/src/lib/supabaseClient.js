import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.supabaseUrl;
const supabaseKey = process.env.supabaseKey; // service key for backend
export const supabase = createClient(supabaseUrl, supabaseKey);
