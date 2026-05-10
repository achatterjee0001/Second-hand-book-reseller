import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { apiCall } from "../lib/api";
import toast from "react-hot-toast";

const CartContext = createContext(undefined);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);

  // Sync wishlist from API
  useEffect(() => {
    if (!user) {
      setWishlistIds([]);
      return;
    }

    const fetchWishlist = async () => {
      try {
        const items = await apiCall('/wishlist');
        setWishlistIds(items.map(i => i.bookId?._id || i.bookId?.id || i.bookId));
      } catch (err) {
        console.error(err);
      }
    };
    fetchWishlist();
  }, [user]);

  const addToCart = (book) => {
    if (cart.find((item) => item.id === book.id)) {
      toast.error("Item already in boutique bag.");
      return;
    }
    setCart((prev) => [...prev, book]);
    toast.success("Added to your collection bag.");
  };

  const removeFromCart = (bookId) => {
    setCart((prev) => prev.filter((item) => item.id !== bookId));
  };

  const clearCart = () => setCart([]);

  const toggleWishlist = async (bookId) => {
    if (!user) {
      toast.error("Identity verification required.");
      return;
    }

    const isAdded = wishlistIds.includes(bookId);

    try {
      if (isAdded) {
        await apiCall(`/wishlist/${bookId}`, {
          method: 'DELETE'
        });
        setWishlistIds((prev) => prev.filter((id) => id !== bookId));
        toast.success("Removed from your vault.");
      } else {
        await apiCall('/wishlist', {
          method: 'POST',
          body: JSON.stringify({ bookId })
        });
        setWishlistIds((prev) => [...prev, bookId]);
        toast.success("Securely stored in your vault.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Vault synchronization failed.");
    }
  };

  const isInWishlist = (bookId) => wishlistIds.includes(bookId);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        wishlistIds,
        toggleWishlist,
        isInWishlist,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
