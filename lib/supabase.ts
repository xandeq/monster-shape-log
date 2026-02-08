import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const supabaseUrl = 'https://gdbmpzqhwokzdrdenupg.supabase.co';
const supabaseKey = 'sb_publishable_VsY6g7tgIRcuHfpll9xEIA_-slv7UKU';

export const supabase = createClient(supabaseUrl, supabaseKey);
