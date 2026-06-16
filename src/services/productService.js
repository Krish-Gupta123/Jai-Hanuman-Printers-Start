import { supabase } from '../supabase/client';

// Helper to extract storage path (file name) from public image URL
const getStoragePathFromUrl = (url) => {
  if (!url) return null;
  const parts = url.split('/product-images/');
  return parts.length > 1 ? decodeURIComponent(parts[1]) : null;
};

export const productService = {
  // Website (public) products only: ordered by display_order
  async getProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_hidden', false)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Admin: all products (hidden + visible)
  async getAdminProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Add a new product (handles image upload and automatically sets display_order)
  async addProduct(name, imageFile, productDescription = null, whatsappMessage = null) {
    if (!name || !imageFile) {
      throw new Error('Product name and image file are required.');
    }


    // 1. Upload image file to Supabase Storage bucket 'product-images'
    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = fileName;

    const { error: uploadError, data: uploadData } = await supabase.storage
      .from('product-images')
      .upload(filePath, imageFile, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // 2. Retrieve the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    // 3. Get next display_order (max current display_order + 1)
    const { data: existingProducts, error: fetchError } = await supabase
      .from('products')
      .select('display_order')
      .order('display_order', { ascending: false })
      .limit(1);

    if (fetchError) throw fetchError;

    const nextOrder = existingProducts && existingProducts.length > 0
      ? (existingProducts[0].display_order || 0) + 1
      : 0;

    // 4. Insert database row
    const { data: newProduct, error: insertError } = await supabase
      .from('products')
      .insert([
        {
          name,
          image_url: publicUrl,
          display_order: nextOrder,
          product_description: productDescription && productDescription.trim() ? productDescription.trim() : null,
          whatsapp_message: whatsappMessage && whatsappMessage.trim() ? whatsappMessage.trim() : null,
        },
      ])
      .select();

    if (insertError) {
      // Cleanup uploaded image if database insert fails
      await supabase.storage.from('product-images').remove([filePath]);
      throw insertError;
    }

    return newProduct[0];
  },

  // Update a product's name
  async updateProductName(id, newName) {
    const { data, error } = await supabase
      .from('products')
      .update({ name: newName })
      .eq('id', id)
      .select();

    if (error) throw error;
    return data[0];
  },

  // Update optional per-product WhatsApp message
  async updateProductWhatsAppMessage(id, whatsappMessage) {
    const { data, error } = await supabase
      .from('products')
      .update({
        whatsapp_message: whatsappMessage && whatsappMessage.trim() ? whatsappMessage.trim() : null,
      })
      .eq('id', id)
      .select();

    if (error) throw error;
    return data[0];
  },

  // Update optional per-product description
  async updateProductDescription(id, productDescription) {
    const { data, error } = await supabase
      .from('products')
      .update({
        product_description: productDescription && productDescription.trim() ? productDescription.trim() : null,
      })
      .eq('id', id)
      .select();

    if (error) throw error;
    return data[0];
  },

  // Delete a product (deletes both DB row and storage image)

  async deleteProduct(id, imageUrl) {
    // 1. Delete image from Storage
    const storagePath = getStoragePathFromUrl(imageUrl);
    if (storagePath) {
      const { error: storageError } = await supabase.storage
        .from('product-images')
        .remove([storagePath]);
      if (storageError) {
        console.warn('Failed to delete image from storage:', storageError.message);
      }
    }

    // 2. Delete product from database
    const { error: dbError } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (dbError) throw dbError;
    return true;
  },

  // Toggle product visibility (admin)
  async toggleProductVisibility(id, isHidden) {
    const { data, error } = await supabase
      .from('products')
      .update({ is_hidden: !!isHidden })
      .eq('id', id)
      .select();

    if (error) throw error;
    return data && data[0];
  },

  // Save the updated reordered products (keep visibility as-is)
  async reorderProducts(products) {
    // Upsert can fail if PK/unique constraint is not set as expected.
    // Instead, do deterministic row updates by id.
    const updates = products.map((product, index) => ({
      id: product.id,
      display_order: index,
    }));

    const results = await Promise.all(
      updates.map((u) =>
        supabase
          .from('products')
          .update({ display_order: u.display_order })
          .eq('id', u.id)
      )
    );

    const firstError = results.find((r) => r.error);
    if (firstError?.error) throw firstError.error;

    return true;
  },
};
