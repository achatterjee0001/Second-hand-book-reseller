/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import AuthPage from './pages/Auth';
import BookDetails from './pages/BookDetails';
import SellBook from './pages/SellBook';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import Checkout from './pages/Checkout';
import Wishlist from './pages/Wishlist';
import Orders from './pages/Orders';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from './hooks/useCart';
function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading)
        return <div>Loading...</div>;
    if (!user)
        return <Navigate to="/auth"/>;
    return <>{children}</>;
}
function AdminRoute({ children }) {
    const { profile, loading } = useAuth();
    if (loading)
        return <div>Loading...</div>;
    if (profile?.role !== 'admin')
        return <Navigate to="/"/>;
    return <>{children}</>;
}
export default function App() {
    return (<AuthProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen flex flex-col font-sans">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
              <Routes>
                <Route path="/" element={<Home />}/>
                <Route path="/auth" element={<AuthPage />}/>
                <Route path="/book/:id" element={<BookDetails />}/>
                <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>}/>
                <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>}/>
                <Route path="/sell" element={<ProtectedRoute><SellBook /></ProtectedRoute>}/>
                <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>}/>
                <Route path="/chat/:id" element={<ProtectedRoute><Chat /></ProtectedRoute>}/>
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>}/>
                <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>}/>
                <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>}/>
              </Routes>
            </main>
            <Toaster position="bottom-right"/>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>);
}
