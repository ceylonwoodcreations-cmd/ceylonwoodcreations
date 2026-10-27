'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Package, 
  MessageSquare, 
  PlusCircle, 
  Trash2, 
  LogOut, 
  ExternalLink, 
  Loader2, 
  Trees, 
  CheckCircle2, 
  AlertCircle,
  Phone
} from 'lucide-react';

interface Product {
  id: number;
  title: string;
  category: string;
  wood: string;
  price: number;
  image: string;
  description?: string | null;
}

interface Inquiry {
  id: number;
  name: string;
  phone: string;
  wood: string;
  description: string;
  status: string;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'products' | 'inquiries'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states for new product
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('පිළිම සහ ප්‍රතිමා');
  const [wood, setWood] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=800&q=80');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, inqRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/inquiries'),
      ]);

      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProducts(prodData);
      }
      if (inqRes.ok) {
        const inqData = await inqRes.json();
        setInquiries(inqData);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          category,
          wood,
          price: parseFloat(price),
          image,
          description,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to add product');
      }

      const newProduct = await res.json();
      setProducts([newProduct, ...products]);
      setFeedback({ type: 'success', text: 'නව නිර්මාණය සාර්ථකව Catalog එකට එක් කෙරිණි!' });

      // Reset form
      setTitle('');
      setWood('');
      setPrice('');
      setDescription('');
    } catch (err: unknown) {
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'දෝෂයක් සිදුවිය. කරුණාකර නැවත පරීක්ෂා කරන්න.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('මෙම නිර්මාණය ඉවත් කිරීමට අවශ්‍ය බව විශ්වාසද?')) return;

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setProducts(products.filter((p) => p.id !== id));
      } else {
        alert('ඉවත් කිරීම අසාර්ථක විය.');
      }
    } catch (err) {
      alert('දෝෂයක් සිදුවිය.');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-wood-50 text-wood-900 flex flex-col">
      
      {/* Top Admin Bar */}
      <header className="bg-wood-900 text-white border-b border-wood-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-amber-400/60 shadow-sm flex-shrink-0 bg-wood-950 ring-1 ring-amber-500/30">
              <Image
                src="/logo.jpg"
                alt="Ceylon Wood Creations"
                width={40}
                height={40}
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div>
              <span className="font-bold text-amber-300 brand-font">Ceylon Wood Creations</span>
              <span className="text-[10px] text-amber-200/60 block uppercase tracking-widest">Admin Control Center</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/"
              target="_blank"
              className="text-xs text-amber-200/80 hover:text-amber-300 flex items-center space-x-1 transition"
            >
              <span>Website එක බලන්න</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={handleLogout}
              className="bg-rose-900/60 hover:bg-rose-900 text-rose-200 border border-rose-700/50 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full space-y-8">
        
        {/* Statistics & Tabs */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          
          {/* Tab buttons */}
          <div className="flex space-x-2 bg-amber-100/60 p-1 rounded-2xl border border-amber-200">
            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
                activeTab === 'products'
                  ? 'bg-wood-900 text-amber-300 shadow-md'
                  : 'text-wood-800 hover:text-wood-950'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>නිර්මාණ කළමනාකරණය ({products.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('inquiries')}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
                activeTab === 'inquiries'
                  ? 'bg-wood-900 text-amber-300 shadow-md'
                  : 'text-wood-800 hover:text-wood-950'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>පාරිභෝගික ඇණවුම් ({inquiries.length})</span>
            </button>
          </div>

          <div className="text-xs text-gray-500 font-medium">
            Database Status: <span className="text-emerald-600 font-semibold">● Connected (SQLite)</span>
          </div>
        </div>

        {/* Tab 1: Products Management */}
        {activeTab === 'products' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Add Product Form */}
            <div className="bg-white p-6 rounded-3xl shadow-md border border-amber-100 space-y-5 h-fit">
              <div className="flex items-center space-x-2 border-b border-gray-100 pb-3">
                <PlusCircle className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-base text-wood-900">අලුත් නිර්මාණයක් ඇතුළත් කරන්න</h3>
              </div>

              {feedback && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center space-x-2 ${
                    feedback.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {feedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  )}
                  <span>{feedback.text}</span>
                </div>
              )}

              <form onSubmit={handleAddProduct} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    නම (Title)
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="උදා: සඳකඩපහණ බිත්ති සැරසිල්ල"
                    className="w-full border border-gray-200 p-2.5 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    කාණ්ඩය (Category)
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full border border-gray-200 p-2.5 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="පිළිම සහ ප්‍රතිමා">පිළිම සහ ප්‍රතිමා</option>
                    <option value="බිත්ති සැරසිලි">බිත්ති සැරසිලි</option>
                    <option value="සිහිවටන (Souvenirs)">සිහිවටන (Souvenirs)</option>
                    <option value="වෙනත් නිර්මාණ (Other)">වෙනත් නිර්මාණ (Other)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    දැව වර්ගය (Wood Type)
                  </label>
                  <input
                    type="text"
                    required
                    value={wood}
                    onChange={(e) => setWood(e.target.value)}
                    placeholder="උදා: තේක්ක දැව (Teak Wood)"
                    className="w-full border border-gray-200 p-2.5 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    මිල (රු. / LKR)
                  </label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="උදා: 15000"
                    className="w-full border border-gray-200 p-2.5 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Photo URL
                  </label>
                  <input
                    type="url"
                    required
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className="w-full border border-gray-200 p-2.5 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    විස්තර (Description - Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="කැටයම පිළිබඳ කෙටි හැඳින්වීමක්..."
                    className="w-full border border-gray-200 p-2.5 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-xl transition shadow text-xs flex items-center justify-center space-x-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <PlusCircle className="w-4 h-4" />
                      <span>Catalog එකට ඇතුළත් කරන්න</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Existing Products Table */}
            <div className="lg:col-span-2 bg-white rounded-3xl shadow-md border border-amber-100 p-6 space-y-4">
              <h3 className="font-bold text-base text-wood-900">
                දැනට පවතින නිර්මාණ එකතුව ({products.length})
              </h3>

              {loading ? (
                <div className="text-center py-12 text-gray-400">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                  <span>දත්ත පූරණය වෙමින් පවතී...</span>
                </div>
              ) : products.length === 0 ? (
                <p className="text-gray-500 text-center py-10">දැනට නිර්මාණ කිසිවක් නැත.</p>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-gray-100">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-wood-50 text-wood-900 uppercase font-semibold">
                      <tr>
                        <th className="p-3">නිර්මාණය</th>
                        <th className="p-3">කාණ්ඩය</th>
                        <th className="p-3">දැව වර්ගය</th>
                        <th className="p-3">මිල</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {products.map((p) => (
                        <tr key={p.id} className="hover:bg-amber-50/40 transition">
                          <td className="p-3 flex items-center space-x-3">
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 border">
                              <Image
                                src={p.image}
                                alt={p.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <span className="font-semibold text-wood-950">{p.title}</span>
                          </td>
                          <td className="p-3 text-gray-600">{p.category}</td>
                          <td className="p-3 text-amber-800 font-medium">{p.wood}</td>
                          <td className="p-3 font-bold text-wood-900">
                            රු. {p.price.toLocaleString()}
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="text-rose-600 hover:text-rose-800 p-1.5 hover:bg-rose-50 rounded-lg transition"
                              title="Delete Product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

        {/* Tab 2: Custom Inquiries */}
        {activeTab === 'inquiries' && (
          <div className="bg-white rounded-3xl shadow-md border border-amber-100 p-6 space-y-4">
            <h3 className="font-bold text-base text-wood-900">
              පාරිභෝගික විශේෂ ඉල්ලීම් හා විමසීම් (Inquiries)
            </h3>

            {loading ? (
              <div className="text-center py-12 text-gray-400">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                <span>පූරණය වෙමින් පවතී...</span>
              </div>
            ) : inquiries.length === 0 ? (
              <p className="text-gray-500 text-center py-12">
                තවමත් කිසිදු විශේෂ ඇණවුම් විමසීමක් ලැබී නැත.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-gray-100">
                <table className="w-full text-left text-xs">
                  <thead className="bg-wood-50 text-wood-900 uppercase font-semibold">
                    <tr>
                      <th className="p-3">පාරිභෝගිකයා</th>
                      <th className="p-3">දුරකථන අංකය</th>
                      <th className="p-3">දැව වර්ගය</th>
                      <th className="p-3">විස්තරය (Requirements)</th>
                      <th className="p-3">දිනය</th>
                      <th className="p-3 text-right">WhatsApp සම්බන්ධය</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {inquiries.map((inq) => {
                      const waReplyText = `ආයුබෝවන් ${inq.name}! ඔබ Ceylon Wood Creations වෙබ් අඩවිය හරහා කළ විශේෂ ලී කැටයම් විමසීම සම්බන්ධයෙනි.`;
                      const cleanPhone = inq.phone.replace(/[^0-9]/g, '');
                      const formattedPhone = cleanPhone.startsWith('0')
                        ? `94${cleanPhone.substring(1)}`
                        : cleanPhone;

                      return (
                        <tr key={inq.id} className="hover:bg-amber-50/40 transition">
                          <td className="p-3 font-semibold text-wood-900">{inq.name}</td>
                          <td className="p-3 font-mono text-gray-700">{inq.phone}</td>
                          <td className="p-3 text-amber-800 font-medium">{inq.wood}</td>
                          <td className="p-3 max-w-xs text-gray-600 truncate" title={inq.description}>
                            {inq.description}
                          </td>
                          <td className="p-3 text-gray-500">
                            {new Date(inq.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-3 text-right">
                            <a
                              href={`https://wa.me/${formattedPhone}?text=${encodeURIComponent(waReplyText)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center space-x-1 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg font-semibold transition"
                            >
                              <Phone className="w-3 h-3" />
                              <span>පිළිතුරු දෙන්න</span>
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
