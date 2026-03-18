import React, { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // Load cart from localStorage on initial render
  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (plant) => {
    setCart(prev => {
      const existing = prev.find(item => item.plantId === plant._id);
      if (existing) {
        return prev.map(item =>
          item.plantId === plant._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          plantId: plant._id,
          name: plant.name,
          price: plant.price,
          quantity: 1,
          image: plant.images?.[0] || plant.image,
        },
      ];
    });
  };

  const updateQuantity = (plantId, newQuantity) => {
    if (newQuantity < 1) return;
    setCart(prev =>
      prev.map(item =>
        item.plantId === plantId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (plantId) => {
    setCart(prev => prev.filter(item => item.plantId !== plantId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        getCartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};