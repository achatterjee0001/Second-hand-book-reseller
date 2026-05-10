import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiCall } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { Book, Camera, MapPin, Tag, Hash, FileText, CheckCircle2, Loader2, Sparkles, User as UserIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const GENRES = ['Fiction', 'Non-Fiction', 'Sci-Fi', 'Mystery', 'Romance', 'Fantasy', 'Biography', 'Textbook', 'Graphic Novel', 'Poetry', 'Business', 'Philosophy'];

export default function SellBook() {
    const { user, profile, refreshProfile } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

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
                    toast.success('Location synchronized!', { id: "loc-req" });
                    refreshProfile();
                } catch(err) {
                    toast.error('Failed to update location in system.', { id: "loc-req" });
                }
            }, (err) => {
                toast.error('Location access denied.', { id: "loc-req" });
            });
        } else {
            toast.error('Geolocation not supported.');
        }
    };
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        genre: 'Fiction',
        price: '',
        condition: 'Good',
        description: '',
        coverUrl: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user || !profile) {
            toast.error('Please sign in to list items');
            return;
        }
        if (!profile.location || !profile.location.address) {
            toast.error('Location protocol not established. Please update your gallery address in your profile to list treasures.');
            return;
        }
        setLoading(true);
        try {
            const bookData = {
                title: formData.title,
                author: formData.author,
                genre: formData.genre,
                price: parseFloat(formData.price),
                condition: formData.condition,
                description: formData.description,
                images: formData.coverUrl ? [formData.coverUrl] : ['https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80'],
                sellerLocation: profile.location,
            };
            await apiCall('/books', {
                method: 'POST',
                body: JSON.stringify(bookData)
            });
            toast.success('Your treasure is now listed for other collectors!');
            navigate('/');
        }
        catch (error) {
            console.error(error);
            toast.error('Failed to list book');
        }
        finally {
            setLoading(false);
        }
    };

    return (<div className="max-w-4xl mx-auto space-y-12 animate-in py-10">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-stone-100 rounded-full text-[10px] font-bold uppercase tracking-widest text-stone-600 shadow-sm">
          <Sparkles className="w-3 h-3"/> Curator Panel
        </div>
        <h1 className="font-display text-5xl font-bold text-stone-900 tracking-tight leading-tight">Curate a New Request</h1>
        <p className="text-stone-500 text-lg max-w-xl mx-auto font-light leading-relaxed">
          Share your literary treasures with other discerning collectors. Provide detailed provenance to attract the right buyer.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
        <div className="lg:col-span-2 space-y-6">
          <div className="aspect-[3/4] bg-stone-100 rounded-[2.5rem] border-2 border-dashed border-stone-300 flex flex-col items-center justify-center text-stone-400 gap-4 overflow-hidden group hover:border-stone-900 transition-all cursor-pointer">
            {formData.coverUrl ? (<img src={formData.coverUrl} className="w-full h-full object-cover"/>) : (<>
                <Camera className="w-12 h-12 group-hover:scale-110 transition-transform"/>
                <p className="text-sm font-bold uppercase tracking-widest">Upload Cover Image</p>
              </>)}
            <input type="text" placeholder="Paste Image URL" className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-3 rounded-xl text-xs outline-none border border-stone-200" value={formData.coverUrl} onChange={(e) => setFormData({ ...formData, coverUrl: e.target.value })}/>
          </div>
          
          <div className="p-8 bg-stone-50 rounded-3xl border border-stone-200 space-y-6">
            <h3 className="font-display text-xl font-bold text-stone-900">Seller Invariant</h3>
            <div className="flex items-center gap-3 text-stone-600">
              <CheckCircle2 className="w-5 h-5 text-green-600"/>
              <p className="text-sm">Listed from <strong>{profile?.location?.address || 'Your Current Location'}</strong></p>
            </div>
            <div className="flex items-center gap-3 text-stone-600 text-sm">
              <MapPin className="w-5 h-5 text-stone-400"/>
              {profile?.location?.address ? (
                <p>Items listed nearby receive 2.5x more inquiries.</p>
              ) : (
                <button 
                  type="button"
                  onClick={requestLocation}
                  className="text-stone-900 font-bold underline underline-offset-4 hover:text-stone-600 transition-colors"
                >
                  Sync location to enable selling
                </button>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-8 bg-white p-10 rounded-[2.5rem] border border-stone-200 shadow-xl shadow-stone-100">
          <div className="grid grid-cols-1 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-stone-400 flex items-center gap-2">
                <Book className="w-3 h-3"/> Book Title
              </label>
              <input required type="text" placeholder="e.g. The Great Gatsby" className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-4 text-lg focus:ring-2 focus:ring-stone-900 outline-none transition-all" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}/>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-stone-400 flex items-center gap-2">
                <UserIcon className="w-3 h-3"/> Author
              </label>
              <input required type="text" placeholder="F. Scott Fitzgerald" className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-4 focus:ring-2 focus:ring-stone-900 outline-none transition-all" value={formData.author} onChange={(e) => setFormData({ ...formData, author: e.target.value })}/>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-stone-400 flex items-center gap-2">
                  <Tag className="w-3 h-3"/> Genre
                </label>
                <select className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-4 focus:ring-2 focus:ring-stone-900 outline-none transition-all appearance-none cursor-pointer" value={formData.genre} onChange={(e) => setFormData({ ...formData, genre: e.target.value })}>
                  {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-stone-400 flex items-center gap-2">
                  <Hash className="w-3 h-3"/> Condition
                </label>
                <select className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-4 focus:ring-2 focus:ring-stone-900 outline-none transition-all appearance-none cursor-pointer" value={formData.condition} onChange={(e) => setFormData({ ...formData, condition: e.target.value })}>
                  <option value="New">Pristine/New</option>
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good/Used</option>
                  <option value="Fair">Fair/Readable</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-stone-400 flex items-center gap-2">
                Price (USD)
              </label>
              <input required type="number" placeholder="24.99" step="0.01" className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-4 text-2xl font-bold focus:ring-2 focus:ring-stone-900 outline-none transition-all" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })}/>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-stone-400 flex items-center gap-2">
                <FileText className="w-3 h-3"/> Description & History
              </label>
              <textarea required rows={5} placeholder="Describe the edition, any signed pages, and overall condition details..." className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-4 focus:ring-2 focus:ring-stone-900 outline-none transition-all" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}/>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full py-5 bg-stone-900 text-white rounded-full font-bold text-xl hover:bg-stone-800 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl">
            {loading ? <Loader2 className="w-6 h-6 animate-spin"/> : 'Confirm Listing'}
          </button>
        </form>
      </div>
    </div>);
}
