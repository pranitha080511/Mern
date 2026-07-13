import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';

export default function CartDrawer({ isOpen, onClose, cartItems, updateQuantity, removeItem, clearCart }) {
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const handleCheckout = () => {
    setCheckoutSuccess(true);
    setTimeout(() => {
      setCheckoutSuccess(false);
      clearCart();
      onClose();
    }, 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        {/* Drawer Panel */}
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full border-l border-pink-100">
          
          {/* Header */}
          <div className="px-6 py-6 bg-black text-white flex justify-between items-center border-b border-gray-900">
            <h2 className="text-xl font-bold flex items-center space-x-2">
              <ShoppingBag size={20} className="text-pink-400" />
              <span>Shopping Cart</span>
            </h2>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-white transition duration-200"
              aria-label="Close cart"
            >
              <X size={24} />
            </button>
          </div>

          {/* Checkout Success Screen */}
          {checkoutSuccess ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-pink-50/50">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4 animate-bounce">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h3>
              <p className="text-gray-600 text-sm max-w-xs">
                Thank you for shopping at Hikari's Luxe. Your cosmetics will reach you soon!
              </p>
            </div>
          ) : (
            <>
              {/* Cart List */}
              <div className="flex-grow overflow-y-auto px-6 py-4 space-y-4">
                {cartItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-12">
                    <ShoppingBag size={64} className="text-pink-200 stroke-[1.5]" />
                    <div>
                      <p className="text-lg font-bold text-gray-800">Your cart is empty</p>
                      <p className="text-sm text-gray-500 mt-1">Looks like you haven't added anything yet.</p>
                    </div>
                    <button 
                      onClick={onClose}
                      className="bg-pink-600 hover:bg-pink-700 text-white font-medium px-6 py-2 rounded-full text-sm shadow-md transition duration-200"
                    >
                      Continue Shopping
                    </button>
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <div 
                      key={item.id} 
                      className="flex items-center space-x-4 p-3 bg-pink-50/40 hover:bg-pink-50/70 rounded-xl border border-pink-100/50 transition duration-150"
                    >
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-16 h-16 object-cover rounded-lg border border-pink-200 shadow-sm"
                      />
                      
                      <div className="flex-grow">
                        <h4 className="font-semibold text-gray-800 text-sm">{item.name}</h4>
                        <p className="text-pink-600 font-bold text-sm mt-0.5">₹{item.price}</p>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-2 mt-2">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 bg-white hover:bg-gray-100 rounded-md border border-gray-200 text-gray-600 hover:text-black transition"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 bg-white hover:bg-gray-100 rounded-md border border-gray-200 text-gray-600 hover:text-black transition"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="text-gray-400 hover:text-red-500 p-2 transition"
                        aria-label={`Remove ${item.name} from cart`}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Drawer Footer */}
              {cartItems.length > 0 && (
                <div className="border-t border-gray-100 px-6 py-6 space-y-4 bg-gray-50">
                  <div className="flex justify-between items-center text-base font-bold text-gray-900">
                    <span>Subtotal</span>
                    <span className="text-pink-600 text-xl">₹{calculateTotal()}</span>
                  </div>
                  <p className="text-xs text-gray-500">Shipping and taxes calculated at checkout.</p>
                  
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button 
                      onClick={clearCart}
                      className="w-full bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 font-medium py-3 rounded-xl text-sm transition duration-200"
                    >
                      Clear Cart
                    </button>
                    
                    <button 
                      onClick={handleCheckout}
                      className="w-full bg-pink-600 hover:bg-pink-700 text-white font-medium py-3 rounded-xl text-sm shadow-lg hover:shadow-pink-600/35 transition duration-200"
                    >
                      Checkout
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
}
