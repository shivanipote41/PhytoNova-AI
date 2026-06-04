import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { GiPlantSeed } from 'react-icons/gi';
import { IoMenu, IoClose, IoCartOutline } from 'react-icons/io5';
import { motion, AnimatePresence } from 'framer-motion';
import { tw } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';
import CartDrawer from '../../pages/Marketplace/CartDrawer';

const navLinks = [
  { path: '/', label: 'Home' },
  { path: '/detect', label: 'Detect' },
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/marketplace', label: 'Marketplace' },
  { path: '/profile', label: 'Profile' },
];

function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const userMenuRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    setUserMenuOpen(false);
    await signOut();
    navigate('/');
  };

  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
  const avatarSrc = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null;

  return (
    <>
      <nav
        className="sticky top-0 z-50 bg-black/95 border-b border-white/10"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              to="/"
              className={tw(
                'flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black rounded-md'
              )}
              aria-label="PhytoNova AI home"
            >
              <GiPlantSeed className="w-8 h-8 text-primary" aria-hidden="true" />
              <span className="text-xl font-bold text-text-primary">PhytoNova</span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={tw(
                    'px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200',
                    'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black',
                    isActive(link.path)
                      ? 'text-primary'
                      : 'text-text-secondary hover:text-primary hover:bg-white/5'
                  )}
                  aria-current={isActive(link.path) ? 'page' : undefined}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Desktop actions */}
            <div className="hidden md:flex items-center gap-2">
              {/* Cart button */}
              <button
                type="button"
                onClick={() => setCartOpen(true)}
                className={tw(
                  'relative p-2.5 rounded-md text-text-secondary hover:text-primary hover:bg-white/5 transition-colors duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black'
                )}
                aria-label="Open shopping cart"
              >
                <IoCartOutline className="w-5 h-5" aria-hidden="true" />
              </button>

              {/* Auth */}
              {!loading && (
                <div ref={userMenuRef} className="relative">
                  {user ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setUserMenuOpen((v) => !v)}
                        className={tw(
                          'flex items-center gap-2 p-1.5 rounded-md hover:bg-white/5 transition-colors duration-200',
                          'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black'
                        )}
                        aria-expanded={userMenuOpen}
                        aria-haspopup="true"
                        aria-label={`Account menu for ${displayName}`}
                      >
                        <Avatar name={displayName} src={avatarSrc} size="sm" />
                        <span className="text-sm font-medium text-text-primary max-w-[120px] truncate">
                          {displayName}
                        </span>
                      </button>

                      <AnimatePresence>
                        {userMenuOpen && (
                          <motion.div
                            key="user-menu"
                            initial={{ opacity: 0, y: -8, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -8, scale: 0.96 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 mt-2 w-48 bg-slate-800 border border-white/10 rounded-md shadow-xl overflow-hidden"
                            role="menu"
                          >
                            <div className="px-4 py-3 border-b border-white/10">
                              <p className="text-sm font-semibold text-text-primary truncate">{displayName}</p>
                              <p className="text-xs text-text-secondary truncate mt-0.5">{user.email}</p>
                            </div>
                            <Link
                              to="/profile"
                              onClick={() => setUserMenuOpen(false)}
                              className={tw(
                                'block px-4 py-2.5 text-sm text-text-secondary hover:text-primary hover:bg-white/5 transition-colors',
                                'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset'
                              )}
                              role="menuitem"
                            >
                              Profile
                            </Link>
                            <button
                              type="button"
                              onClick={handleLogout}
                              className={tw(
                                'w-full text-left px-4 py-2.5 text-sm text-text-secondary hover:text-red-400 hover:bg-red-500/5 transition-colors',
                                'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset'
                              )}
                              role="menuitem"
                            >
                              Log out
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <Link
                      to="/auth"
                      className={tw(
                        'px-4 py-2 rounded-md text-sm font-medium bg-primary hover:bg-primary/90 text-white transition-colors duration-200',
                        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black'
                      )}
                    >
                      Login
                    </Link>
                  )}
                </div>
              )}

              {/* Loading state */}
              {loading && (
                <div
                  className="w-8 h-8 rounded-md border-2 border-primary border-t-transparent animate-spin"
                  aria-label="Loading"
                />
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              type="button"
              className={tw(
                'md:hidden p-2 rounded-md text-text-secondary hover:text-primary hover:bg-white/5 transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black'
              )}
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? (
                <IoClose className="w-6 h-6" aria-hidden="true" />
              ) : (
                <IoMenu className="w-6 h-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              key="mobile-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden bg-black border-t border-white/10"
            >
              <div className="px-4 py-4 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={tw(
                      'block px-4 py-2.5 rounded-md text-sm font-medium transition-colors duration-200',
                      'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black',
                      isActive(link.path)
                        ? 'bg-primary/20 text-primary'
                        : 'text-text-secondary hover:text-primary hover:bg-white/5'
                    )}
                    aria-current={isActive(link.path) ? 'page' : undefined}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="pt-3 border-t border-white/10 flex items-center gap-3 px-4">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setCartOpen(true);
                    }}
                    className={tw(
                      'flex items-center gap-2 px-3 py-2 rounded-md text-sm text-text-secondary hover:text-primary hover:bg-white/5 transition-colors',
                      'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black'
                    )}
                    aria-label="Open cart"
                  >
                    <IoCartOutline className="w-5 h-5" aria-hidden="true" />
                    <span>Cart</span>
                  </button>

                  {!loading && (
                    user ? (
                      <button
                        type="button"
                        onClick={handleLogout}
                        className={tw(
                          'ml-auto px-3 py-2 rounded-md text-sm text-red-400 hover:bg-red-500/10 transition-colors',
                          'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black'
                        )}
                      >
                        Log out
                      </button>
                    ) : (
                      <Link
                        to="/auth"
                        className={tw(
                          'ml-auto px-4 py-2 rounded-md text-sm font-medium bg-primary hover:bg-primary/90 text-white transition-colors',
                          'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black'
                        )}
                      >
                        Login
                      </Link>
                    )
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Cart Drawer */}
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}

export default Navbar;