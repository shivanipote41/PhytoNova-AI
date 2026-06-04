import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaMinus, FaPlus, FaTrash, FaShoppingBag } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';

export default function CartDrawer({ isOpen, onClose }) {
  const { items, removeItem, updateQuantity, clearCart, total } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50"
          />

          {/* Drawer */}
          <motion.div
            key="cart-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-md flex flex-col bg-slate-900 border-l border-white/10 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <div className="flex items-center gap-2 text-text-primary">
                <FaShoppingBag className="text-emerald-400" />
                <h2 className="text-lg font-bold">Your Cart</h2>
                {items.length > 0 && (
                  <span className="ml-1 px-2 py-0.5 text-xs font-medium rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {items.length}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-md hover:bg-white/10 text-text-secondary hover:text-text-primary transition-colors"
                aria-label="Close cart"
              >
                <FaTimes />
              </button>
            </div>

            {/* Cart items */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-3 py-12">
                  <div className="w-16 h-16 rounded-md bg-white/5 flex items-center justify-center">
                    <FaShoppingBag className="text-2xl text-text-secondary/40" />
                  </div>
                  <div>
                    <p className="text-text-primary font-medium">Your cart is empty</p>
                    <p className="text-sm text-text-secondary mt-1">Browse the marketplace to add products.</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="mt-2 px-5 py-2 rounded-md bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 border border-emerald-500/30 text-sm font-medium transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex gap-3 p-3 rounded-md bg-white/5 border border-white/10"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 rounded object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-text-primary line-clamp-1">{item.name}</h4>
                      <p className="text-xs text-text-secondary">{item.category}</p>
                      <p className="text-sm font-semibold text-emerald-400 mt-0.5">
                        ₹{item.price}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-text-primary transition-colors"
                          aria-label="Decrease"
                        >
                          <FaMinus className="text-xs" />
                        </button>
                        <span className="text-sm font-medium text-text-primary w-5 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-text-primary transition-colors"
                          aria-label="Increase"
                        >
                          <FaPlus className="text-xs" />
                        </button>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="ml-auto p-1.5 rounded-md hover:bg-red-500/20 text-text-secondary hover:text-red-400 transition-colors"
                          aria-label="Remove item"
                        >
                          <FaTrash className="text-xs" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="px-5 py-4 border-t border-white/10 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary text-sm">Subtotal</span>
                  <span className="text-2xl font-bold text-emerald-400">₹{total.toFixed(0)}</span>
                </div>
                <button className="w-full py-3 rounded-md bg-emerald-500 hover:bg-emerald-400 text-white font-semibold transition-colors active:scale-95">
                  Proceed to Checkout
                </button>
                <button
                  onClick={clearCart}
                  className="w-full py-2.5 rounded-md bg-white/10 hover:bg-white/20 text-text-secondary hover:text-text-primary border border-white/10 font-medium text-sm transition-colors"
                >
                  Clear Cart
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}