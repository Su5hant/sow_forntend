import React, { useState, useEffect } from 'react';
import './EditProductModal.css';
import { updateProduct } from './services/api';
import { useI18n } from './contexts/I18nContext';

const EditProductModal = ({ isOpen, onClose, product, onProductUpdated }) => {
  const { t } = useI18n();
  const [formData, setFormData] = useState({
    article_number: '',
    product: '',
    in_price: '',
    price: '',
    unit: '',
    stock: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (product) {
      setFormData({
        article_number: product.article_number || '',
        product: product.product || '',
        in_price: product.in_price || '',
        price: product.price || '',
        unit: product.unit || '',
        stock: product.stock || '',
        description: product.description || ''
      });
    }
  }, [product]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Convert numeric fields
      const updatedData = {
        ...formData,
        in_price: parseFloat(formData.in_price) || 0,
        price: parseFloat(formData.price) || 0,
        stock: parseInt(formData.stock) || 0
      };

      const updatedProduct = await updateProduct(product.id, updatedData);
      onProductUpdated(updatedProduct);
      onClose();
    } catch (error) {
      setError(error.message || t('update_product_error', 'Failed to update product'));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{t('edit_product', 'Edit Product')}</h2>
          <button 
            className="modal-close-btn" 
            onClick={handleClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="article_number">
                {t('article_number', 'Article Number')} *
              </label>
              <input
                type="text"
                id="article_number"
                name="article_number"
                value={formData.article_number}
                onChange={handleInputChange}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="unit">
                {t('unit', 'Unit')} *
              </label>
              <select
                id="unit"
                name="unit"
                value={formData.unit}
                onChange={handleInputChange}
                required
                disabled={loading}
              >
                <option value="">Select unit</option>
                <option value="pcs">pcs</option>
                <option value="kg">kg</option>
                <option value="liter">liter</option>
                <option value="meter">meter</option>
                <option value="box">box</option>
                <option value="pack">pack</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="product">
              {t('product_name', 'Product Name')} *
            </label>
            <input
              type="text"
              id="product"
              name="product"
              value={formData.product}
              onChange={handleInputChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">
              {t('description', 'Description')}
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
              disabled={loading}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="in_price">
                {t('in_price', 'Cost Price')} (SEK) *
              </label>
              <input
                type="number"
                id="in_price"
                name="in_price"
                value={formData.in_price}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="price">
                {t('price', 'Sale Price')} (SEK) *
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="stock">
                {t('stock', 'Stock Quantity')} *
              </label>
              <input
                type="number"
                id="stock"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                min="0"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="modal-actions">
            <button 
              type="button" 
              onClick={handleClose}
              className="btn-secondary"
              disabled={loading}
            >
              {t('cancel', 'Cancel')}
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={loading}
            >
              {loading ? t('updating', 'Updating...') : t('update_product', 'Update Product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductModal;