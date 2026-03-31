import { useState, useEffect, useMemo } from 'react';
import { Package, Plus, AlertCircle, LayoutDashboard, ShoppingCart, Settings, Users, LogOut, TrendingUp, AlertTriangle } from 'lucide-react';
import { ProductList } from './components/ProductList';
import { ProductForm } from './components/ProductForm';
import { SalesDashboard } from './components/SalesDashboard';
import { AIAgent } from './components/AIAgent';
import { productApi } from './api/productApi';
import type { Product } from './types/Product';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type ViewMode = 'dashboard' | 'products' | 'orders' | 'customers' | 'settings';

function App() {
  const [activeView, setActiveView] = useState<ViewMode>('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);

  // Load products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await productApi.getAll();
      setProducts(data);
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to fetch products. Is the server running?';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddClick = () => {
    setEditingProduct(undefined);
    setIsFormOpen(true);
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleDeleteClick = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productApi.delete(id);
        toast.success('Product deleted successfully');
        setProducts(prev => prev.filter(p => p.id !== id));
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to delete product');
      }
    }
  };

  const handleFormSubmit = async (productData: Omit<Product, 'id'>) => {
    setIsSaving(true);
    try {
      if (editingProduct?.id) {
        // Update
        const updated = await productApi.update(editingProduct.id, productData);
        setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
        toast.success('Product updated successfully!');
      } else {
        // Create
        const created = await productApi.create(productData);
        setProducts(prev => [...prev, created]);
        toast.success('Product added successfully!');

        // Auto-switch to products view to see the new item
        setActiveView('products');
      }
      setIsFormOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setIsSaving(false);
    }
  };

  // Derive Statistics
  const totalItems = products.length;
  const lowStockCount = useMemo(() => products.filter(p => p.quantity < 10).length, [products]);
  const totalValue = useMemo(() => products.reduce((acc, p) => acc + (p.price * p.quantity), 0), [products]);

  const renderContent = () => {
    if (activeView === 'dashboard') {
      return (
        <>
          <SalesDashboard />
          <div className="data-table-wrapper" style={{ marginTop: '2rem' }}>
            <div className="table-header">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Recent Inventory Alerts</h3>
            </div>
            <ProductList
              products={products.filter(p => p.quantity < 15).slice(0, 5)}
              isLoading={isLoading}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />
          </div>
        </>
      );
    }

    if (activeView === 'products') {
      return (
        <div className="data-table-wrapper">
          <div className="table-header">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>All Products</h3>
          </div>
          {error ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--danger)' }}>
              <AlertCircle size={48} style={{ margin: '0 auto 1rem' }} />
              <h3>Connection Error</h3>
              <p>{error}</p>
              <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={fetchProducts}>
                Refresh Connection
              </button>
            </div>
          ) : (
            <ProductList
              products={products}
              isLoading={isLoading}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />
          )}
        </div>
      );
    }

    return (
      <div className="empty-state glass-panel">
        <LayoutDashboard size={48} style={{ opacity: 0.2 }} />
        <h2>Module Coming Soon</h2>
        <p>This section is currently under development.</p>
        <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => setActiveView('dashboard')}>
          Return to Dashboard
        </button>
      </div>
    );
  };

  return (
    <div className="app-layout">
      <ToastContainer theme="dark" position="bottom-right" toastStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)' }} />

      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="brand">
          <Package size={28} color="var(--brand-primary)" />
          <span>Inventory Hub</span>
        </div>

        <nav className="nav-menu" style={{ flex: 1 }}>
          <div
            className={`nav-item ${activeView === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveView('dashboard')}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </div>
          <div
            className={`nav-item ${activeView === 'products' ? 'active' : ''}`}
            onClick={() => setActiveView('products')}
          >
            <Package size={20} />
            Products
          </div>
          <div
            className={`nav-item ${activeView === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveView('orders')}
          >
            <ShoppingCart size={20} />
            Orders
          </div>
          <div
            className={`nav-item ${activeView === 'customers' ? 'active' : ''}`}
            onClick={() => setActiveView('customers')}
          >
            <Users size={20} />
            Customers
          </div>
          <div
            className={`nav-item ${activeView === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveView('settings')}
          >
            <Settings size={20} />
            Settings
          </div>
        </nav>

        <div className="nav-menu">
          <div className="nav-item" style={{ color: 'var(--danger)' }}>
            <LogOut size={20} />
            Sign Out
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="page-header">
          <div>
            <h1 className="page-title">
              {activeView === 'dashboard' && 'Executive Dashboard'}
              {activeView === 'products' && 'Inventory Management'}
              {activeView === 'orders' && 'Order Fulfillment'}
              {activeView === 'customers' && 'Customer Directory'}
              {activeView === 'settings' && 'System Settings'}
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              {activeView === 'dashboard' && 'Monitor your sales velocity and inventory alerts in real-time.'}
              {activeView === 'products' && 'Manage your complete inventory list and track stock levels.'}
            </p>
          </div>

          <button className="btn btn-primary" onClick={handleAddClick}>
            <Plus size={18} />
            <span>Add New Product</span>
          </button>
        </header>

        {/* Top Summary Cards (Always visible for context) */}
        <section className="stats-grid">
          <div className="stat-card" onClick={() => setActiveView('products')} style={{ cursor: 'pointer' }}>
            <div className="stat-title">
              <Package size={16} color="var(--brand-secondary)" />
              Total Products
            </div>
            <div className="stat-value">{totalItems}</div>
            <div style={{ color: 'var(--success)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <TrendingUp size={14} /> +12% from last month
            </div>
          </div>

          <div className="stat-card" onClick={() => setActiveView('products')} style={{ cursor: 'pointer' }}>
            <div className="stat-title">
              <AlertTriangle size={16} color="var(--warning)" />
              Low Stock Alerts
            </div>
            <div className="stat-value" style={{ color: lowStockCount > 0 ? 'var(--warning)' : 'var(--text-primary)' }}>
              {lowStockCount}
            </div>
            <div style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>
              Items below 10 units
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-title">
              <TrendingUp size={16} color="var(--success)" />
              Total Inventory Value
            </div>
            <div className="stat-value">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>
              Estimated retail value
            </div>
          </div>
        </section>

        {/* Dynamic View Content */}
        {renderContent()}

      </main>

      {/* Modal Render */}
      {isFormOpen && (
        <ProductForm
          initialData={editingProduct}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsFormOpen(false)}
          isLoading={isSaving}
        />
      )}

      {/* Floating AI Agent */}
      <AIAgent products={products} />
    </div>
  );
}

export default App;
