import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaMinus, FaPlus, FaTrash, FaShoppingBag } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabase';

export default function CartDrawer({ isOpen, onClose }) {
  const { items, removeItem, updateQuantity, clearCart, total } = useCart();
  const { user } = useAuth();

  const [view, setView] = useState('cart'); // 'cart' | 'checkout' | 'success'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState(null);
  const [imageErrors, setImageErrors] = useState({});

  const getCategoryFallbackStyle = (category) => {
    switch (category) {
      case 'Fertilizers': return 'bg-emerald-900/50';
      case 'Seeds': return 'bg-amber-900/50';
      case 'Farming Tools': return 'bg-slate-800/50';
      case 'Plant Care': return 'bg-teal-900/50';
      default: return 'bg-gray-800/50';
    }
  };

  const handleImageError = (itemId) => {
    setImageErrors(prev => ({ ...prev, [itemId]: true }));
  };

  const handleProceedToCheckout = () => {
    setView('checkout');
    setError(null);
  };

  const handleBackToCart = () => {
    setView('cart');
    setError(null);
  };

  const handleCheckout = async () => {
    // Validate fields
    if (!name.trim() || !email.trim() || !phone.trim() || !address.trim()) {
      setError('Please fill all fields');
      return;
    }

    // 1. Build order payload
    const cartSnapshot = items.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity }));
    const orderPayload = {
      user_id: user?.id || null,
      total_price: total,
      quantity: items.reduce((sum, i) => sum + i.quantity, 0),
      status: 'pending',
      customer_name: name.trim(),
      customer_email: email.trim(),
      customer_phone: phone.trim(),
      customer_address: address.trim(),
      cart_items: cartSnapshot,
    };

    // 2. Save to Supabase (with localStorage fallback if table not ready)
    let dbError = null;
    try {
      const { error } = await supabase.from('orders').insert(orderPayload);
      dbError = error;
    } catch (err) {
      dbError = err;
    }

    if (dbError) {
      console.warn('[Cart] Supabase orders insert failed — falling back to localStorage:', dbError.message);
      const existing = JSON.parse(localStorage.getItem('phytanova_orders') || '[]');
      const localOrder = {
        ...orderPayload,
        id: crypto.randomUUID?.() || String(Date.now()),
        created_at: new Date().toISOString(),
        _savedLocally: true,
      };
      localStorage.setItem('phytanova_orders', JSON.stringify([...existing, localOrder]));
    }

    // 3. Send Resend email
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'onboarding@resend.dev',
          to: email.trim(),
          subject: 'Your PhytoNova Order Confirmation',
          html: `<p>Hi ${name.trim()},</p><p>Your order of ₹${total.toFixed(0)} has been placed.</p><p>Items: ${items.map(i => `${i.name} x${i.quantity}`).join(', ')}</p>`,
        }),
      });
    } catch (emailErr) {
      console.error('Email failed:', emailErr);
    }

    // 4. Clear cart, show success
    clearCart();
    setView('success');
  };

  const handleContinueShopping = () => {
    onClose();
    // Reset form state after drawer closes
    setTimeout(() => {
      setView('cart');
      setName('');
      setEmail('');
      setPhone('');
      setAddress('');
      setError(null);
      setImageErrors({});
    }, 300);
  };

  // Render success view
  if (view === 'success') {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              key="cart-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-40 bg-black/50"
            />
            <motion.div
              key="cart-drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-md flex flex-col bg-black border-l border-white/10 shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                <div className="flex items-center gap-2 text-text-primary">
                  <FaShoppingBag className="text-emerald-400" />
                  <h2 className="text-lg font-bold">Order Confirmed</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-md hover:bg-white/10 text-text-secondary hover:text-text-primary transition-colors"
                  aria-label="Close cart"
                >
                  <FaTimes />
                </button>
              </div>

              {/* Success content */}
              <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <span className="text-3xl">&#10003;</span>
                  </div>
                  <h3 className="text-xl font-bold text-text-primary">Order placed successfully!</h3>
                  <p className="text-text-secondary">Thank you for your order. We'll process it shortly.</p>
                </div>

                <div className="space-y-3 p-4 rounded-md bg-white/5 border border-white/10">
                  <h4 className="font-semibold text-text-primary">Order Summary</h4>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Total</span>
                    <span className="font-semibold text-emerald-400">&#8377;{total.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Items</span>
                    <span className="text-text-primary">{items.reduce((sum, i) => sum + i.quantity, 0)}</span>
                  </div>
                </div>

                <div className="space-y-2 p-4 rounded-md bg-white/5 border border-white/10">
                  <h4 className="font-semibold text-text-primary">Delivery Address</h4>
                  <p className="text-sm text-text-secondary">{address}</p>
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 py-4 border-t border-white/10">
                <button
                  onClick={handleContinueShopping}
                  className="w-full py-3 rounded-md bg-emerald-500 hover:bg-emerald-400 text-white font-semibold transition-colors active:scale-95"
                >
                  Continue Shopping
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  // Render checkout form
  if (view === 'checkout') {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              key="cart-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-40 bg-black/50"
            />
            <motion.div
              key="cart-drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-md flex flex-col bg-black border-l border-white/10 shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                <div className="flex items-center gap-2 text-text-primary">
                  <FaShoppingBag className="text-emerald-400" />
                  <h2 className="text-lg font-bold">Checkout</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-md hover:bg-white/10 text-text-secondary hover:text-text-primary transition-colors"
                  aria-label="Close cart"
                >
                  <FaTimes />
                </button>
              </div>

              {/* Checkout form */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                <button
                  onClick={handleBackToCart}
                  className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                  &#8592; Back to Cart
                </button>

                {error && (
                  <div className="p-3 rounded-md bg-red-500/20 border border-red-500/30 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-text-secondary mb-1">Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full bg-[#0a0a0a] border border-white/15 rounded-md px-4 py-2 text-white placeholder:text-text-secondary/50"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-text-secondary mb-1">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full bg-[#0a0a0a] border border-white/15 rounded-md px-4 py-2 text-white placeholder:text-text-secondary/50"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-text-secondary mb-1">Phone</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 XXXXX XXXXX"
                      className="w-full bg-[#0a0a0a] border border-white/15 rounded-md px-4 py-2 text-white placeholder:text-text-secondary/50"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-text-secondary mb-1">Address</label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Full delivery address"
                      rows={3}
                      className="w-full bg-[#0a0a0a] border border-white/15 rounded-md px-4 py-2 text-white placeholder:text-text-secondary/50 resize-none"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 py-4 border-t border-white/10 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary text-sm">Total</span>
                  <span className="text-2xl font-bold text-emerald-400">&#8377;{total.toFixed(0)}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full py-3 rounded-md bg-emerald-500 hover:bg-emerald-400 text-white font-semibold transition-colors active:scale-95"
                >
                  Place Order
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  // Default: render cart view
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
            className="fixed inset-y-0 right-0 z-50 w-full max-w-md flex flex-col bg-black border-l border-white/10 shadow-2xl"
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
                    {imageErrors[item.id] ? (
                      <div className={`w-16 h-16 rounded flex-shrink-0 flex items-center justify-center ${getCategoryFallbackStyle(item.category)}`}>
                        <span className="text-white/60 text-xs font-medium text-center px-1">{item.category}</span>
                      </div>
                    ) : (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 rounded object-cover flex-shrink-0"
                        loading="lazy"
                        onError={() => handleImageError(item.id)}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-text-primary line-clamp-1">{item.name}</h4>
                      <p className="text-xs text-text-secondary">{item.category}</p>
                      <p className="text-sm font-semibold text-emerald-400 mt-0.5">
                        &#8377;{item.price}
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
                  <span className="text-2xl font-bold text-emerald-400">&#8377;{total.toFixed(0)}</span>
                </div>
                <button
                  onClick={handleProceedToCheckout}
                  className="w-full py-3 rounded-md bg-emerald-500 hover:bg-emerald-400 text-white font-semibold transition-colors active:scale-95"
                >
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