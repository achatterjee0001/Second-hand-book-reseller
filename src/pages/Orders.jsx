import { useState, useEffect } from 'react';
import { apiCall } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { formatPrice, cn } from '../lib/utils';
import { Package, Truck, CheckCircle, Clock, MapPin, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
export default function Orders() {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        if (user)
            fetchOrders();
    }, [user]);
    const fetchOrders = async () => {
        setLoading(true);
        try {
            const ordersWithBooks = await apiCall('/orders');
            // Backend already populates bookId, but we might need to map it to 'book' property
            // if the frontend expects `order.book` instead of `order.bookId` as object.
            const mappedOrders = ordersWithBooks.map(order => ({
                ...order,
                book: typeof order.bookId === 'object' ? order.bookId : null
            }));
            setOrders(mappedOrders);
        }
        catch (error) {
            console.error(error);
            toast.error('Failed to load transaction history');
        }
        finally {
            setLoading(false);
        }
    };
    return (<div className="max-w-5xl mx-auto space-y-12 animate-in py-10">
      <div className="space-y-4 text-center md:text-left">
        <h1 className="font-display text-5xl font-bold text-stone-900 tracking-tight">Acquisition Ledger</h1>
        <p className="text-stone-500 text-lg font-light max-w-xl leading-relaxed">
          The curated history of your literary acquisitions across the LibriSwap network.
        </p>
      </div>

      {loading ? (<div className="py-20 text-center flex flex-col items-center gap-4">
          <Clock className="w-10 h-10 text-stone-300 animate-spin"/>
          <p className="text-stone-400 font-bold uppercase tracking-widest text-[10px]">Consulting the deep archives...</p>
        </div>) : orders.length > 0 ? (<div className="grid grid-cols-1 gap-6">
          {orders.map((order, i) => (<div key={order.id} className="bg-white rounded-[2rem] border border-stone-200 overflow-hidden shadow-xl shadow-stone-100 hover:shadow-2xl transition-all group">
              <div className="p-8 flex flex-col md:flex-row gap-8 items-center">
                 {/* Book Thumbnail */}
                 <div className="w-32 h-40 bg-stone-100 rounded-2xl overflow-hidden shadow-inner flex-shrink-0">
                    {order.book?.coverUrl ? (<img src={order.book.coverUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"/>) : (<div className="w-full h-full flex items-center justify-center">
                        <Package className="w-8 h-8 text-stone-300"/>
                      </div>)}
                 </div>

                 {/* Order Info */}
                 <div className="flex-grow space-y-4 text-center md:text-left w-full">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                       <div>
                         <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Order Ledger Token #{order.id.slice(-8).toUpperCase()}</p>
                         <h3 className="font-display text-2xl font-bold text-stone-900 mt-1">{order.book?.title || 'Unknown Volume'}</h3>
                       </div>
                       <div className="flex items-center gap-3 self-center md:self-start">
                         <span className={cn("flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest", order.status === 'completed' ? "bg-green-50 text-green-700 border border-green-100" : "bg-stone-100 text-stone-500 border border-stone-200")}>
                           {order.status === 'completed' ? <CheckCircle className="w-3.5 h-3.5"/> : <Clock className="w-3.5 h-3.5"/>}
                           {order.status}
                         </span>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4 border-t border-stone-50">
                       <div>
                         <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Acquired For</p>
                         <p className="font-bold text-stone-900">{formatPrice(order.amount)}</p>
                       </div>
                       <div>
                         <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Settlement</p>
                         <p className="font-medium text-stone-700 capitalize">{order.paymentMethod}</p>
                       </div>
                       <div>
                         <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Curator</p>
                         <p className="font-medium text-stone-700">
                           {order.sellerId?._id === user?.uid ? 'Me' : (order.sellerId?.displayName || 'Network Member')}
                         </p>
                       </div>
                       <div>
                         <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Date</p>
                         <p className="font-medium text-stone-700">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</p>
                       </div>
                    </div>
                 </div>

                 {/* Action */}
                 <div className="flex flex-col gap-2 w-full md:w-auto">
                    <Link to={`/book/${order.bookId}`} className="px-6 py-3 bg-stone-900 text-white rounded-xl font-bold text-sm text-center hover:bg-stone-800 transition-all flex items-center justify-center gap-2 whitespace-nowrap">
                      Inspect Item <ArrowRight className="w-4 h-4"/>
                    </Link>
                    <button 
                      onClick={() => toast.success("Tracking system synchronized. Item is currently in transit between collector hubs.")}
                      className="px-6 py-3 bg-stone-50 text-stone-600 rounded-xl font-bold text-sm text-center hover:bg-stone-100 transition-all"
                    >
                      Track Logistics
                    </button>
                 </div>
              </div>
            </div>))}
        </div>) : (<div className="py-32 bg-stone-50 rounded-[3rem] border-2 border-dashed border-stone-200 text-center flex flex-col items-center justify-center space-y-6">
           <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center shadow-xl rotate-3">
             <Package className="w-10 h-10 text-stone-200"/>
           </div>
           <div className="space-y-2">
             <h3 className="text-2xl font-bold text-stone-900">Your ledger is silent.</h3>
             <p className="text-stone-500 italic font-light max-w-sm mx-auto">No acquisitions have been recorded under your profile. Start your collection by browsing the catalog.</p>
           </div>
           <Link to="/" className="px-8 py-3 bg-stone-900 text-white rounded-full font-bold transition-all hover:scale-105 active:scale-95 shadow-xl shadow-stone-200">
             Discover Treasures
           </Link>
        </div>)}

      {/* Trust Badge */}
      <div className="pt-20 flex flex-col items-center opacity-30 grayscale saturate-0 space-y-4">
         <div className="flex gap-12 items-center">
            <Truck className="w-8 h-8"/>
            <ShieldCheck className="w-8 h-8"/>
            <MapPin className="w-8 h-8"/>
            <Package className="w-8 h-8"/>
         </div>
         <p className="text-[10px] font-bold uppercase tracking-[0.3em]">Institutional Grade Supply Chain</p>
      </div>
    </div>);
}
