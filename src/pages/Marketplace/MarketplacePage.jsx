import { useState, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { FaStore, FaShoppingCart } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { products } from '../../data/products';
import ProductCard from './ProductCard';
import ProductDetail from './ProductDetail';
import SearchFilter from './SearchFilter';
import CartDrawer from './CartDrawer';
import { useCart } from '../../context/CartContext';

export default function MarketplacePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { items } = useCart();

  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = category === 'All' || p.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, category]);

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Header */}
      <div className="bg-gradient-to-b from-emerald-900/20 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FaStore className="text-emerald-400 text-xl" />
                <h1 className="text-3xl sm:text-4xl font-bold text-text-primary">Marketplace</h1>
              </div>
              <p className="text-text-secondary max-w-lg">
                Discover premium agricultural products, fertilizers, seeds, and farming tools.
              </p>
            </div>
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 px-4 py-2.5 rounded-md bg-white/8 hover:bg-white/12 border border-white/10 text-text-primary transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              <FaShoppingCart className="text-emerald-400" />
              <span className="hidden sm:inline text-sm font-medium">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 flex items-center justify-center text-xs font-bold rounded-md bg-emerald-500 text-white">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Filters + Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <SearchFilter
            onSearch={setSearchTerm}
            onCategoryChange={setCategory}
          />
        </div>

        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-md bg-white/5 flex items-center justify-center">
              <FaStore className="text-2xl text-text-secondary/40" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-1">No products found</h3>
            <p className="text-sm text-text-secondary">Try adjusting your search or category filter.</p>
          </motion.div>
        ) : (
          <>
            <p className="text-sm text-text-secondary mb-4">{filtered.length} product{filtered.length !== 1 ? 's' : ''} found</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <AnimatePresence mode="popLayout">
                {filtered.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onClick={setSelectedProduct}
                  />
                ))}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <ProductDetail
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
          />
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}