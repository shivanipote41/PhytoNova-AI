import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaMinus, FaPlus, FaShoppingCart, FaStar } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import Badge from '../../components/ui/Badge';

export default function ProductDetail({ product, onClose }) {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  if (!product) return null;

  const increment = () => setQuantity((q) => q + 1);
  const decrement = () => setQuantity((q) => Math.max(1, q - 1));

  const handleAddToCart = () => {
    addItem({ ...product, quantity });
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
      >
        <motion.div
          key="modal"
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-white/10 rounded-lg shadow-2xl"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-md bg-white/10 hover:bg-white/20 text-text-secondary hover:text-text-primary transition-colors"
            aria-label="Close"
          >
            <FaTimes />
          </button>

          {/* Image */}
          <div className="relative h-72 md:h-80 overflow-hidden rounded-t-lg">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
            <div className="absolute bottom-4 left-4 flex gap-2">
              <Badge variant="secondary">{product.category}</Badge>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-5">
            <div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">{product.name}</h2>
              <div className="flex items-center gap-2 mb-1">
                {[...Array(5)].map((_, i) => (
                  <FaStar
                    key={i}
                    className={`text-sm ${i < Math.round(product.rating) ? 'text-amber-400' : 'text-white/20'}`}
                  />
                ))}
                <span className="text-sm text-text-secondary ml-1">{product.rating} / 5</span>
              </div>
            </div>

            <p className="text-text-secondary leading-relaxed">{product.description}</p>

            {/* Price */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <div>
                <span className="text-xs text-text-secondary uppercase tracking-wider">Price</span>
                <p className="text-3xl font-bold text-emerald-400">₹{product.price}</p>
              </div>

              {/* Quantity selector */}
              <div className="flex items-center gap-3">
                <button
                  onClick={decrement}
                  className="p-2 rounded-md bg-white/10 hover:bg-white/20 text-text-primary transition-colors"
                  aria-label="Decrease quantity"
                >
                  <FaMinus className="text-sm" />
                </button>
                <span className="w-10 text-center text-lg font-semibold text-text-primary">{quantity}</span>
                <button
                  onClick={increment}
                  className="p-2 rounded-md bg-white/10 hover:bg-white/20 text-text-primary transition-colors"
                  aria-label="Increase quantity"
                >
                  <FaPlus className="text-sm" />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-md bg-emerald-500 hover:bg-emerald-400 text-white font-semibold transition-colors active:scale-95"
              >
                <FaShoppingCart />
                Add to Cart
              </button>
              <button
                onClick={onClose}
                className="px-6 py-3 rounded-md bg-white/10 hover:bg-white/20 text-text-primary border border-white/10 font-medium transition-colors"
              >
                Cancel
              </button>
            </div>

            {/* Total line */}
            <p className="text-center text-sm text-text-secondary">
              Total: <span className="text-emerald-400 font-semibold">₹{product.price * quantity}</span>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}