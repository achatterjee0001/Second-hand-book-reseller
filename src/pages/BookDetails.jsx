import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiCall } from "../lib/api";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import { formatPrice, cn } from "../lib/utils";
import {
  MessageSquare,
  ShoppingCart,
  MapPin,
  Star,
  ArrowLeft,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { motion } from "motion/react";
import toast from "react-hot-toast";

export default function BookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const [book, setBook] = useState(null);
  const [seller, setSeller] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(5);

  useEffect(() => {
    if (id) fetchBookData();
  }, [id]);

  const fetchBookData = async () => {
    setLoading(true);
    try {
      const bData = await apiCall(`/books/${id}`);
      setBook(bData);
      setSeller(bData.sellerId); // populated from backend

      const rData = await apiCall(`/reviews?bookId=${id}`);
      setReviews(rData);
    } catch (error) {
      console.error(error);
      toast.error("Error fetching details");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (user.uid === book?.sellerId?._id) {
      toast.error("You can't chat with yourself!");
      return;
    }

    try {
      const threadData = await apiCall('/chat/threads', {
        method: 'POST',
        body: JSON.stringify({ participantId: book?.sellerId?._id || book?.sellerId, bookId: book?.id })
      });
      navigate(`/chat/${threadData.id}`);
    } catch (error) {
      toast.error("Could not start chat");
    }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate("/auth");
      return;
    }
    try {
      await apiCall('/reviews', {
        method: 'POST',
        body: JSON.stringify({
          toUserId: book?.sellerId?._id || book?.sellerId,
          bookId: book?.id,
          rating: newRating,
          comment: newComment
        })
      });
      toast.success("Review added!");
      setNewComment("");
      fetchBookData(); // Refresh reviews
    } catch (error) {
      toast.error("Failed to add review");
    }
  };

  if (loading)
    return (
      <div className="flex h-[80vh] items-center justify-center">
        Loading treasure details...
      </div>
    );
  if (!book) return null;

  return (
    <div className="space-y-12 animate-in pb-20">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors font-medium"
      >
        <ArrowLeft className="w-4 h-4" /> Back to discovery
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Gallery */}
        <div className="space-y-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="aspect-[3/4] rounded-[2.5rem] overflow-hidden bg-stone-100 shadow-2xl border border-stone-200"
          >
            <img
              src={
                book.coverUrl || book.images?.[0] ||
                "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80"
              }
              alt={book.title}
              className="w-full h-full object-cover"
            />
          </motion.div>

          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-2xl bg-stone-100 border border-stone-200 opacity-50 overflow-hidden cursor-not-allowed"
              >
                <img
                  src={book.coverUrl || book.images?.[0] || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80"}
                  className="w-full h-full object-cover grayscale"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="px-4 py-1.5 bg-stone-100 rounded-full text-xs font-bold uppercase tracking-widest text-stone-600">
                {book.genre || 'Book'}
              </span>
              <span
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest",
                  book.condition === "New"
                    ? "bg-green-100 text-green-700"
                    : "bg-blue-100 text-blue-700",
                )}
              >
                {book.condition}
              </span>
            </div>
            <h1 className="font-display text-5xl font-bold text-stone-900 tracking-tight leading-tight">
              {book.title}
            </h1>
            <p className="text-2xl text-stone-500 font-light italic">
              by {book.author}
            </p>
          </div>

          <div className="flex items-baseline gap-4">
            <span className="text-5xl font-bold text-stone-900">
              {formatPrice(book.price)}
            </span>
            <span className="text-stone-400 line-through text-lg font-light">
              {formatPrice(book.price * 1.5)}
            </span>
            <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded text-xs font-bold">
              33% OFF
            </span>
          </div>

          <div className="p-8 bg-stone-50 rounded-3xl border border-stone-200 space-y-4 shadow-inner">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                <ShieldCheck className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="font-bold text-stone-900">LibriSwap Guarantee</p>
                <p className="text-xs text-stone-500">
                  Verified collector item. 48-hour return policy if
                  misdescribed.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => book && addToCart(book)}
              className="flex-1 px-8 py-5 bg-stone-900 text-white rounded-full font-bold text-lg hover:bg-stone-800 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-stone-200 flex items-center justify-center gap-3"
            >
              <ShoppingCart className="w-6 h-6" /> Add to Cart
            </button>
            <button
              onClick={handleStartChat}
              className="px-8 py-5 bg-white border-2 border-stone-900 text-stone-900 rounded-full font-bold text-lg hover:bg-stone-900 hover:text-white transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
            >
              <MessageSquare className="w-6 h-6" /> Chat with Seller
            </button>
          </div>

          <div className="space-y-4 pt-4">
            <h3 className="font-display text-2xl font-bold text-stone-900">
              The Story
            </h3>
            <p className="text-stone-600 leading-relaxed text-lg font-light">
              {book.description ||
                "No description provided for this treasure. Contact the seller for more information about the edition, quality, or backstory of this item."}
            </p>
          </div>

          {/* Seller Profile Card */}
          <div className="pt-8 border-t border-stone-100">
            <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-6">
              About the Curator
            </h3>
            <div className="group flex items-center justify-between p-6 bg-white rounded-3xl border border-stone-200 hover:border-stone-400 transition-all">
              <div className="flex items-center gap-4">
                <div className="relative">
                  {seller?.photoURL ? (
                    <img
                      src={seller.photoURL}
                      className="w-16 h-16 rounded-2xl object-cover ring-4 ring-stone-50"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-stone-900 rounded-2xl flex items-center justify-center text-white text-xl font-bold">
                      {seller?.displayName?.[0] || "C"}
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white shadow-sm" />
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 text-lg">
                    {seller?.displayName || "Exquisite Collector"}
                  </h4>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="flex items-center gap-1 text-xs font-bold text-yellow-600">
                      <Star className="w-3 h-3 fill-current" /> 4.9 Curator
                      Rating
                    </span>
                    <span className="flex items-center gap-1 text-xs font-medium text-stone-500">
                      <MapPin className="w-3 h-3" />{" "}
                      {book.sellerLocation?.address || "Private Gallery"}
                    </span>
                  </div>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-stone-300 group-hover:text-stone-900 group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <section className="bg-stone-50 rounded-[3rem] p-12 mt-20 border border-stone-200 shadow-inner">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="space-y-8">
            <div>
              <h2 className="font-display text-4xl font-bold text-stone-900">
                Collector Reviews
              </h2>
              <p className="text-stone-500 mt-2">
                What they say about this treasure and its handler.
              </p>
            </div>

            <form onSubmit={handleAddReview} className="space-y-4">
              <p className="font-bold text-stone-900">Join the Conversation</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setNewRating(s)}
                    className={cn(
                      "p-1 transition-colors",
                      s <= newRating ? "text-yellow-500" : "text-stone-300",
                    )}
                  >
                    <Star
                      className={cn(
                        "w-6 h-6",
                        s <= newRating && "fill-current",
                      )}
                    />
                  </button>
                ))}
              </div>
              <textarea
                className="w-full bg-white border border-stone-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-stone-900 outline-none transition-all shadow-sm"
                placeholder="Share your experience..."
                rows={4}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                required
              />

              <button className="w-full py-4 bg-stone-900 text-white rounded-xl font-bold hover:bg-stone-800 transition-all">
                Post Review
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {reviews.length > 0 ? (
              reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm animate-in"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center text-xs font-bold text-stone-600">
                        C
                      </div>
                      <div>
                        <p className="font-bold text-stone-900">
                          Member #{rev.fromUserId?.slice(-4)}
                        </p>
                        <p className="text-[10px] uppercase font-bold text-stone-400 tracking-widest">
                          {new Date(
                            rev.createdAt
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex text-yellow-500">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-stone-600 leading-relaxed italic">
                    "{rev.comment}"
                  </p>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 p-20 border-2 border-dashed border-stone-200 rounded-[2.5rem]">
                <MessageSquare className="w-12 h-12 text-stone-300" />
                <p className="text-stone-500 italic">
                  No reviews yet. Be the first to critique this volume.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
