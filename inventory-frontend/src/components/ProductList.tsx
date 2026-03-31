import type { Product } from '../types/Product';
import { Edit2, ShieldAlert, Trash2 } from 'lucide-react';

interface ProductListProps {
  products: Product[];
  isLoading: boolean;
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
}

export const ProductList = ({ products, isLoading, onEdit, onDelete }: ProductListProps) => {
  if (isLoading) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <div style={{ display: 'inline-block', animation: 'spin 2s linear infinite' }}>
          <div style={{ width: 32, height: 32, border: '3px solid var(--border-light)', borderTopColor: 'var(--brand-primary)', borderRadius: '50%' }} />
        </div>
        <p style={{ marginTop: '1rem' }}>Loading inventory data...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">
          <ShieldAlert size={32} />
        </div>
        <div>
          <h3>Inventory is Empty</h3>
          <p style={{ marginTop: '0.25rem' }}>Get started by adding your first product.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <table className="table">
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Category</th>
            <th>Stock Level</th>
            <th>Unit Price</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const isLowStock = product.quantity < 10;
            const isOutOfStock = product.quantity === 0;
            
            return (
              <tr key={product.id}>
                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{product.name}</td>
                <td>
                  <span className="badge badge-neutral">{product.category}</span>
                </td>
                <td>
                  <span className={`badge ${isOutOfStock ? 'badge-danger' : isLowStock ? 'badge-warning' : 'badge-success'}`}>
                    {product.quantity} units {isOutOfStock ? '(Out of Stock)' : isLowStock ? '(Low)' : ''}
                  </span>
                </td>
                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  ${product.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button 
                      className="btn-icon" 
                      onClick={() => onEdit(product)}
                      title="Edit Product Details"
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.4rem', borderRadius: '6px' }}
                      onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                      onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      className="btn-icon" 
                      onClick={() => product.id && onDelete(product.id)}
                      title="Delete Product"
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.4rem', borderRadius: '6px' }}
                      onMouseOver={(e) => { e.currentTarget.style.background = 'var(--danger-bg)'; e.currentTarget.style.color = 'var(--danger)'; }}
                      onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
