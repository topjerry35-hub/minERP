import React, { useState, useEffect } from 'react';
import { X, PlusCircle } from 'lucide-react';

export default function AddProductModal({ isOpen, onClose, onAddProduct }) {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [price, setPrice] = useState('');
  const [currentStock, setCurrentStock] = useState('10');
  const [minThreshold, setMinThreshold] = useState('5');
  const [supplier, setSupplier] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName('');
      setSku('');
      setCategory('Electronics');
      setPrice('');
      setCurrentStock('10');
      setMinThreshold('5');
      setSupplier('');
      setImageUrl('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !price) return;

    const generatedSku = sku.trim().toUpperCase() || `SKU-${Math.floor(1000 + Math.random() * 9000)}`;

    const numericPrice = parseFloat(price) || 0;
    const numericCost = Number((numericPrice * 0.65).toFixed(2));
    const stockVal = parseInt(currentStock) || 0;
    const minStockVal = parseInt(minThreshold) || 5;

    onAddProduct({
      sku: generatedSku,
      name,
      category,
      unitPrice: numericPrice,
      price: numericPrice,
      costPrice: numericCost,
      stock: stockVal,
      currentStock: stockVal,
      minStock: minStockVal,
      minThreshold: minStockVal,
      supplier: supplier || 'Global Wholesale',
      barcode: `BC-${Math.floor(10000000 + Math.random() * 90000000)}`,
      imageUrl: imageUrl.trim() || null
    });

    onClose();

    // Reset all form inputs after submission
    setName('');
    setSku('');
    setCategory('Electronics');
    setPrice('');
    setCurrentStock('10');
    setMinThreshold('5');
    setSupplier('');
    setImageUrl('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Register New Product SKU</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="grid-2">
              <div className="form-group">
                <label>Product Name *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Wireless Ergonomic Mouse"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>SKU Code (Auto-generated if empty)</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. MSE-ERG-01"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label>Category</label>
                <select 
                  className="form-control"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Electronics">Electronics</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Office Supplies">Office Supplies</option>
                  <option value="Services">Services</option>
                </select>
              </div>

              <div className="form-group">
                <label>Unit Selling Price (₹ INR) *</label>
                <input 
                  type="number" 
                  step="0.01"
                  className="form-control" 
                  placeholder="49.99"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label>Initial Opening Stock</label>
                <input 
                  type="number" 
                  min="0"
                  className="form-control" 
                  value={currentStock}
                  onChange={(e) => setCurrentStock(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Low Stock Reorder Threshold</label>
                <input 
                  type="number" 
                  min="1"
                  className="form-control" 
                  value={minThreshold}
                  onChange={(e) => setMinThreshold(e.target.value)}
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label>Primary Supplier</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Logitech Wholesale Inc."
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Product Image URL</label>
                <input 
                  type="url" 
                  className="form-control" 
                  placeholder="https://images.unsplash.com/photo-..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <PlusCircle size={16} />
              Save Product SKU
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
