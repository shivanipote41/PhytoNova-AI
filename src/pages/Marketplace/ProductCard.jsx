import { motion } from 'framer-motion';
import { FaStar, FaShoppingCart } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import Badge from '../../components/ui/Badge';

export default function ProductCard({ product, onClick }) {
  const { addItem } = useCart();

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addItem(product);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      whileHover={{ y: -4 }}
      onClick={() => onClick(product)}
      className="bg-white/[0.02] border border-white/10 rounded-md overflow-hidden cursor-pointer group transition-shadow hover:shadow-lg hover:shadow-emerald-900/20"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-3 left-3">
          <Badge variant="primary">{product.category}</Badge>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <h3 className="text-lg font-semibold text-text-primary line-clamp-1 group-hover:text-emerald-400 transition-colors">
          {product.name}
        </h3>

        <p className="text-sm text-text-secondary line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <FaStar
                key={i}
                className={`text-xs ${i < Math.round(product.rating) ? 'text-amber-400' : 'text-white/20'}`}
              />
            ))}
            <span className="ml-1 text-xs text-text-secondary">{product.rating}</span>
          </div>
          <span className="text-lg font-bold text-emerald-400">₹{product.price}</span>
        </div>

        <button
          onClick={handleAddToCart}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-md bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/30 transition-all duration-200 font-medium text-sm active:scale-95"
        >
          <FaShoppingCart className="text-sm" />
          Add to Cart
        </button>
      </div>
    </motion.div>
  );
}