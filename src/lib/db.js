import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function savePurchaseToDB(userId, toolId) {
  const { data, error } = await supabase
    .from('purchases')
    .insert([{ user_id: userId, tool_id: toolId }]);

  if (error) {
    console.error('DB Insert Error:', error);
  }
}
