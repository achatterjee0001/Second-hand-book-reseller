import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";

import {
  Book,
  Heart,
  MessageSquare,
  ShoppingCart,
  LogOut,
  Shield,
} from "lucide-react";

export default function Navbar() {
  const { user, profile } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-50 glass-card bg-white/80 border-b border-stone-200">
      <div className="container mx-auto px-4 max-w-7xl h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-stone-900 p-2 rounded-lg group-hover:rotate-6 transition-transform">
            <Book className="text-white w-5 h-5" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight text-stone-900">
            LibriSwap
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link
            to="/"
            className="text-stone-600 hover:text-stone-900 font-medium transition-colors"
          >
            Browse
          </Link>
          <Link
            to="/sell"
            className="text-stone-600 hover:text-stone-900 font-medium transition-colors"
          >
            Sell a Book
          </Link>
          {profile?.role === "admin" && (
            <Link
              to="/admin"
              className="flex items-center gap-1.5 text-stone-600 hover:text-stone-900 font-medium transition-colors"
            >
              <Shield className="w-4 h-4" /> Admin
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link
                to="/wishlist"
                className="p-2 text-stone-600 hover:bg-stone-100 rounded-full transition-colors relative"
              >
                <Heart className="w-5 h-5" />
              </Link>
              <Link
                to="/chat"
                className="p-2 text-stone-600 hover:bg-stone-100 rounded-full transition-colors"
              >
                <MessageSquare className="w-5 h-5" />
              </Link>
              <Link
                to="/checkout"
                className="p-2 text-stone-600 hover:bg-stone-100 rounded-full transition-colors relative"
              >
                <ShoppingCart className="w-5 h-5" />
                {cart.length > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-stone-900 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </Link>
              <div className="h-6 w-px bg-stone-200 mx-2" />
              <Link
                to="/profile"
                className="flex items-center gap-2 pl-2 pr-4 py-1.5 hover:bg-stone-100 rounded-full transition-colors"
              >
                {profile?.photoURL ? (
                  <img
                    src={profile.photoURL}
                    alt=""
                    className="w-8 h-8 rounded-full border border-stone-200"
                  />
                ) : (
                  <div className="w-8 h-8 bg-stone-900 flex items-center justify-center rounded-full text-white text-xs font-bold">
                    {profile?.displayName?.[0] || "U"}
                  </div>
                )}
                <span className="text-sm font-semibold text-stone-800 hidden sm:inline">
                  {profile?.displayName?.split(" ")[0]}
                </span>
              </Link>
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  window.location.href = '/';
                }}
                className="p-2 text-stone-400 hover:text-red-500 rounded-full transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="px-6 py-2 bg-stone-900 text-white rounded-full font-semibold hover:bg-stone-800 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-stone-200"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
