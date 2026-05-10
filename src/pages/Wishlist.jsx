import { useState, useEffect } from 'react';
import { apiCall } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { formatPrice } from '../lib/utils';
import { Heart, ShoppingCart, Trash2, ArrowRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCart } from '../hooks/useCart';
export default function Wishlist() {
    const { user } = useAuth();
    const { wishlistIds, toggleWishlist, addToCart } = useCart();
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        if (user && wishlistIds.length > 0) {
            fetchWishlistItems();
        }
        else {
            setWishlist([]);
            setLoading(false);
        }
    }, [user, wishlistIds]);
    const fetchWishlistItems = async () => {
        setLoading(true);
        try {
            const allBooks = await apiCall('/books');
            setWishlist(allBooks.filter(b => wishlistIds.includes(b.id)));
        }
        catch (error) {
            toast.error('Failed to load wishlist');
        }
        finally {
            setLoading(false);
        }
    };
    const removeFromWishlist = async (id) => {
        await toggleWishlist(id);
    };
    return (<div className="space-y-12 animate-in py-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-stone-200 pb-12">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-stone-100 rounded-full text-[10px] font-bold uppercase tracking-widest text-stone-600">
            {wishlist.length} Saved Finds
          </div>
          <h1 className="font-display text-6xl font-bold text-stone-900 tracking-tight">Your <span className="text-stone-400 italic">Vault.</span></h1>
          <p className="text-stone-500 text-lg font-light leading-relaxed max-w-xl">
            A curated list of treasures you've discovered across the network. Act fast—these volumes are singular.
          </p>
        </div>
      </div>

      {loading ? (<div className="py-20 text-center">Loading your vault...</div>) : wishlist.length > 0 ? (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           <AnimatePresence>
             {wishlist.map((book, i) => (<motion.div key={book.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: i * 0.05 }} className="group relative bg-white rounded-3xl border border-stone-200 overflow-hidden hover:shadow-2xl transition-all">
                 {/* Card Content identical to Home but with Delete button */}
                 <div className="p-6">
                    <div className="aspect-[3/4] rounded-2xl overflow-hidden mb-6">
                      <img src={book.coverUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"/>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <h3 className="font-display text-xl font-bold text-stone-900">{book.title}</h3>
                        <p className="text-stone-500 text-sm italic">by {book.author}</p>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-stone-50">
                        <span className="text-xl font-bold text-stone-900">{formatPrice(book.price)}</span>
                        <div className="flex gap-2">
                           <button onClick={() => removeFromWishlist(book.id)} className="p-3 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all">
                             <Trash2 className="w-5 h-5"/>
                           </button>
                           <button onClick={() => {
                    addToCart(book);
                    removeFromWishlist(book.id);
                }} className="px-6 py-3 bg-stone-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-stone-800 transition-all flex items-center gap-2">
                             <ShoppingCart className="w-4 h-4"/> Move to Cart
                           </button>
                        </div>
                      </div>
                    </div>
                 </div>
               </motion.div>))}
           </AnimatePresence>
        </div>) : (<div className="py-32 bg-stone-50 rounded-[3rem] border-2 border-dashed border-stone-200 text-center flex flex-col items-center justify-center space-y-6">
           <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center shadow-xl rotate-3">
             <Heart className="w-10 h-10 text-stone-200"/>
           </div>
           <div className="space-y-2">
             <h3 className="text-2xl font-bold text-stone-900">Your vault is currently empty</h3>
             <p className="text-stone-500 italic font-light max-w-sm mx-auto">Discover literary gems in our global catalog and save them here for later curation.</p>
           </div>
           <Link to="/" className="group flex items-center gap-2 px-8 py-3 bg-stone-900 text-white rounded-full font-bold transition-all hover:scale-105 active:scale-95 shadow-xl shadow-stone-200">
             Explore Catalog <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-all"/>
           </Link>
        </div>)}

      {/* Suggested Section */}
      <section className="pt-20 space-y-10">
        <div className="flex items-center gap-4">
           <h2 className="font-display text-3xl font-bold text-stone-900 whitespace-nowrap">Recommended Finds</h2>
           <div className="h-px w-full bg-stone-200"/>
           <Sparkles className="w-6 h-6 text-yellow-500 flex-shrink-0"/>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 opacity-40 grayscale pointer-events-none">
           {Array.from({ length: 4 }).map((_, i) => (<div key={i} className="aspect-[3/4] bg-stone-200 rounded-2xl"/>))}
        </div>
      </section>
    </div>);
}
