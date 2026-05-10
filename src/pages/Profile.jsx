import { useState, useEffect } from 'react';
import { apiCall } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { Book, Package, MapPin, Award, Settings, ShieldCheck, ChevronRight, Edit3, Trash2 } from 'lucide-react';
import { formatPrice, cn } from '../lib/utils';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';

export default function Profile() {
    const { user, profile, refreshProfile } = useAuth();
    const [activeTab, setActiveTab] = useState('listings');
    const [myBooks, setMyBooks] = useState([]);
    const [myOrders, setMyOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingLocation, setEditingLocation] = useState(false);
    const [newAddress, setNewAddress] = useState(profile?.location?.address || '');

    useEffect(() => {
        if (user)
            fetchData();
    }, [user]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const bSnap = await apiCall(`/books?sellerId=${user.uid}`);
            setMyBooks(bSnap);
            const oSnap = await apiCall(`/orders`);
            setMyOrders(oSnap);
        }
        catch (error) {
            toast.error('Failed to load profile data');
        }
        finally {
            setLoading(false);
        }
    };

    const handleUpdateLocation = async () => {
        if (!user)
            return;
        try {
            const newLoc = {
                lat: profile?.location?.lat || 0,
                lng: profile?.location?.lng || 0,
                address: newAddress
            };
            await apiCall('/users/profile', {
                method: 'PATCH',
                body: JSON.stringify({ location: newLoc })
            });
            toast.success('Gallery location updated!');
            setEditingLocation(false);
            refreshProfile();
        }
        catch (error) {
            toast.error('Failed to update location');
        }
    };

    const handleDeleteBook = async (bookId) => {
        if (!window.confirm('Are you sure you want to remove this treasure from your gallery? This action is irreversible.'))
            return;
        try {
            await apiCall(`/books/${bookId}`, { method: 'DELETE' });
            toast.success('Treasure removed from system.');
            fetchData();
        }
        catch (error) {
            toast.error('Deletion protocol failed.');
        }
    };

    const requestLocation = () => {
        if ("geolocation" in navigator) {
            toast.loading("Requesting location access...", { id: "loc-req" });
            navigator.geolocation.getCurrentPosition(async (pos) => {
                const newLocation = {
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                    address: 'Local Collector Hub' 
                };
                try {
                    await apiCall('/users/profile', {
                        method: 'PATCH',
                        body: JSON.stringify({ location: newLocation })
                    });
                    toast.success('Location synchronized with system!', { id: "loc-req" });
                    refreshProfile();
                } catch(err) {
                    toast.error('Failed to update database.', { id: "loc-req" });
                }
            }, (err) => {
                toast.error('Access denied. Please enable permission manually.', { id: "loc-req" });
                setActiveTab('settings');
                setEditingLocation(true);
            });
        } else {
            toast.error('Geolocation protocol not supported.');
            setActiveTab('settings');
            setEditingLocation(true);
        }
    };
    if (!profile)
        return null;
    return (<div className="space-y-12 animate-in py-8">
      {/* Header Card */}
      <section className="relative overflow-hidden rounded-[3rem] bg-stone-900 p-12 text-white">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-stone-100/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"/>
        
        <div className="relative flex flex-col md:flex-row items-center gap-10">
          <div className="relative">
            {profile.photoURL ? (<img src={profile.photoURL} className="w-32 h-32 rounded-3xl object-cover ring-8 ring-stone-800 shadow-2xl"/>) : (<div className="w-32 h-32 bg-white rounded-3xl flex items-center justify-center text-stone-900 text-4xl font-bold shadow-2xl">
                {profile.displayName[0]}
              </div>)}
            <div className="absolute -bottom-2 -right-2 bg-stone-100 p-3 rounded-2xl shadow-xl border border-stone-800">
               <ShieldCheck className="w-6 h-6 text-stone-900"/>
            </div>
          </div>
          
          <div className="flex-grow text-center md:text-left space-y-2">
            <h1 className="font-display text-4xl font-bold">{profile.displayName}</h1>
            <p className="text-stone-400 font-medium italic opacity-80">{profile.email}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-6">
              <div className="px-5 py-2.5 bg-stone-800 rounded-2xl flex items-center gap-2 border border-stone-700 shadow-sm transition-transform hover:-translate-y-1">
                <Award className="w-5 h-5 text-yellow-500"/>
                <span className="text-sm font-bold tracking-tight">{profile.loyaltyPoints} Collector Points</span>
              </div>
              <button 
                onClick={requestLocation}
                className="px-5 py-2.5 bg-stone-800 rounded-2xl flex items-center gap-2 border border-stone-700 shadow-sm transition-transform hover:-translate-y-1 hover:bg-stone-700"
              >
                <MapPin className="w-5 h-5 text-stone-400"/>
                <span className="text-sm font-bold tracking-tight">{profile.location?.address || 'Location Not Set'}</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
             <button onClick={() => setActiveTab('settings')} className="px-8 py-3 bg-white text-stone-900 rounded-2xl font-bold hover:scale-105 active:scale-95 transition-all shadow-xl">Manage Profile</button>
             <Link to="/sell" className="px-8 py-3 bg-stone-700 text-white rounded-2xl font-bold hover:bg-stone-600 transition-all text-center">List New Book</Link>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="flex gap-8 border-b border-stone-200">
        {[
            { id: 'listings', icon: Book, label: 'My Gallery' },
            { id: 'orders', icon: Package, label: 'Order History' },
            { id: 'settings', icon: Settings, label: 'Account Systems' }
        ].map(tab => (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn("flex items-center gap-2 pb-4 text-sm font-bold uppercase tracking-widest transition-all relative", activeTab === tab.id ? "text-stone-900" : "text-stone-400 hover:text-stone-600")}>
            <tab.icon className="w-4 h-4"/> {tab.label}
            {activeTab === tab.id && (<motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-stone-900 rounded-full"/>)}
          </button>))}
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {activeTab === 'listings' && (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in">
             {myBooks.length > 0 ? myBooks.map(book => (<div key={book.id} className="group glass-card rounded-3xl border border-stone-200 overflow-hidden flex flex-col hover:shadow-xl transition-all">
                 <div className="aspect-[4/3] relative overflow-hidden bg-stone-100">
                    <img src={book.coverUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"/>
                    <div className="absolute top-4 right-4">
                      <span className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest", book.status === 'available' ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-500")}>{book.status}</span>
                    </div>
                 </div>
                 <div className="p-6 space-y-4 flex-grow flex flex-col justify-between">
                   <div className="space-y-1">
                     <h4 className="font-display text-xl font-bold text-stone-900">{book.title}</h4>
                     <p className="text-stone-500 text-sm font-medium">{book.author}</p>
                   </div>
                   <div className="flex justify-between items-center pt-4 border-t border-stone-50 mt-auto">
                     <span className="text-xl font-bold text-stone-900">{formatPrice(book.price)}</span>
                     <div className="flex gap-2">
                       <button 
                         onClick={() => handleDeleteBook(book.id)}
                         className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all"
                         title="Remove Listing"
                       >
                         <Trash2 className="w-5 h-5"/>
                       </button>
                       <Link to={`/book/${book.id}`} className="p-2 bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-all">
                         <ChevronRight className="w-5 h-5"/>
                       </Link>
                     </div>
                   </div>
                 </div>
               </div>)) : (<div className="col-span-full py-20 bg-stone-50 rounded-[3rem] border-2 border-dashed border-stone-200 text-center flex flex-col items-center justify-center space-y-4">
                 <Book className="w-12 h-12 text-stone-300"/>
                 <p className="text-stone-500 italic">You haven't shared any treasures yet.</p>
                 <Link to="/sell" className="text-stone-900 font-bold underline underline-offset-8">Curate your first listing</Link>
               </div>)}
          </div>)}

        {activeTab === 'orders' && (<div className="space-y-4 animate-in">
            {myOrders.length > 0 ? myOrders.map(order => (<div key={order.id} className="bg-white p-6 rounded-2xl border border-stone-200 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                 <div className="flex items-center gap-6">
                   <div className="w-16 h-16 bg-stone-100 rounded-xl flex items-center justify-center">
                     <Package className="w-8 h-8 text-stone-400"/>
                   </div>
                   <div>
                     <p className="font-bold text-stone-900 text-lg">Order #{order.id.slice(-6).toUpperCase()}</p>
                     <p className="text-xs text-stone-500 font-bold uppercase tracking-widest">
                        Placed on {new Date(order.createdAt).toLocaleDateString()}
                     </p>
                   </div>
                 </div>
                 <div className="text-right space-y-1">
                   <p className="text-xl font-bold text-stone-900">{formatPrice(order.amount)}</p>
                   <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold uppercase tracking-widest">
                     {order.status}
                   </span>
                 </div>
               </div>)) : (<div className="py-20 bg-stone-50 rounded-[3rem] border-2 border-dashed border-stone-200 text-center flex flex-col items-center justify-center space-y-4">
                <Package className="w-12 h-12 text-stone-300"/>
                <p className="text-stone-500 italic">No historical transactions found.</p>
              </div>)}
          </div>)}

        {activeTab === 'settings' && (<div className="max-w-2xl bg-white p-10 rounded-[2.5rem] border border-stone-200 shadow-xl space-y-10 animate-in">
            <h3 className="font-display text-2xl font-bold text-stone-900 flex items-center gap-3">
              <ShieldCheck className="w-7 h-7 text-stone-900"/> Personal Invariants
            </h3>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-stone-400">Display Identity</label>
                <div className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-100">
                  <span className="font-medium text-stone-900">{profile.displayName}</span>
                  <Edit3 className="w-4 h-4 text-stone-400 cursor-not-allowed opacity-50"/>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-end">
                   <label className="text-xs font-bold uppercase tracking-widest text-stone-400 font-display">Gallery Location</label>
                   {!editingLocation && <button onClick={() => setEditingLocation(true)} className="text-xs font-bold text-stone-900 flex items-center gap-1"><Edit3 className="w-3 h-3"/> Update</button>}
                </div>
                {editingLocation ? (<div className="space-y-4 animate-in">
                    <input type="text" className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-4 focus:ring-2 focus:ring-stone-900 outline-none transition-all" value={newAddress} onChange={(e) => setNewAddress(e.target.value)} placeholder="Enter new gallery address..."/>
                    <div className="flex gap-2">
                      <button onClick={handleUpdateLocation} className="flex-1 py-3 bg-stone-900 text-white rounded-xl font-bold hover:bg-stone-800 transition-all">Save Location</button>
                      <button onClick={() => setEditingLocation(false)} className="px-6 py-3 bg-stone-100 text-stone-600 rounded-xl font-bold hover:bg-stone-200 transition-all">Cancel</button>
                    </div>
                  </div>) : (<div className="p-4 bg-stone-50 rounded-2xl border border-stone-100 text-stone-600 font-medium italic">
                    {profile.location?.address || 'Specify a location for better local discovery'}
                  </div>)}
              </div>
            </div>

            <div className="pt-10 border-t border-stone-100 text-center">
              <p className="text-xs text-stone-400 mb-6 uppercase font-bold tracking-widest">Collector Loyalty Program</p>
              <div className="inline-flex flex-col items-center gap-2">
                <div className="w-20 h-20 bg-stone-900 rounded-[2rem] flex items-center justify-center text-white text-2xl font-bold shadow-xl rotate-3">
                  {profile.loyaltyPoints}
                </div>
                <p className="text-xs font-bold text-stone-900 mt-2">Elite Points Accumulated</p>
                <p className="text-[10px] text-stone-400 mt-1 max-w-[180px]">Redeemable for priority shipping and curator badges.</p>
              </div>
            </div>
          </div>)}
      </div>
    </div>);
}
