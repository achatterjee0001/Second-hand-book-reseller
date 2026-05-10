import { useState, useEffect } from "react";
import { apiCall } from "../lib/api";
import {
  Shield,
  Users,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Package,
  CheckCircle2,
  Search,
  Filter,
} from "lucide-react";
import { formatPrice, cn } from "../lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import toast from "react-hot-toast";

export default function Admin() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBooks: 0,
    totalSales: 0,
    activeOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState([]);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // In a real app we would have an admin endpoint to get these stats efficiently
      const users = await apiCall('/users', { method: 'GET' }).catch(() => []);
      const books = await apiCall('/books', { method: 'GET' }).catch(() => []);
      const orders = await apiCall('/orders/all', { method: 'GET' }).catch(() => []); // assume /orders/all for admin

      const totalSales = orders.reduce((sum, o) => sum + (o.amount || 0), 0);

      setStats({
        totalUsers: users.length || 0,
        totalBooks: books.length || 0,
        totalSales: totalSales,
        activeOrders: orders.filter((o) => o.status === "pending").length,
      });

      setRecentOrders(orders.slice(0, 10));

      // Dummy data for chart
      setSalesData([
        { name: "Mon", sales: 400 },
        { name: "Tue", sales: 700 },
        { name: "Wed", sales: 500 },
        { name: "Thu", sales: 900 },
        { name: "Fri", sales: 1200 },
        { name: "Sat", sales: 1500 },
        { name: "Sun", sales: 1100 },
      ]);
    } catch (error) {
      toast.error("Access Denied: Highly Restricted Protocol");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="h-[80vh] flex items-center justify-center">
        Authenticating restricted access...
      </div>
    );

  return (
    <div className="space-y-12 animate-in pb-20">
      <header className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-red-600">
            <Shield className="w-5 h-5 fill-current" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
              Restricted Administrative Access
            </span>
          </div>
          <h1 className="font-display text-5xl font-bold text-stone-900 tracking-tight">
            System Authority
          </h1>
        </div>

        <div className="flex gap-4">
          <button
            onClick={fetchAdminData}
            className="px-6 py-2.5 bg-stone-100 text-stone-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-stone-200 transition-all"
          >
            Sync Repository
          </button>
          <button
            onClick={async () => {
              const currentUid = localStorage.getItem("token") ? "me" : "system_gen";
              const sampleBooks = [
                {
                  title: "The Great Gatsby",
                  author: "F. Scott Fitzgerald",
                  genre: "Fiction",
                  price: 499,
                  condition: "Excellent",
                  description: "A classic tale of the American dream.",
                  images: [
                    "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80"
                  ],
                  status: "available",
                },
                {
                  title: "Sapiens",
                  author: "Yuval Noah Harari",
                  genre: "Non-Fiction",
                  price: 699,
                  condition: "New",
                  description: "A brief history of humankind.",
                  images: [
                    "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80"
                  ],
                  status: "available",
                },
                {
                  title: "Dune",
                  author: "Frank Herbert",
                  genre: "Sci-Fi",
                  price: 549,
                  condition: "Good",
                  description: "The epic space opera masterpiece.",
                  images: [
                    "https://images.unsplash.com/photo-1543004218-2bc129037397?auto=format&fit=crop&q=80"
                  ],
                  status: "available",
                },
                {
                  title: "The Hobbit",
                  author: "J.R.R. Tolkien",
                  genre: "Fantasy",
                  price: 399,
                  condition: "Fair",
                  description: "There and back again.",
                  images: [
                    "https://images.unsplash.com/photo-1621351123083-ae1f3014902b?auto=format&fit=crop&q=80"
                  ],
                  status: "available",
                },
                {
                  title: "Atomic Habits",
                  author: "James Clear",
                  genre: "Non-Fiction",
                  price: 799,
                  condition: "New",
                  description: "An easy & proven way to build good habits.",
                  images: [
                    "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80"
                  ],
                  status: "available",
                },
                {
                  title: "Sherlock Holmes",
                  author: "Arthur Conan Doyle",
                  genre: "Mystery",
                  price: 349,
                  condition: "Good",
                  description:
                    "The adventures of the world's greatest detective.",
                  images: [
                    "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&q=80"
                  ],
                  status: "available",
                },
              ];
              setLoading(true);
              try {
                for (const book of sampleBooks) {
                  const bookRef = await apiCall('/books', {
                    method: 'POST',
                    body: JSON.stringify({
                      ...book,
                      sellerLocation: {
                        lat: 28.6139,
                        lng: 77.209,
                        address: "Connaught Place, New Delhi",
                      }
                    })
                  });

                  // Add a sample order for some books
                  if (Math.random() > 0.5) {
                    await apiCall('/orders', {
                      method: 'POST',
                      body: JSON.stringify({
                        bookId: bookRef.id || bookRef._id,
                        sellerId: bookRef.sellerId,
                        amount: book.price + 49,
                        paymentMethod: "visa"
                      })
                    });
                  }
                }
                toast.success(
                  "System database populated with premium dummy data.",
                );
                fetchAdminData();
              } catch (e) {
                toast.error("Seeding protocol failed.");
              } finally {
                setLoading(false);
              }
            }}
            className="px-6 py-2.5 bg-amber-100 text-amber-700 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-amber-200 transition-all"
          >
            Seed Sample Data
          </button>
          <button className="px-6 py-2.5 bg-stone-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-stone-800 transition-all">
            Generate Report
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          {
            label: "Total Curators",
            value: stats.totalUsers,
            icon: Users,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            label: "System Books",
            value: stats.totalBooks,
            icon: Package,
            color: "text-purple-600",
            bg: "bg-purple-50",
          },
          {
            label: "Gross Liquidity",
            value: formatPrice(stats.totalSales),
            icon: TrendingUp,
            color: "text-green-600",
            bg: "bg-green-50",
          },
          {
            label: "Awaiting Settlement",
            value: stats.activeOrders,
            icon: AlertTriangle,
            color: "text-red-500",
            bg: "bg-red-50",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white p-8 rounded-[2rem] border border-stone-200 shadow-xl shadow-stone-100 space-y-4 group hover:-translate-y-1 transition-all"
          >
            <div
              className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center",
                s.bg,
              )}
            >
              <s.icon className={cn("w-7 h-7", s.color)} />
            </div>
            <div>
              <p className="text-3xl font-bold text-stone-900 tracking-tighter">
                {s.value}
              </p>
              <p className="text-xs font-bold uppercase tracking-widest text-stone-400 mt-1">
                {s.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 bg-stone-900 p-10 rounded-[3rem] text-white shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-display text-2xl font-bold flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-stone-400" /> Sales Velocity
            </h3>
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
              7 Day Rolling Window
            </span>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#262626"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke="#525252"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#525252"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#171717",
                    border: "1px solid #404040",
                    borderRadius: "12px",
                  }}
                  cursor={{ fill: "#262626" }}
                />

                <Bar dataKey="sales" fill="#f5f5f5" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[3rem] border border-stone-200 flex flex-col justify-between shadow-xl">
          <div className="space-y-6">
            <h3 className="font-display text-2xl font-bold text-stone-900">
              System Integrity
            </h3>
            <div className="space-y-4">
              {[
                {
                  label: "Database Sync",
                  status: "Operational",
                  icon: CheckCircle2,
                  color: "text-green-500",
                },
                {
                  label: "Payment Gateway",
                  status: "High Volume",
                  icon: BarChart3,
                  color: "text-blue-500",
                },
                {
                  label: "AI Rec Engine",
                  status: "Optimal",
                  icon: Shield,
                  color: "text-purple-500",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="p-4 bg-stone-50 rounded-2xl border border-stone-100 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={cn("w-5 h-5", item.color)} />
                    <span className="text-sm font-bold text-stone-900">
                      {item.label}
                    </span>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-stone-400">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-8 mt-8 border-t border-stone-100 text-center">
            <Shield className="w-10 h-10 text-stone-900 mx-auto mb-4 opacity-10" />
            <p className="text-xs text-stone-400 italic">
              "Authority is only valuable when serving the preservation of
              knowledge."
            </p>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <section className="bg-white rounded-[3rem] border border-stone-200 overflow-hidden shadow-xl">
        <div className="p-8 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <h3 className="font-display text-2xl font-bold text-stone-900">
            Global Ledger
          </h3>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search orders..."
                className="pl-10 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-xs outline-none"
              />
            </div>
            <button className="p-2 border border-stone-200 rounded-xl hover:bg-white transition-all">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50/50 border-b border-stone-100">
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-stone-400">
                  Order Token
                </th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-stone-400">
                  Buyer Entity
                </th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-stone-400">
                  Amount
                </th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-stone-400">
                  Payment Status
                </th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-stone-400">
                  Lifecycle
                </th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <tr
                    key={order.id || order._id}
                    className="border-b border-stone-50 hover:bg-stone-50 transition-colors"
                  >
                    <td className="px-8 py-5 font-mono text-xs text-stone-500">
                      {order.id?.slice(0, 12) || order._id?.slice(0, 12)}...
                    </td>
                    <td className="px-8 py-5 font-bold text-stone-900">
                      {typeof order.buyerId === "object"
                        ? order.buyerId.displayName ||
                          order.buyerId.email ||
                          "Unknown User"
                        : order.buyerId?.slice(0, 8) || "Unknown"}
                    </td>
                    <td className="px-8 py-5 font-bold text-stone-900">
                      {formatPrice(order.amount)}
                    </td>
                    <td className="px-8 py-5">
                      <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-widest">
                        {order.paymentMethod}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span
                        className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                          order.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-600",
                        )}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-8 py-20 text-center text-stone-400 italic font-light"
                  >
                    The ledger is currently empty.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
