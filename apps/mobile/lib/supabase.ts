import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const supabaseUrl = 'https://gdbmpzqhwokzdrdenupg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkYm1wenFod29remRyZGVudXBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0ODUyNTIsImV4cCI6MjA4NjA2MTI1Mn0.qTTb00H865Ymt1qxYM3bYvdthgtMvKnYpwpDjS7hD1o';

export const supabase = createClient(supabaseUrl, supabaseKey);
