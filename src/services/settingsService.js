import { supabase } from '../supabase/client';

export const settingsService = {
  // Fetch global settings
  async getSettings() {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .limit(1);

    if (error) throw error;
    
    if (data && data.length > 0) {
      return data[0];
    }
    
    // Default fallback in case DB settings are not yet populated
    return {
      whatsapp_number: '919999999999',
      whatsapp_message_template: 'Hello,\n\nI am interested in {productName}.\n\nPlease share price and availability.\n\nThank you.'
    };
  },

  // Create or update global settings
  async updateSettings(whatsappNumber, whatsappMessageTemplate) {
    const { data: existing, error: fetchError } = await supabase
      .from('settings')
      .select('id')
      .limit(1);

    if (fetchError) throw fetchError;

    let result;
    if (existing && existing.length > 0) {
      // Update existing record
      const { data, error } = await supabase
        .from('settings')
        .update({
          whatsapp_number: whatsappNumber,
          whatsapp_message_template: whatsappMessageTemplate,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing[0].id)
        .select();
      
      if (error) throw error;
      result = data[0];
    } else {
      // Insert new record
      const { data, error } = await supabase
        .from('settings')
        .insert([
          {
            whatsapp_number: whatsappNumber,
            whatsapp_message_template: whatsappMessageTemplate,
          },
        ])
        .select();
      
      if (error) throw error;
      result = data[0];
    }
    
    return result;
  },
};
