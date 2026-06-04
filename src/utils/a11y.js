/**
 * Accessibility utility helpers
 */

/**
 * Traps focus within a container element.
 * Returns a ref callback and a cleanup function.
 *
 * Usage:
 *   const { containerRef, cleanup } = createFocusTrap();
 *   // attach containerRef to your modal/drawer div
 */
export function createFocusTrap() {
  let containerEl = null;

  const handleKeyDown = (e) => {
    if (!containerEl || e.key !== 'Tab') return;
    const focusableEls = containerEl.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    if (focusableEls.length === 0) return;
    const first = focusableEls[0];
    const last = focusableEls[focusableEls.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  const bind = (el) => {
    containerEl = el;
    if (!el) return;
    const focusableEls = el.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    if (focusableEls.length > 0) {
      focusableEls[0].focus();
    }
    document.addEventListener('keydown', handleKeyDown);
  };

  const unbind = () => {
    document.removeEventListener('keydown', handleKeyDown);
    containerEl = null;
  };

  return {
    containerRef: bind,
    cleanup: unbind,
  };
}

/**
 * Generates a unique ID for accessible label associations.
 */
let idCounter = 0;
export function generateId(prefix = 'a11y') {
  return `${prefix}-${++idCounter}`;
}

/**
 * Announces a message to screen readers via an aria-live region.
 */
export function announce(message, politeness = 'polite') {
  const el = document.createElement('div');
  el.setAttribute('role', 'status');
  el.setAttribute('aria-live', politeness);
  el.setAttribute('aria-atomic', 'true');
  el.className = 'sr-only';
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => document.body.removeChild(el), 1000);
}

/**
 * Common focus ring class for all interactive elements.
 */
export const focusRing =
  'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black';