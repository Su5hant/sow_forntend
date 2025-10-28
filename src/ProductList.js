import React, { useState, useEffect } from 'react';
import './ProductList.css';
import { useAuth } from './contexts/AuthContext';
import { useI18n } from './contexts/I18nContext';
import LanguageSwitcher from './LanguageSwitcher';
import EditProductModal from './EditProductModal';
import config from './config';

const ProductList = () => {
  const { logout } = useAuth();
  const { t, currentLanguage, forceUpdate } = useI18n();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [pageSize] = useState(config.PAGINATION.DEFAULT_PAGE_SIZE);
  const [error, setError] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const fetchProducts = async (page = 1, search = '') => {
    try {
      setLoading(true);
      setError(null);
      
      const baseUrl = `${config.API_BASE_URL}${config.ENDPOINTS.PRODUCTS}`;
      const params = new URLSearchParams({
        page: page.toString(),
        size: pageSize.toString()
      });
      
      if (search.trim()) {
        params.append('search', search.trim());
      }
      
      const url = `${baseUrl}?${params.toString()}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      let productsArray = [];
      if (data.products && Array.isArray(data.products)) {
        productsArray = data.products;
      } else if (Array.isArray(data)) {
        productsArray = data;
      } else if (data.results && Array.isArray(data.results)) {
        productsArray = data.results;
      } else if (data.data && Array.isArray(data.data)) {
        productsArray = data.data;
      }
      
      setProducts(productsArray);
      setTotalProducts(data.total || productsArray.length);
      setTotalPages(data.pages || Math.ceil((data.total || productsArray.length) / pageSize));
      setCurrentPage(data.page || page);
      
    } catch (error) {
      setError(error.message);
      
      setProducts([]);
      setTotalProducts(0);
      setTotalPages(0);
      setCurrentPage(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(1, searchTerm);
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== undefined) {
        fetchProducts(1, searchTerm);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleLogout = () => {
    logout();
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchProducts(newPage, searchTerm);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingProduct(null);
  };

  const handleProductUpdated = (updatedProduct) => {
    setProducts(prevProducts => 
      prevProducts.map(p => 
        p.id === updatedProduct.id ? updatedProduct : p
      )
    );
  };

  return (
    <>
      {/* Top Navigation Bar */}
      <nav className="nav-bar">
        <div className="nav-content">
          <a href="#" className="nav-logo">
            {config.APP.NAME}
          </a>
          
          {/* Hamburger Menu Button */}
          <button 
            className={`hamburger-menu ${isMobileMenuOpen ? 'active' : ''}`}
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          
          {/* Navigation Links */}
          <div className={`nav-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
            <a href="#" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>
              {t('products', 'Products')}
            </a>
            <a href="#" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>
              {t('orders', 'Orders')}
            </a>
            <a href="#" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>
              {t('customers', 'Customers')}
            </a>
            <a href="#" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>
              {t('reports', 'Reports')}
            </a>
            <button 
              onClick={handleLogout} 
              className="nav-link logout-link"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
            >
              {t('logout', 'Logout')}
            </button>
            <div className="language-switcher">
              <LanguageSwitcher />
            </div>
          </div>
          
          {/* Mobile Menu Overlay */}
          {isMobileMenuOpen && (
            <div 
              className="mobile-menu-overlay" 
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className="product-list-container" key={`products-${currentLanguage}-${forceUpdate}`}>
        <main className="main-content">
          <div className="content-header">
            <h1>{t('product_management', 'Product Management')}</h1>
            <p>{t('product_list_desc', 'Manage and view all available products')}</p>
          </div>

          {/* Search Bar */}
          <div className="search-section">
            <div className="search-container">
              <input
                type="text"
                placeholder={t('search_products', 'Search products by name, description, or category...')}
                value={searchTerm}
                onChange={handleSearchChange}
                className="search-input"
              />
              <div className="search-icon"></div>
            </div>
            <div className="search-results-info">
              <span>
                {t('showing_results', `Showing ${Array.isArray(products) ? products.length : 0} of ${totalProducts} products`)}
                {searchTerm && ` for "${searchTerm}"`}
              </span>
              {searchTerm && (
                <button 
                  onClick={clearSearch}
                  className="clear-search"
                >
                  {t('clear_search', 'Clear')}
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="error-container">
              <h3>Backend Connection Error</h3>
              <p className="error-message">
                Unable to connect to the backend server. Error: {error}
              </p>
              <p>Please check your network connection and ensure the backend server is running.</p>
              <button 
                onClick={() => fetchProducts(currentPage, searchTerm)}
                className="retry-button"
              >
                Retry Connection
              </button>
            </div>
          )}

          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading products from backend...</p>
            </div>
          ) : (
            <div className="table-container">
              {!Array.isArray(products) || products.length === 0 ? (
                <div className="no-results">
                  <h3>No Products Available</h3>
                  <p>
                    {searchTerm 
                      ? `No products found matching "${searchTerm}". Try different search terms.`
                      : error 
                        ? 'Unable to load products from the backend server.'
                        : 'No products are currently available in the system.'
                    }
                  </p>
                </div>
              ) : (
                <>
                  {/* Desktop Table */}
                  <table className="products-table">
                    <thead>
                      <tr>
                        <th>{t('article_number', 'Article #')}</th>
                        <th>{t('product_name', 'Product Name')}</th>
                        <th>{t('description', 'Description')}</th>
                        <th>{t('unit', 'Unit')}</th>
                        <th>{t('stock', 'Stock')}</th>
                        <th>{t('in_price', 'Cost Price')}</th>
                        <th>{t('price', 'Sale Price')}</th>
                        <th>{t('actions', 'Actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(products) && products.map((product) => (
                        <tr key={product.id}>
                          <td className="article-number">{product.article_number}</td>
                          <td className="product-name">{product.product}</td>
                          <td className="product-description">{product.description}</td>
                          <td className="unit">{product.unit}</td>
                          <td className="stock">
                            <span className={`stock-badge ${product.stock <= 10 ? 'low-stock' : 'in-stock'}`}>
                              {product.stock}
                            </span>
                          </td>
                          <td className="in-price">{product.in_price} SEK</td>
                          <td className="price">{product.price} SEK</td>
                          <td className="actions">
                            <button className="action-btn view">
                              {t('view', 'View')}
                            </button>
                            <button 
                              className="action-btn edit"
                              onClick={() => handleEditProduct(product)}
                            >
                              {t('edit', 'Edit')}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Mobile Cards */}
                  <div className="mobile-cards">
                    {Array.isArray(products) && products.map((product) => (
                      <div key={`mobile-${product.id}`} className="product-card">
                        <div className="product-card-header">
                          <h3 className="product-card-title">{product.product}</h3>
                          <span className="product-card-article">{product.article_number}</span>
                        </div>
                        
                        {product.description && (
                          <p className="product-card-description">{product.description}</p>
                        )}
                        
                        <div className="product-card-details">
                          <div className="product-card-detail">
                            <span className="product-card-label">{t('unit', 'Unit')}</span>
                            <span className="product-card-value">{product.unit}</span>
                          </div>
                          
                          <div className="product-card-detail">
                            <span className="product-card-label">{t('stock', 'Stock')}</span>
                            <div className="product-card-stock">
                              <span className={`stock-badge ${product.stock <= 10 ? 'low-stock' : 'in-stock'}`}>
                                {product.stock}
                              </span>
                            </div>
                          </div>
                          
                          <div className="product-card-detail">
                            <span className="product-card-label">{t('in_price', 'Cost Price')}</span>
                            <span className="product-card-value">{product.in_price} SEK</span>
                          </div>
                          
                          <div className="product-card-detail">
                            <span className="product-card-label">{t('price', 'Sale Price')}</span>
                            <span className="product-card-value product-card-price">{product.price} SEK</span>
                          </div>
                        </div>
                        
                        <div className="product-card-actions">
                          <button className="action-btn view">
                            {t('view', 'View')}
                          </button>
                          <button 
                            className="action-btn edit"
                            onClick={() => handleEditProduct(product)}
                          >
                            {t('edit', 'Edit')}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="pagination-container">
                      <div className="pagination-info">
                        {t('page', 'Page')} {currentPage} {t('of', 'of')} {totalPages} 
                        ({totalProducts} {t('total_products', 'total products')})
                      </div>
                      <div className="pagination-controls">
                        <button 
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="pagination-btn"
                        >
                          ← {t('previous', 'Previous')}
                        </button>
                        
                        <div className="pagination-numbers">
                          {[...Array(Math.min(5, totalPages))].map((_, index) => {
                            let pageNum;
                            if (totalPages <= 5) {
                              pageNum = index + 1;
                            } else if (currentPage <= 3) {
                              pageNum = index + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + index;
                            } else {
                              pageNum = currentPage - 2 + index;
                            }
                            
                            return (
                              <button
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum)}
                                className={`pagination-number ${currentPage === pageNum ? 'active' : ''}`}
                              >
                                {pageNum}
                              </button>
                            );
                          })}
                        </div>
                        
                        <button 
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="pagination-btn"
                        >
                          {t('next', 'Next')} →
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </main>
        
        {/* Edit Product Modal */}
        <EditProductModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          product={editingProduct}
          onProductUpdated={handleProductUpdated}
        />
      </div>
    </>
  );
};

export default ProductList;
