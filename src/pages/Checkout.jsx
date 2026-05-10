import { useState } from 'react';
import { apiCall } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { formatPrice, cn } from '../lib/utils';
import { CreditCard, Truck, ShieldCheck, ShoppingBag, ArrowRight, Wallet, Banknote, MapPin, Loader2, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
export default function Checkout() {
    const { user, profile } = useAuth();
    const { cart, clearCart } = useCart();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState('credit');
    const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
    const shipping = cart.length > 0 ? 49 : 0;
    const total = subtotal + shipping;
    const handlePlaceOrder = async () => {
        if (!user || cart.length === 0)
            return;
        setLoading(true);
        try {
            // Create order documents and mark book as sold
            for (const item of cart) {
                await apiCall('/orders', {
                    method: 'POST',
                    body: JSON.stringify({
                        sellerId: item.sellerId,
                        bookId: item.id,
                        amount: item.price + (shipping / cart.length),
                        paymentMethod
                    })
                });
            }
            
            // Update royalty points
            const currentPoints = profile?.loyaltyPoints || 0;
            const pointsEarned = Math.floor(total);
            await apiCall('/users/profile', {
                method: 'PATCH',
                body: JSON.stringify({ loyaltyPoints: currentPoints + pointsEarned })
            });
            
            clearCart();
            setStep(3);
            toast.success('Acquisition Successful!');
        }
        catch (error) {
            toast.error('Financial Settlement Failed');
        }
        finally {
            setLoading(false);
        }
    };
    if (step === 3) {
        return (<div className="min-h-[70vh] flex flex-col items-center justify-center text-center space-y-8 animate-in">
        <div className="w-24 h-24 bg-green-50 rounded-[2.5rem] flex items-center justify-center shadow-inner relative">
          <CheckCircle2 className="w-12 h-12 text-green-600"/>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1.5, opacity: 0 }} transition={{ repeat: Infinity, duration: 2 }} className="absolute inset-0 bg-green-500 rounded-full"/>
        </div>
        <div className="space-y-4">
          <h1 className="font-display text-5xl font-bold text-stone-900 tracking-tight">Acquisition Complete</h1>
          <p className="text-stone-500 text-lg max-w-md mx-auto font-light leading-relaxed">
            Your literary treasure has been secured. The curator is now preparing your volume for transit.
          </p>
        </div>
        <div className="flex gap-4">
           <button onClick={() => navigate('/orders')} className="px-10 py-4 bg-stone-900 text-white rounded-full font-bold hover:bg-stone-800 transition-all shadow-xl">View Order History</button>
           <button onClick={() => navigate('/')} className="px-10 py-4 bg-white border border-stone-200 text-stone-600 rounded-full font-bold hover:bg-stone-50 transition-all">Back to Library</button>
        </div>
      </div>);
    }
    return (<div className="max-w-6xl mx-auto space-y-12 animate-in py-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-stone-400 font-bold text-[10px] uppercase tracking-widest">
            <ShoppingBag className="w-3 h-3"/> Secure Settlement Process
          </div>
          <h1 className="font-display text-5xl font-bold text-stone-900 tracking-tight">Checkout</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className={cn("flex flex-col items-center gap-2", step >= 1 ? "text-stone-900" : "text-stone-300")}>
             <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm", step >= 1 ? "bg-stone-900 text-white shadow-lg" : "bg-stone-100")}>1</div>
             <span className="text-[10px] font-bold uppercase tracking-widest">Review</span>
          </div>
          <div className="w-12 h-px bg-stone-200 mb-6"/>
          <div className={cn("flex flex-col items-center gap-2", step >= 2 ? "text-stone-900" : "text-stone-300")}>
             <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm", step >= 2 ? "bg-stone-900 text-white shadow-lg" : "bg-stone-100")}>2</div>
             <span className="text-[10px] font-bold uppercase tracking-widest">Settle</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        {/* Left Column: Forms */}
        <div className="lg:col-span-2 space-y-12">
          {step === 1 ? (<section className="space-y-8">
               <div className="p-8 bg-white rounded-[2.5rem] border border-stone-200 shadow-xl space-y-8">
                 <h2 className="font-display text-2xl font-bold text-stone-900 flex items-center gap-3"><Truck className="w-6 h-6"/> Shipping Provenance</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                     <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 font-display">Recipient Name</label>
                     <input type="text" defaultValue={profile?.displayName} className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-4 focus:ring-2 focus:ring-stone-900 outline-none transition-all"/>
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 font-display">Digital Reach</label>
                     <input type="email" defaultValue={profile?.email} className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-4 focus:ring-2 focus:ring-stone-900 outline-none transition-all"/>
                   </div>
                   <div className="md:col-span-2 space-y-2">
                     <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 font-display">Destination Gallery</label>
                     <div className="relative">
                       <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400"/>
                       <input type="text" placeholder="Street, House/Unit, City, State" defaultValue={profile?.location?.address} className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-4 pl-12 focus:ring-2 focus:ring-stone-900 outline-none transition-all"/>
                     </div>
                   </div>
                 </div>
               </div>
               
               <div className="p-8 bg-stone-900 rounded-[2.5rem] text-white flex items-center justify-between group cursor-pointer" onClick={() => setStep(2)}>
                 <div>
                   <h3 className="font-display text-xl font-bold">Proceed to Payment</h3>
                   <p className="text-stone-400 text-xs font-medium">Verified via LibriSwap SecureProtocol™</p>
                 </div>
                 <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform"/>
               </div>
             </section>) : (<section className="space-y-8">
               <div className="p-10 bg-white rounded-[2.5rem] border border-stone-200 shadow-xl space-y-10">
                 <h2 className="font-display text-2xl font-bold text-stone-900 flex items-center gap-3"><Wallet className="w-6 h-6"/> Settlement Instrument</h2>
                 
                 <div className="space-y-4">
                   {[
                { id: 'upi', label: 'UPI Transfer', sub: 'GPay, PhonePe, Paytm', icon: Wallet },
                { id: 'credit', label: 'Card Payment', sub: 'RuPay, Visa, Mastercard', icon: CreditCard },
                { id: 'bank', label: 'Netbanking', sub: 'HDFC, SBI, ICICI, etc.', icon: Banknote },
            ].map(method => (<button key={method.id} onClick={() => setPaymentMethod(method.id)} className={cn("w-full flex items-center justify-between p-6 rounded-3xl border-2 transition-all", paymentMethod === method.id ? "bg-stone-50 border-stone-900" : "bg-white border-transparent hover:border-stone-200")}>
                       <div className="flex items-center gap-4">
                         <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center", paymentMethod === method.id ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-400")}>
                           <method.icon className="w-7 h-7"/>
                         </div>
                         <div className="text-left">
                           <p className="font-bold text-stone-900">{method.label}</p>
                           <p className="text-xs text-stone-500 font-medium">{method.sub}</p>
                         </div>
                       </div>
                       <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center", paymentMethod === method.id ? "border-stone-900" : "border-stone-200")}>
                         {paymentMethod === method.id && <div className="w-3 h-3 bg-stone-900 rounded-full"/>}
                       </div>
                     </button>))}
                 </div>

                 {paymentMethod === 'upi' && (<div className="space-y-6 animate-in">
                     <div className="flex flex-col items-center p-6 bg-stone-50 rounded-3xl border border-stone-200 space-y-4">
                       <div className="w-48 h-48 bg-white p-4 rounded-2xl shadow-sm border border-stone-100 flex items-center justify-center">
                         {/* Simulated QR Code */}
                         <div className="w-full h-full bg-stone-100 rounded flex items-center justify-center relative overflow-hidden">
                           <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,_#000_1px,_transparent_0)] bg-[size:8px_8px] opacity-20"/>
                           <div className="z-10 p-4 bg-white/80 backdrop-blur rounded-lg border border-stone-200">
                             <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=libriswap@upi&pn=LibriSwap&am=1.00&cu=INR" alt="UPI QR" className="w-24 h-24 grayscale"/>
                           </div>
                         </div>
                       </div>
                       <p className="text-[10px] text-stone-500 font-bold uppercase tracking-widest">Scan to Pay using any UPI App</p>
                     </div>
                     
                     <div className="relative">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-stone-200"></div></div>
                        <div className="relative flex justify-center text-[10px] uppercase font-bold text-stone-400"><span className="bg-white px-4">OR USE VPA</span></div>
                     </div>

                     <div className="space-y-2">
                       <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">UPI ID (VPA)</label>
                       <input type="text" placeholder="username@upi" className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-4 focus:ring-2 focus:ring-stone-900 outline-none transition-all"/>
                     </div>
                     <p className="text-[10px] text-stone-400 italic">You will receive a payment request on your UPI app after clicking authorize.</p>
                   </div>)}

                 {paymentMethod === 'credit' && (<div className="space-y-4 animate-in">
                     <div className="space-y-2">
                       <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Card Signature</label>
                       <input type="text" placeholder="Card Number" className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-4 focus:ring-2 focus:ring-stone-900 outline-none transition-all"/>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <input type="text" placeholder="MM/YY" className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-4 focus:ring-2 focus:ring-stone-900 outline-none transition-all"/>
                        <input type="password" placeholder="CVV" className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-4 focus:ring-2 focus:ring-stone-900 outline-none transition-all"/>
                     </div>
                   </div>)}
               </div>

               <button onClick={handlePlaceOrder} disabled={loading} className="w-full py-6 bg-stone-900 text-white rounded-full font-bold text-2xl hover:bg-stone-800 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-4 shadow-2xl">
                 {loading ? <Loader2 className="w-7 h-7 animate-spin"/> : `Authorize Settlement • ${formatPrice(total)}`}
               </button>
            </section>)}
        </div>

        {/* Right Column: Summary */}
        <div className="space-y-8">
           <div className="bg-stone-50 rounded-[2.5rem] border border-stone-200 p-8 space-y-8 shadow-inner sticky top-24">
             <h3 className="font-display text-2xl font-bold text-stone-900">Summary of Finds</h3>
             
             <div className="space-y-6">
               {cart.length > 0 ? cart.map(item => (<div key={item.id} className="flex gap-4 group">
                    <div className="w-20 h-24 rounded-xl overflow-hidden bg-white shadow-xl flex-shrink-0">
                      <img src={item.coverUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform"/>
                    </div>
                    <div className="flex flex-col justify-center">
                      <p className="font-bold text-stone-900 text-sm line-clamp-1">{item.title}</p>
                      <p className="text-stone-500 text-xs italic">by {item.author}</p>
                      <p className="font-bold text-stone-900 mt-2">{formatPrice(item.price)}</p>
                    </div>
                 </div>)) : (<p className="text-stone-400 italic text-sm">No items selected for acquisition.</p>)}
             </div>

             <div className="space-y-4 pt-8 border-t border-stone-200">
               <div className="flex justify-between text-sm">
                 <span className="text-stone-500">Inventory Total</span>
                 <span className="font-bold text-stone-900">{formatPrice(subtotal)}</span>
               </div>
               <div className="flex justify-between text-sm">
                 <span className="text-stone-500">Expedited Logistics</span>
                 <span className="font-bold text-stone-900">{formatPrice(shipping)}</span>
               </div>
               <div className="flex justify-between items-end pt-4 border-t-2 border-stone-900 border-dashed">
                 <span className="text-lg font-bold text-stone-900">Total Settlement</span>
                 <span className="text-3xl font-bold text-stone-900 tracking-tighter">{formatPrice(total)}</span>
               </div>
             </div>

             <div className="p-6 bg-white rounded-3xl border border-stone-200 space-y-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-green-600"/>
                  <span className="text-xs font-bold text-stone-900">LibriSwap Escrow Active</span>
                </div>
                <p className="text-[10px] text-stone-500 font-medium">Funds are held until delivery confirmation to ensure collector satisfaction.</p>
             </div>
           </div>
        </div>
      </div>
    </div>);
}
