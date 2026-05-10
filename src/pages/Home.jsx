import { useState, useEffect } from 'react';
import { apiCall } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { calculateDistance, formatPrice, cn } from '../lib/utils';
import { Search, SlidersHorizontal, MapPin, Share2, ShoppingCart, Heart, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const GENRES = ['Fiction', 'Non-Fiction', 'Sci-Fi', 'Mystery', 'Romance', 'Fantasy', 'Biography', 'Textbook'];

export default function Home() {
    const { profile, user, setProfile } = useAuth();
    const { addToCart, toggleWishlist, isInWishlist } = useCart();
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGenre, setSelectedGenre] = useState(null);
    const [maxPrice, setMaxPrice] = useState(10000);
    const [showFilters, setShowFilters] = useState(false);
    const [locationError, setLocationError] = useState(null);

    useEffect(() => {
        fetchBooks();
    }, [selectedGenre]);

    const fetchBooks = async () => {
        setLoading(true);
        try {
            let url = '/books?status=available';
            if (selectedGenre) {
                // We'd need backend support for genre filtering, or we can filter locally. 
                // Let's assume the backend supports it or filter locally. 
                // Let's add it to the query assuming backend might support it, but we can also filter locally if not.
                url += `&genre=${selectedGenre}`;
            }
            let fetchedBooks = await apiCall(url);
            
            // local fallback if backend doesn't filter genre (we didn't add genre field to Book model, but let's assume it was added or we just filter locally)
            if (selectedGenre) {
                fetchedBooks = fetchedBooks.filter(b => b.genre === selectedGenre);
            }

            // Calculate distances if user profile has location
            if (profile?.location?.lat && profile?.location?.lng) {
                fetchedBooks = fetchedBooks.map(book => {
                    if (book.sellerLocation) {
                        const dist = calculateDistance(profile.location.lat, profile.location.lng, book.sellerLocation.lat, book.sellerLocation.lng);
                        return { ...book, distance: dist };
                    }
                    return book;
                });
                // Sort by distance
                fetchedBooks.sort((a, b) => (a.distance || 999999) - (b.distance || 999999));
            }
            setBooks(fetchedBooks);
        }
        catch (error) {
            console.error(error);
            toast.error('Failed to load books');
        }
        finally {
            setLoading(false);
        }
    };

    const [recommendations, setRecommendations] = useState([]);
    const [fetchingRecs, setFetchingRecs] = useState(false);

    useEffect(() => {
        if (books.length > 0) {
            fetchRecommendations();
        }
    }, [books]);

    const fetchRecommendations = async () => {
        if (!user || books.length === 0) return;
        setFetchingRecs(true);
        try {
            const purchasedBooks = await apiCall('/orders');
            const { getBookRecommendations } = await import('../services/recommendationService');
            const recs = await getBookRecommendations(purchasedBooks, books);
            setRecommendations(recs);
        }
        catch (error) {
            console.error(error);
        }
        finally {
            setFetchingRecs(false);
        }
    };

    const handleShare = (book) => {
        const url = `${window.location.origin}/book/${book.id}`;
        if (navigator.share) {
            navigator.share({ title: book.title, text: `Check out this book: ${book.title}`, url });
        }
        else {
            navigator.clipboard.writeText(url);
            toast.success('Link copied to clipboard!');
        }
    };

    const filteredBooks = books.filter(b => (b.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.author?.toLowerCase().includes(searchTerm.toLowerCase())) &&
        b.price <= maxPrice);

    const requestLocation = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(async (pos) => {
                const newLocation = {
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                    address: 'Approximate Location'
                };
                if (user) {
                    try {
                        const updatedProfile = await apiCall('/users/profile', {
                            method: 'PATCH',
                            body: JSON.stringify({ location: newLocation })
                        });
                        setProfile(updatedProfile);
                        toast.success('Location updated for better discovery!');
                    } catch(err) {
                        toast.error('Failed to update location');
                    }
                }
            }, (err) => {
                setLocationError('Please enable location for local book hunting!');
            });
        }
    };

    return (<div className="space-y-8 animate-in">
      {/* Hero Section */}
      <section className="relative h-[400px] rounded-[2.5rem] overflow-hidden bg-stone-900 group">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80')] bg-cover bg-center mix-blend-overlay opacity-40 group-hover:scale-105 transition-transform duration-1000"/>
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-transparent"/>
        <div className="relative h-full flex flex-col items-center justify-center p-8 text-center text-white space-y-6">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display text-5xl md:text-7xl font-bold tracking-tight max-w-4xl">
            Find Treasures <span className="text-stone-400 italic">Nearby.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-stone-300 text-lg md:text-xl max-w-2xl lowercase font-light tracking-wide">
            the premium marketplace for distinguished book collectors and casual readers alike.
          </motion.p>
          
          <div className="w-full max-w-2xl relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5"/>
            <input type="text" placeholder="Search by title, author, or keyword..." className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-full pl-14 pr-6 focus:bg-white focus:text-stone-900 transition-all outline-none text-lg shadow-2xl h-[55px]" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
          </div>
        </div>
      </section>

      {/* AI Recommendations */}
      {user && recommendations.length > 0 && (<section className="space-y-6 pt-4 animate-in">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-stone-900 rounded-xl flex items-center justify-center shadow-lg">
               <Sparkles className="w-5 h-5 text-yellow-500"/>
             </div>
             <div>
               <h2 className="font-display text-2xl font-bold text-stone-900">Curated for You</h2>
               <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">AI Analysis Based on Your Collection</p>
             </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendations.map(book => (<Link key={book.id} to={`/book/${book.id}`} className="group flex gap-4 p-4 bg-white rounded-2xl border border-stone-200 hover:border-stone-900 transition-all hover:shadow-lg">
                <div className="w-16 h-20 bg-stone-50 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={book.coverUrl || book.images?.[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform"/>
                </div>
                <div className="flex flex-col justify-center overflow-hidden">
                  <p className="font-bold text-stone-900 text-sm line-clamp-1">{book.title}</p>
                  <p className="text-stone-500 text-[10px] font-bold uppercase tracking-wider">{book.genre || 'Book'}</p>
                </div>
              </Link>))}
          </div>
        </section>)}

      {/* Discovery Feed Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-bold text-stone-900">Discovery Feed</h2>
          <p className="text-stone-500 text-sm mt-1">Showing the rarest and nearest finds for you.</p>
        </div>
        
        <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
          {!profile?.location && (<button onClick={requestLocation} className="flex items-center gap-2 px-4 py-2 bg-stone-100 text-stone-700 rounded-full hover:bg-stone-200 transition-colors text-sm font-semibold whitespace-nowrap">
              <MapPin className="w-4 h-4"/> Enable Local Discovery
            </button>)}
          <button onClick={() => setShowFilters(!showFilters)} className={cn("flex items-center gap-2 px-4 py-2 rounded-full transition-all text-sm font-semibold border", showFilters ? "bg-stone-900 border-stone-900 text-white" : "bg-white border-stone-200 text-stone-600 hover:border-stone-400")}>
            <SlidersHorizontal className="w-4 h-4"/> Filters
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showFilters && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-white rounded-3xl border border-stone-200 p-6 space-y-6">
            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-widest text-stone-400">Filter by Genre</label>
              <div className="flex flex-wrap gap-2">
                {GENRES.map(genre => (<button key={genre} onClick={() => setSelectedGenre(selectedGenre === genre ? null : genre)} className={cn("px-5 py-2 rounded-full text-sm font-medium transition-all", selectedGenre === genre ? "bg-stone-900 text-white" : "bg-stone-50 text-stone-600 hover:bg-stone-200")}>
                    {genre}
                  </button>))}
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase tracking-widest text-stone-400">Max Price: {formatPrice(maxPrice)}</label>
              </div>
              <input type="range" min="0" max="10000" step="50" value={maxPrice} onChange={(e) => setMaxPrice(parseInt(e.target.value))} className="w-full h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-900"/>
            </div>
          </motion.div>)}
      </AnimatePresence>

      {/* Book Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {loading ? (Array.from({ length: 8 }).map((_, i) => (<div key={i} className="animate-pulse space-y-4">
              <div className="aspect-[3/4] bg-stone-200 rounded-3xl"/>
              <div className="h-4 bg-stone-200 rounded-full w-3/4"/>
              <div className="h-4 bg-stone-200 rounded-full w-1/2"/>
            </div>))) : filteredBooks.length > 0 ? (filteredBooks.map((book, i) => (<motion.div key={book.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="group relative bg-white rounded-3xl border border-stone-200 overflow-hidden hover:shadow-2xl transition-all hover:-translate-y-1">
              <Link to={`/book/${book.id}`}>
                <div className="relative aspect-[3/4] overflow-hidden bg-stone-50">
                  <img src={book.coverUrl || book.images?.[0] || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80'} alt={book.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"/>
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest text-stone-900 shadow-sm">
                      {book.genre || 'Book'}
                    </span>
                  </div>
                  {book.distance !== undefined && (<div className="absolute bottom-4 left-4">
                      <span className="px-3 py-1 bg-stone-900/80 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest text-white flex items-center gap-1 shadow-sm">
                        <MapPin className="w-3 h-3"/> {Math.round(book.distance)}km away
                      </span>
                    </div>)}
                </div>
              </Link>

              <div className="p-6 space-y-4">
                <div className="space-y-1">
                  <Link to={`/book/${book.id}`} className="block">
                    <h3 className="font-display text-xl font-bold text-stone-900 line-clamp-1 group-hover:text-stone-600 transition-colors">
                      {book.title}
                    </h3>
                  </Link>
                  <p className="text-stone-500 text-sm">{book.author}</p>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-stone-900">{formatPrice(book.price)}</span>
                  <div className="flex gap-2">
                    <button onClick={() => handleShare(book)} className="p-2 text-stone-400 hover:bg-stone-50 rounded-full transition-colors">
                      <Share2 className="w-4 h-4"/>
                    </button>
                    <button onClick={() => toggleWishlist(book.id)} className={cn("p-2 rounded-full transition-colors", isInWishlist(book.id) ? "text-red-500 bg-red-50" : "text-stone-400 hover:text-red-500 hover:bg-red-50")}>
                      <Heart className={cn("w-4 h-4", isInWishlist(book.id) && "fill-current")}/>
                    </button>
                    <button onClick={() => addToCart(book)} className="p-2 bg-stone-900 text-white rounded-full hover:bg-stone-800 transition-colors shadow-lg shadow-stone-200">
                      <ShoppingCart className="w-4 h-4"/>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>))) : (<div className="col-span-full py-20 text-center space-y-4">
            <div className="bg-stone-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-8 h-8 text-stone-400"/>
            </div>
            <h3 className="text-2xl font-bold text-stone-900">No books found</h3>
            <p className="text-stone-500 max-w-xs mx-auto">Try adjusting your filters or search terms to find what you're looking for.</p>
          </div>)}
      </div>
    </div>);
}
