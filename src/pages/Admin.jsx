import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase/client';
import { productService } from '../services/productService';
import { settingsService } from '../services/settingsService';
import {
  Plus,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Save,
  LogOut,
  Image as ImageIcon,
  Check,
  X,
  Loader2,
  Settings,
  ShoppingBag,
  FileText,
  Phone,
  Link,
  MessageSquare
} from 'lucide-react';

import toast from 'react-hot-toast';

export default function Admin() {
  // Products state
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Add Product form state
  const [newProductName, setNewProductName] = useState('');
  const [newProductImage, setNewProductImage] = useState(null);
  const [newProductDescription, setNewProductDescription] = useState('');
  const [newProductWhatsapp, setNewProductWhatsapp] = useState('');
  const [addingProduct, setAddingProduct] = useState(false);
  const fileInputRef = useRef(null);

  // Editing state
  const [editingProductId, setEditingProductId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // Per-product WhatsApp / Description editing state
  const [editingWhatsappId, setEditingWhatsappId] = useState(null);
  const [editingWhatsappText, setEditingWhatsappText] = useState('');
  const [savingWhatsappText, setSavingWhatsappText] = useState(false);

  const [editingDescriptionId, setEditingDescriptionId] = useState(null);
  const [editingDescriptionText, setEditingDescriptionText] = useState('');
  const [savingDescriptionText, setSavingDescriptionText] = useState(false);


  // Settings state
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [whatsappTemplate, setWhatsappTemplate] = useState('');
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  // General loading states
  const [reordering, setReordering] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchSettings();
  }, []);

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const data = await productService.getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchSettings = async () => {
    setLoadingSettings(true);
    try {
      const data = await settingsService.getSettings();
      setWhatsappNumber(data.whatsapp_number);
      setWhatsappTemplate(data.whatsapp_message_template);
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load WhatsApp settings');
    } finally {
      setLoadingSettings(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Error signing out');
    }
  };

  // Add Product
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProductName.trim()) {
      toast.error('Product name is required');
      return;
    }
    if (!newProductImage) {
      toast.error('Product image is required');
      return;
    }

    setAddingProduct(true);
    const uploadToast = toast.loading('Uploading product image and creating entry...');
    try {
      await productService.addProduct(newProductName.trim(), newProductImage, newProductDescription, newProductWhatsapp);
      toast.success('Product added successfully', { id: uploadToast });
      setNewProductName('');
      setNewProductImage(null);
      setNewProductDescription('');
      setNewProductWhatsapp('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchProducts();
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error(error.message || 'Failed to add product', { id: uploadToast });
    } finally {
      setAddingProduct(false);
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id, imageUrl, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    const deleteToast = toast.loading('Deleting product...');
    try {
      await productService.deleteProduct(id, imageUrl);
      toast.success('Product deleted successfully', { id: deleteToast });
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product', { id: deleteToast });
    }
  };

  // Start Inline Editing Name
  const startEdit = (product) => {
    setEditingProductId(product.id);
    setEditingName(product.name);
  };

  // Save Name Edit
  const saveNameEdit = async (id) => {
    if (!editingName.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    setSavingEdit(true);
    try {
      await productService.updateProductName(id, editingName.trim());
      toast.success('Product updated');
      setEditingProductId(null);
      fetchProducts();
    } catch (error) {
      console.error('Error updating product name:', error);
      toast.error('Failed to update product name');
    } finally {
      setSavingEdit(false);
    }
  };

  const startEditWhatsappMessage = (product) => {
    setEditingWhatsappId(product.id);
    setEditingWhatsappText(product.whatsapp_message || '');
  };

  const saveWhatsappMessageEdit = async (id) => {
    setSavingWhatsappText(true);
    try {
      await productService.updateProductWhatsAppMessage(id, editingWhatsappText);
      toast.success('WhatsApp message saved');
      setEditingWhatsappId(null);
      fetchProducts();
    } catch (error) {
      console.error('Error updating whatsapp message:', error);
      toast.error('Failed to update WhatsApp message');
    } finally {
      setSavingWhatsappText(false);
    }
  };

  const startEditDescription = (product) => {
    setEditingDescriptionId(product.id);
    setEditingDescriptionText(product.product_description || '');
  };

  const saveDescriptionEdit = async (id) => {
    setSavingDescriptionText(true);
    try {
      await productService.updateProductDescription(id, editingDescriptionText);
      toast.success('Description saved');
      setEditingDescriptionId(null);
      fetchProducts();
    } catch (error) {
      console.error('Error updating description:', error);
      toast.error('Failed to update description');
    } finally {
      setSavingDescriptionText(false);
    }
  };


  // Reorder products (Up/Down)
  const handleMove = async (index, direction) => {
    if (reordering) return;


    const newProducts = [...products];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    // Check bounds
    if (targetIndex < 0 || targetIndex >= products.length) return;

    // Swap items
    const temp = newProducts[index];
    newProducts[index] = newProducts[targetIndex];
    newProducts[targetIndex] = temp;

    // Optimistically update local state for fast UI feedback
    setProducts(newProducts);
    setReordering(true);

    try {
      await productService.reorderProducts(newProducts);
    } catch (error) {
      console.error('Error saving reorder:', error);
      toast.error('Failed to save display order');
      // Revert if API call fails
      fetchProducts();
    } finally {
      setReordering(false);
    }
  };

  // Save settings
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    if (!whatsappNumber.trim()) {
      toast.error('WhatsApp number is required');
      return;
    }
    if (!whatsappTemplate.trim()) {
      toast.error('Message template is required');
      return;
    }

    setSavingSettings(true);
    try {
      await settingsService.updateSettings(whatsappNumber.trim(), whatsappTemplate.trim());
      toast.success('WhatsApp settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save WhatsApp settings');
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      {/* Header */}
      <header className="w-full bg-white border-b border-gray-100 py-4 px-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-gray-900 tracking-tight">
              Jai Hanuman Printer <span className="text-red-600">Admin</span>
            </h1>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 hover:border-red-200 text-gray-600 hover:text-red-600 font-semibold rounded-xl transition-all cursor-pointer text-sm"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Dashboard Layout */}
      <main className="flex-grow max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Manage Products (2/3 width on large screens) */}
        <div className="lg:col-span-2 space-y-8">


          {/* Add Product Block */}
          <section className="bg-white rounded-3xl p-6 shadow-md border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Plus size={20} className="text-red-600" />
              <span>Add New Product</span>
            </h2>

            <form onSubmit={handleAddProduct} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                    placeholder="e.g. Premium Business Cards"
                    className="block w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600 text-sm text-gray-900 bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Product Image File
                  </label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={(e) => setNewProductImage(e.target.files[0])}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 border border-gray-200 rounded-2xl bg-gray-50 cursor-pointer file:cursor-pointer p-1.5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Product Description (optional)
                </label>
                <textarea
                  rows={3}
                  value={newProductDescription}
                  onChange={(e) => setNewProductDescription(e.target.value)}
                  placeholder="Short description shown on website (optional)"
                  className="block w-full px-3 py-2 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600 text-sm text-gray-900 bg-gray-50 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  WhatsApp Message (optional)
                </label>
                <textarea
                  rows={3}
                  value={newProductWhatsapp}
                  onChange={(e) => setNewProductWhatsapp(e.target.value)}
                  placeholder="Optional WhatsApp message for this product (editable later)"
                  className="block w-full px-3 py-2 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600 text-sm text-gray-900 bg-gray-50 resize-none"
                />
              </div>
              {/* Optional per-product description / message are intentionally editable after creation
                  because current addProduct flow only accepts name + image. */}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={addingProduct}
                  className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold rounded-2xl transition-all shadow-md shadow-red-200 cursor-pointer text-sm"
                >
                  {addingProduct ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Adding...</span>
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      <span>Add Product</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>


          {/* Products List Block */}
          <section className="bg-white rounded-3xl p-6 shadow-md border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag size={20} className="text-red-600" />
                <span>Product Catalog</span>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full">
                {products.length} Products
              </span>
            </h2>

            {loadingProducts ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-red-600 animate-spin mb-2" />
                <p className="text-gray-400 text-sm">Fetching catalog details...</p>
              </div>
            ) : products.length > 0 ? (
              <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto pr-2">
                {products.map((product, index) => (
                  <div
                    key={product.id}
                    className="py-4 flex items-center justify-between gap-4 group"
                  >
                    {/* Left side: Drag/Reorder buttons and Image preview */}
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Reorder Arrows */}
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => handleMove(index, 'up')}
                          disabled={index === 0 || reordering}
                          className="p-1 hover:bg-gray-100 disabled:opacity-30 text-gray-500 rounded-lg transition-colors cursor-pointer"
                          title="Move Up"
                        >
                          <ArrowUp size={16} />
                        </button>
                        <button
                          onClick={() => handleMove(index, 'down')}
                          disabled={index === products.length - 1 || reordering}
                          className="p-1 hover:bg-gray-100 disabled:opacity-30 text-gray-500 rounded-lg transition-colors cursor-pointer"
                          title="Move Down"
                        >
                          <ArrowDown size={16} />
                        </button>
                      </div>

                      {/* Image Thumbnail */}
                      <div className="w-14 h-14 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 border border-gray-200">
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Name / Inline Edit */}
                      <div className="min-w-0 flex-grow">
                        {editingProductId === product.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              className="px-2 py-1 text-sm border border-red-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-100 text-gray-900 bg-white"
                              autoFocus
                            />
                            <button
                              onClick={() => saveNameEdit(product.id)}
                              disabled={savingEdit}
                              className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors cursor-pointer"
                            >
                              {savingEdit ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                            </button>
                            <button
                              onClick={() => setEditingProductId(null)}
                              className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors cursor-pointer"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <h3 className="text-sm font-bold text-gray-900 truncate">
                            {product.name}
                          </h3>
                        )}
                        <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block mt-0.5">
                          Order: {product.display_order}
                        </span>
                      </div>
                    </div>

                    {/* Right side: Action Buttons */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {editingProductId !== product.id && (
                        <button
                          onClick={() => startEdit(product)}
                          className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all cursor-pointer"
                          title="Edit Name"
                        >
                          <Edit2 size={16} />
                        </button>
                      )}

                      {/* Per-product WhatsApp message */}
                      {editingWhatsappId !== product.id ? (
                        <button
                          onClick={() => startEditWhatsappMessage(product)}
                          className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all cursor-pointer"
                          title="Edit WhatsApp message (optional)"
                        >
                          <MessageSquare size={16} />
                        </button>
                      ) : (
                        <div className="flex flex-col gap-2">
                          <textarea
                            rows={3}
                            value={editingWhatsappText}
                            onChange={(e) => setEditingWhatsappText(e.target.value)}
                            placeholder="Optional WhatsApp message for this product"
                            className="w-64 max-w-[70vw] px-3 py-2 border border-red-500/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 text-gray-900 bg-white text-sm resize-none"
                          />
                          <div className="flex items-center gap-1 justify-end">
                            <button
                              onClick={() => saveWhatsappMessageEdit(product.id)}
                              disabled={savingWhatsappText}
                              className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all cursor-pointer disabled:opacity-50"
                              title="Save WhatsApp message"
                            >
                              {savingWhatsappText ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                            </button>
                            <button
                              onClick={() => setEditingWhatsappId(null)}
                              className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all cursor-pointer"
                              title="Cancel"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Per-product description */}
                      {editingDescriptionId !== product.id ? (
                        <button
                          onClick={() => startEditDescription(product)}
                          className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all cursor-pointer"
                          title="Edit Description (optional)"
                        >
                          <FileText size={16} />
                        </button>
                      ) : (
                        <div className="flex flex-col gap-2">
                          <textarea
                            rows={2}
                            value={editingDescriptionText}
                            onChange={(e) => setEditingDescriptionText(e.target.value)}
                            placeholder="Optional product description (shown on website)"
                            className="w-64 max-w-[70vw] px-3 py-2 border border-red-500/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 text-gray-900 bg-white text-sm resize-none"
                          />
                          <div className="flex items-center gap-1 justify-end">
                            <button
                              onClick={() => saveDescriptionEdit(product.id)}
                              disabled={savingDescriptionText}
                              className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all cursor-pointer disabled:opacity-50"
                              title="Save description"
                            >
                              {savingDescriptionText ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                            </button>
                            <button
                              onClick={() => setEditingDescriptionId(null)}
                              className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all cursor-pointer"
                              title="Cancel"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      )}


                      {/* Deep link copy button */}
                      <button
                        onClick={async () => {
                          const deepLink = `${window.location.origin}/?product=${product.id}`;
                          await navigator.clipboard.writeText(deepLink);
                          toast.success('Deep link copied to clipboard');
                        }}
                        className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all cursor-pointer"
                        title="Copy Product Link"
                      >
                        <Link size={16} />
                      </button>

                      <button
                        onClick={() => handleDeleteProduct(product.id, product.image_url, product.name)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                        title="Delete Product"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 border border-dashed border-gray-200 rounded-3xl">
                <ImageIcon className="mx-auto text-gray-300 mb-2" size={32} />
                <p className="text-gray-400 text-sm font-medium">No products loaded yet</p>
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Settings (1/3 width on large screens) */}
        <div className="space-y-8">
          <section className="bg-white rounded-3xl p-6 shadow-md border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Settings size={20} className="text-red-600" />
              <span>WhatsApp Integration</span>
            </h2>

            {loadingSettings ? (
              <div className="flex flex-col items-center justify-center py-10">
                <Loader2 className="w-8 h-8 text-red-600 animate-spin mb-2" />
                <p className="text-gray-400 text-xs">Fetching configuration...</p>
              </div>
            ) : (
              <form onSubmit={handleSaveSettings} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Phone size={14} className="text-gray-400" />
                    <span>WhatsApp Number</span>
                  </label>
                  <input
                    type="text"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="e.g. 919876543210"
                    className="block w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600 text-sm text-gray-900 bg-gray-50 font-mono"
                    required
                  />
                  <p className="text-[10px] text-gray-400 mt-1.5 font-medium leading-relaxed">
                    Include country code, digits only (e.g. 91 for India, then 10-digit mobile).
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <FileText size={14} className="text-gray-400" />
                    <span>Message Template</span>
                  </label>
                  <textarea
                    rows={8}
                    value={whatsappTemplate}
                    onChange={(e) => setWhatsappTemplate(e.target.value)}
                    placeholder="Message template text..."
                    className="block w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600 text-sm text-gray-900 bg-gray-50 font-sans leading-relaxed resize-none"
                    required
                  />
                  <p className="text-[10px] text-gray-400 mt-1.5 font-medium leading-relaxed">
                    Use <code className="bg-gray-100 text-red-600 px-1 py-0.5 rounded font-mono font-bold">{'{productName}'}</code> to dynamically embed the active product name.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={savingSettings}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold rounded-2xl transition-all shadow-md shadow-red-200 cursor-pointer text-sm"
                >
                  {savingSettings ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Saving Settings...</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      <span>Save Config</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </section>
        </div>

      </main>
    </div>
  );
}
