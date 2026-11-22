'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import logoImg from '../../../../public/logo.jpg';
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
  Phone,
  UploadCloud,
  ImageIcon,
  Sparkles,
  Key,
  Settings,
  Check,
  RefreshCw,
  X,
  Link as LinkIcon,
  Pencil,
  MapPin,
  MessageCircle,
  Save,
  RotateCcw
} from 'lucide-react';
import { compressImageToTarget, uploadToImgBB, CompressionResult, DEFAULT_IMGBB_API_KEY } from '@/lib/imageUpload';
import { useSettings, formatWhatsAppNumber, defaultSettings } from '@/context/SettingsContext';
import { db, collection, doc, addDoc, setDoc, deleteDoc, onSnapshot } from '@/lib/firebase';

interface Product {
  id: string | number;
  title: string;
  category: string;
  wood: string;
  price: number;
  image: string;
  description?: string | null;
}

interface Inquiry {
  id: string | number;
  name: string;
  phone: string;
  wood: string;
  description: string;
  status: string;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { settings, updateSettings, resetSettings } = useSettings();
  const [activeTab, setActiveTab] = useState<'products' | 'inquiries' | 'settings'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  // Settings State
  const [formWhatsApp, setFormWhatsApp] = useState(settings.whatsappNumber);
  const [formDisplayPhone, setFormDisplayPhone] = useState(settings.displayPhone);
  const [formAddressSi, setFormAddressSi] = useState(settings.addressSi);
  const [formAddressEn, setFormAddressEn] = useState(settings.addressEn);
  const [settingsSaveSuccess, setSettingsSaveSuccess] = useState(false);

  useEffect(() => {
    setFormWhatsApp(settings.whatsappNumber);
    setFormDisplayPhone(settings.displayPhone);
    setFormAddressSi(settings.addressSi);
    setFormAddressEn(settings.addressEn);
  }, [settings]);

  // Form states for new product
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('බිත්ති සැරසිලි හා අලංකාර නිර්මාණ');
  const [wood, setWood] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // ImgBB and Upload States
  const [imgbbApiKey, setImgbbApiKey] = useState(DEFAULT_IMGBB_API_KEY);
  const [showApiKeySettings, setShowApiKeySettings] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(DEFAULT_IMGBB_API_KEY);
  const [apiKeySavedSuccess, setApiKeySavedSuccess] = useState(false);

  const [imageInputMode, setImageInputMode] = useState<'upload' | 'url'>('upload');
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'compressing' | 'uploading' | 'success' | 'error'>('idle');
  const [compressionInfo, setCompressionInfo] = useState<{ originalKB: number; compressedKB: number } | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewDataUrl, setPreviewDataUrl] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);

  // Edit Modal States
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('බිත්ති සැරසිලි හා අලංකාර නිර්මාණ');
  const [editWood, setEditWood] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editImage, setEditImage] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const [editImageMode, setEditImageMode] = useState<'upload' | 'url'>('upload');
  const [editUploadStatus, setEditUploadStatus] = useState<'idle' | 'compressing' | 'uploading' | 'success' | 'error'>('idle');
  const [editCompressionInfo, setEditCompressionInfo] = useState<{ originalKB: number; compressedKB: number } | null>(null);
  const [editUploadError, setEditUploadError] = useState<string | null>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const initialDefaultProducts: Product[] = [
    {
      id: 1,
      title: "සාම්ප්‍රදායික කැටයම් බිත්ති සැරසිල්ල",
      category: "බිත්ති සැරසිලි හා අලංකාර නිර්මාණ",
      wood: "මහෝගනී සහ තේක්ක (Mahogany & Teak)",
      price: 14500,
      image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80",
      description: "නිවසේ හෝ කාර්යාලයේ අලංකාරය වැඩිකරන සියුම් සාම්ප්‍රදායික කැටයම් සහිත බිත්ති සැරසිල්ල."
    },
    {
      id: 2,
      title: "ස්වාභාවික දැව මුළුතැන්ගෙයි උපකරණ කට්ටලය",
      category: "ලී සෙල්ලම් බඩු හා මුළුතැන්ගෙයි උපකරණ",
      wood: "තේක්ක දැව (Natural Teak Wood)",
      price: 6800,
      image: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=800&q=80",
      description: "100% ස්වාභාවික දැවයෙන් නිමවූ, කල්පවතින හා විෂබීජ නාශක ගුණයෙන් යුතු මුළුතැන්ගෙයි හැඳි හා උපකරණ කට්ටලය."
    },
    {
      id: 3,
      title: "සුවිශේෂී කැටයම් කළ ඇත් රූපය හා මංජුසාව",
      category: "විශේෂිත ලී නිර්මාණ හා ඇණවුම් අනුව නිර්මාණ",
      wood: "කළුවර හා නැදුන් දැව (Ebony & Nadun Wood)",
      price: 18500,
      image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
      description: "ඔබගේ විශේෂ අවස්ථා හා ප්‍රභූ ත්‍යාග සඳහා ඔබේ අවශ්‍යතාව පරිදිම සකස් කරගත හැකි අද්විතීය ලී නිර්මාණයකි."
    }
  ];

  useEffect(() => {
    const isAuth = sessionStorage.getItem('ceylon_admin_auth');
    if (isAuth !== 'true') {
      router.replace('/admin/login');
      return;
    }

    // Load saved ImgBB API key if available
    const savedKey = localStorage.getItem('ceylon_imgbb_key') || DEFAULT_IMGBB_API_KEY;
    setImgbbApiKey(savedKey);
    setTempApiKey(savedKey);

    // Fast initial load from local storage
    try {
      const savedProds = localStorage.getItem('ceylon_products');
      if (savedProds) {
        setProducts(JSON.parse(savedProds));
      }
      const savedInqs = localStorage.getItem('ceylon_inquiries');
      if (savedInqs) {
        setInquiries(JSON.parse(savedInqs));
      }
    } catch (_) {}

    // Cloud Firestore Products real-time listener
    const unsubProducts = onSnapshot(
      collection(db, 'products'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: Product[] = [];
          snapshot.forEach((d) => {
            const data = d.data();
            list.push({
              id: d.id,
              title: data.title || '',
              category: data.category || '',
              wood: data.wood || '',
              price: Number(data.price) || 0,
              image: data.image || '',
              description: data.description || null,
            });
          });
          setProducts(list);
          try {
            localStorage.setItem('ceylon_products', JSON.stringify(list));
          } catch (_) {}
        } else {
          // Initialize first products in Firestore
          initialDefaultProducts.forEach((p) => {
            setDoc(doc(db, 'products', String(p.id)), p).catch((e) =>
              console.warn('Could not seed product to firestore:', e)
            );
          });
          setProducts(initialDefaultProducts);
        }
        setLoading(false);
      },
      (error) => {
        console.warn('Firestore products listener error:', error);
        setLoading(false);
      }
    );

    // Cloud Firestore Inquiries real-time listener
    const unsubInquiries = onSnapshot(
      collection(db, 'inquiries'),
      (snapshot) => {
        const list: Inquiry[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          list.push({
            id: d.id,
            name: data.name || '',
            phone: data.phone || '',
            wood: data.wood || '',
            description: data.description || '',
            status: data.status || 'NEW',
            createdAt: data.createdAt || new Date().toISOString(),
          });
        });
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setInquiries(list);
        try {
          localStorage.setItem('ceylon_inquiries', JSON.stringify(list));
        } catch (_) {}
      },
      (error) => {
        console.warn('Firestore inquiries listener error:', error);
      }
    );

    return () => {
      unsubProducts();
      unsubInquiries();
    };
  }, []);

  const handleSaveApiKey = (keyToSave: string) => {
    const cleanKey = keyToSave.trim();
    localStorage.setItem('ceylon_imgbb_key', cleanKey);
    setImgbbApiKey(cleanKey);
    setApiKeySavedSuccess(true);
    setTimeout(() => setApiKeySavedSuccess(false), 2500);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedWA = formatWhatsAppNumber(formWhatsApp);
    updateSettings({
      whatsappNumber: cleanedWA,
      displayPhone: formDisplayPhone.trim(),
      addressSi: formAddressSi.trim(),
      addressEn: formAddressEn.trim(),
    });
    setFormWhatsApp(cleanedWA);
    setSettingsSaveSuccess(true);
    setTimeout(() => setSettingsSaveSuccess(false), 3000);
  };

  const handleResetSettings = () => {
    if (confirm('සියලුම සම්බන්ධතා තොරතුරු මුල් පෙරනිමි අගයන්ට (Default) නැවත සැකසීමට අවශ්‍යද?')) {
      resetSettings();
      setFormWhatsApp(defaultSettings.whatsappNumber);
      setFormDisplayPhone(defaultSettings.displayPhone);
      setFormAddressSi(defaultSettings.addressSi);
      setFormAddressEn(defaultSettings.addressEn);
      setSettingsSaveSuccess(true);
      setTimeout(() => setSettingsSaveSuccess(false), 3000);
    }
  };

  // Image processing & upload
  const handleProcessAndUploadImage = async (file: File) => {
    if (!file) return;
    setUploadError(null);
    setUploadStatus('compressing');

    try {
      // Step 1: Compress to ~100KB
      const compResult: CompressionResult = await compressImageToTarget(file, 100);
      setCompressionInfo({
        originalKB: compResult.originalKB,
        compressedKB: compResult.compressedKB,
      });
      setPreviewDataUrl(compResult.dataUrl);

      // Step 2: Check API key
      const keyToUse = imgbbApiKey.trim() || tempApiKey.trim();
      if (!keyToUse) {
        setUploadStatus('error');
        setUploadError('ImgBB API Key එකක් ඇතුළත් කර නොමැත. කරුණාකර පහතින් API Key එක සකසන්න.');
        setShowApiKeySettings(true);
        return;
      }

      // Step 3: Upload to ImgBB
      setUploadStatus('uploading');
      const directUrl = await uploadToImgBB(compResult.blob, keyToUse);
      setImage(directUrl);
      setUploadStatus('success');
    } catch (err: unknown) {
      setUploadStatus('error');
      setUploadError(err instanceof Error ? err.message : 'පින්තූරය upload කිරීම අසාර්ථක විය.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleProcessAndUploadImage(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProcessAndUploadImage(e.dataTransfer.files[0]);
    }
  };

  const handleClearImage = () => {
    setImage('');
    setPreviewDataUrl('');
    setCompressionInfo(null);
    setUploadStatus('idle');
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      if (!image.trim()) {
        throw new Error('කරුණාකර නිර්මාණයේ පින්තූරය upload කරන්න හෝ Photo URL එකක් ඇතුළත් කරන්න.');
      }

      const productPayload = {
        title: title.trim(),
        category,
        wood: wood.trim(),
        price: parseFloat(price) || 0,
        image: image.trim(),
        description: description.trim(),
        createdAt: new Date().toISOString(),
      };

      // Add directly to Firebase Cloud Firestore
      const docRef = await addDoc(collection(db, 'products'), productPayload);

      // Optimistic local state update
      const newProduct: Product = {
        id: docRef.id,
        ...productPayload,
      };
      setProducts((prev) => [newProduct, ...prev.filter(p => p.id !== docRef.id)]);
      setFeedback({ type: 'success', text: 'නව නිර්මාණය සාර්ථකව Cloud Database (Firebase) වෙත එක් කෙරිණි!' });

      // Reset form
      setTitle('');
      setWood('');
      setPrice('');
      setDescription('');
      handleClearImage();
    } catch (err: unknown) {
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'දෝෂයක් සිදුවිය. කරුණාකර නැවත පරීක්ෂා කරන්න.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: string | number) => {
    if (!confirm('මෙම නිර්මාණය ඉවත් කිරීමට අවශ්‍ය බව විශ්වාසද?')) return;
    try {
      await deleteDoc(doc(db, 'products', String(id)));
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setFeedback({ type: 'success', text: 'නිර්මාණය Cloud Database එකෙන් සාර්ථකව ඉවත් කරන ලදී.' });
    } catch (err) {
      console.error('Error deleting from firestore:', err);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleStartEdit = (p: Product) => {
    setEditingProduct(p);
    setEditTitle(p.title);
    setEditCategory(p.category);
    setEditWood(p.wood);
    setEditPrice(p.price.toString());
    setEditImage(p.image);
    setEditDescription(p.description || '');
    setEditUploadStatus('idle');
    setEditCompressionInfo(null);
    setEditUploadError(null);
    setEditImageMode('upload');
  };

  const handleCloseEdit = () => {
    setEditingProduct(null);
    setEditUploadStatus('idle');
    setEditCompressionInfo(null);
    setEditUploadError(null);
  };

  const handleProcessAndUploadEditImage = async (file: File) => {
    if (!file) return;
    setEditUploadError(null);
    setEditUploadStatus('compressing');

    try {
      const compResult = await compressImageToTarget(file, 100);
      setEditCompressionInfo({
        originalKB: compResult.originalKB,
        compressedKB: compResult.compressedKB,
      });

      const keyToUse = imgbbApiKey.trim();
      if (!keyToUse) {
        setEditUploadStatus('error');
        setEditUploadError('ImgBB API Key එකක් ඇතුළත් කර නොමැත.');
        return;
      }

      setEditUploadStatus('uploading');
      const directUrl = await uploadToImgBB(compResult.blob, keyToUse);
      setEditImage(directUrl);
      setEditUploadStatus('success');
    } catch (err: unknown) {
      setEditUploadStatus('error');
      setEditUploadError(err instanceof Error ? err.message : 'පින්තූරය upload කිරීම අසාර්ථක විය.');
    }
  };

  const handleSaveEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setIsSavingEdit(true);

    try {
      if (!editImage.trim()) {
        throw new Error('කරුණාකර නිර්මාණයේ පින්තූරයක් ඇතුළත් කරන්න.');
      }

      const updatedFields = {
        title: editTitle.trim(),
        category: editCategory,
        wood: editWood.trim(),
        price: parseFloat(editPrice) || 0,
        image: editImage.trim(),
        description: editDescription.trim(),
      };

      // Save directly to Firebase Cloud Firestore
      await setDoc(doc(db, 'products', String(editingProduct.id)), updatedFields, { merge: true });

      const updatedProduct: Product = {
        ...editingProduct,
        ...updatedFields,
      };

      const updatedList = products.map((p) => (p.id === editingProduct.id ? updatedProduct : p));
      setProducts(updatedList);
      try {
        localStorage.setItem('ceylon_products', JSON.stringify(updatedList));
      } catch (_) {}

      setFeedback({
        type: 'success',
        text: `"${updatedProduct.title}" නිර්මාණය සාර්ථකව Cloud Database (Firebase) තුළ යාවත්කාලීන කරන ලදී!`,
      });
      handleCloseEdit();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'දෝෂයක් සිදුවිය.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleLogout = async () => {
    sessionStorage.removeItem('ceylon_admin_auth');
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-wood-50 text-wood-900 flex flex-col">
      
      {/* Top Admin Bar */}
      <header className="bg-wood-900 text-white border-b border-wood-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-amber-400/60 shadow-sm flex-shrink-0 bg-wood-950 ring-1 ring-amber-500/30">
              <Image
                src={logoImg}
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

          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* ImgBB Status & Key Button */}
            <button
              onClick={() => setShowApiKeySettings(!showApiKeySettings)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition border ${
                imgbbApiKey
                  ? 'bg-wood-800 hover:bg-wood-700 text-emerald-300 border-emerald-500/30'
                  : 'bg-amber-900/60 hover:bg-amber-800 text-amber-200 border-amber-500/50'
              }`}
              title="ImgBB API Key Settings"
            >
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">
                {imgbbApiKey ? 'ImgBB Connected' : 'Set ImgBB Key'}
              </span>
              <span className="sm:hidden">ImgBB</span>
            </button>

            <Link
              href="/"
              target="_blank"
              className="text-xs text-amber-200/80 hover:text-amber-300 flex items-center space-x-1 transition px-2 py-1.5"
            >
              <span className="hidden sm:inline">Website එක බලන්න</span>
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full space-y-6">
        
        {/* ImgBB API Key Modal / Dropdown Banner */}
        {showApiKeySettings && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-3xl p-5 shadow-lg relative transition-all">
            <button
              onClick={() => setShowApiKeySettings(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="max-w-2xl space-y-3">
              <div className="flex items-center space-x-2 text-wood-900 font-bold text-sm">
                <Key className="w-4 h-4 text-amber-600" />
                <span>ImgBB API Key එක සකසන්න (නොමිලේ ලබාගත හැක)</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                පින්තූර පරිගණකයෙන් හෝ දුරකථනයෙන් සෘජුවම 100KB වලට compress කර Upload කිරීමට ImgBB API Key එක භාවිතා වේ.
                ඔබට තවමත් Key එකක් නොමැති නම්,{' '}
                <a
                  href="https://api.imgbb.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-700 font-bold underline hover:text-amber-900 inline-flex items-center space-x-0.5"
                >
                  <span>api.imgbb.com වෙත ගොස් නොමිලේ තත්පර 30කින් ලබාගන්න</span>
                  <ExternalLink className="w-3 h-3 ml-0.5 inline" />
                </a>.
              </p>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                <input
                  type="text"
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  placeholder="ඔබේ 32-character ImgBB API Key එක මෙතැනට paste කරන්න..."
                  className="flex-grow border border-amber-300 bg-white p-2.5 rounded-xl text-xs font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleSaveApiKey(tempApiKey)}
                  className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition shadow flex items-center justify-center space-x-1.5"
                >
                  {apiKeySavedSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Saved!</span>
                    </>
                  ) : (
                    <span>Save Key</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Statistics & Tabs */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          
          {/* Tab buttons */}
          <div className="flex flex-wrap gap-2 bg-amber-100/60 p-1.5 rounded-2xl border border-amber-200">
            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center space-x-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
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
              className={`flex items-center space-x-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
                activeTab === 'inquiries'
                  ? 'bg-wood-900 text-amber-300 shadow-md'
                  : 'text-wood-800 hover:text-wood-950'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>පාරිභෝගික ඇණවුම් ({inquiries.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center space-x-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
                activeTab === 'settings'
                  ? 'bg-wood-900 text-amber-300 shadow-md'
                  : 'text-wood-800 hover:text-wood-950'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>සම්බන්ධතා & WhatsApp සැකසුම්</span>
            </button>
          </div>

          <div className="text-xs text-gray-500 font-medium flex items-center space-x-2">
            <span>Database: <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-semibold">🔥 Cloud Firestore Live</span></span>
            {imgbbApiKey && (
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-semibold">
                ● ImgBB Ready
              </span>
            )}
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-4 rounded-2xl flex items-center space-x-3 text-xs sm:text-sm ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border border-rose-200 text-rose-800'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
            )}
            <span className="font-medium">{feedback.text}</span>
          </div>
        )}

        {/* Tab 1: Products Management */}
        {activeTab === 'products' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Add New Product Form */}
            <div className="bg-white rounded-3xl shadow-md border border-amber-100 p-6 space-y-4">
              <div className="flex items-center space-x-2 border-b border-amber-100 pb-3">
                <PlusCircle className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-base text-wood-900">අලුත් නිර්මාණයක් ඇතුළත් කරන්න</h3>
              </div>

              <form onSubmit={handleAddProduct} className="space-y-4">
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
                    <option value="බිත්ති සැරසිලි හා අලංකාර නිර්මාණ">1. බිත්ති සැරසිලි හා අලංකාර නිර්මාණ (Wall Decor & Accessories)</option>
                    <option value="ලී සෙල්ලම් බඩු හා මුළුතැන්ගෙයි උපකරණ">2. ලී සෙල්ලම් බඩු හා මුළුතැන්ගෙයි උපකරණ (Wooden Toys & Kitchenware)</option>
                    <option value="විශේෂිත ලී නිර්මාණ හා ඇණවුම් අනුව නිර්මාණ">3. විශේෂිත ලී නිර්මාණ හා ඇණවුම් අනුව නිර්මාණ (Special Wooden Creations & Custom Orders)</option>
                    <option value="වෙනත් නිර්මාණ (Other)">වෙනත් නිර්මාණ (Other Creations)</option>
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

                {/* ADVANCED PHOTO UPLOAD / COMPRESSION SECTION */}
                <div className="space-y-2 pt-1 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-gray-700">
                      නිර්මාණයේ පින්තූරය (Product Photo)
                    </label>

                    {/* Mode Toggle */}
                    <div className="flex items-center space-x-1 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setImageInputMode('upload')}
                        className={`px-2 py-0.5 rounded-md font-medium transition ${
                          imageInputMode === 'upload'
                            ? 'bg-amber-100 text-amber-900 font-bold'
                            : 'text-gray-500 hover:text-gray-800'
                        }`}
                      >
                        Upload (100KB)
                      </button>
                      <span>|</span>
                      <button
                        type="button"
                        onClick={() => setImageInputMode('url')}
                        className={`px-2 py-0.5 rounded-md font-medium transition ${
                          imageInputMode === 'url'
                            ? 'bg-amber-100 text-amber-900 font-bold'
                            : 'text-gray-500 hover:text-gray-800'
                        }`}
                      >
                        URL එකක්
                      </button>
                    </div>
                  </div>

                  {imageInputMode === 'upload' ? (
                    <div className="space-y-2">
                      {/* Hidden File Input */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        onChange={handleFileChange}
                        className="hidden"
                      />

                      {/* If Image is not uploaded yet or during upload */}
                      {!image && uploadStatus !== 'success' ? (
                        <div
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          onClick={() => {
                            if (!imgbbApiKey) {
                              setShowApiKeySettings(true);
                            } else {
                              fileInputRef.current?.click();
                            }
                          }}
                          className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-2 ${
                            isDragging
                              ? 'border-amber-500 bg-amber-50/80 scale-[1.01]'
                              : 'border-amber-300/80 bg-amber-50/30 hover:bg-amber-50/60 hover:border-amber-400'
                          }`}
                        >
                          {uploadStatus === 'compressing' ? (
                            <div className="py-2 flex flex-col items-center space-y-1 text-amber-800">
                              <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
                              <span className="text-xs font-semibold">100KB වලට Compress කරමින් පවතී...</span>
                              {compressionInfo && (
                                <span className="text-[11px] text-gray-500">
                                  {compressionInfo.originalKB} KB ➡️ {compressionInfo.compressedKB} KB
                                </span>
                              )}
                            </div>
                          ) : uploadStatus === 'uploading' ? (
                            <div className="py-2 flex flex-col items-center space-y-1 text-amber-800">
                              <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
                              <span className="text-xs font-semibold">ImgBB වෙත Upload වෙමින් පවතී...</span>
                              <span className="text-[10px] text-gray-500">කරුණාකර මොහොතක් රැඳෙන්න</span>
                            </div>
                          ) : (
                            <>
                              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
                                <UploadCloud className="w-5 h-5" />
                              </div>
                              <div className="text-xs text-wood-900 font-semibold">
                                පින්තූරය තෝරන්න (Select Photo)
                              </div>
                              <p className="text-[10px] text-gray-500 max-w-[200px] leading-tight">
                                මෙතැන Click කරන්න හෝ පින්තූරය Drag කරන්න. Automatic ලෙස ~100KB වලට compress වී ImgBB වෙත upload වේ.
                              </p>
                              {!imgbbApiKey && (
                                <span className="inline-block mt-1 text-[10px] bg-amber-200/70 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                                  ⚠️ Click කර ImgBB Key එක සකසන්න
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      ) : (
                        /* Uploaded Success Preview Box */
                        <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-3 flex items-center space-x-3">
                          <img
                            src={previewDataUrl || image}
                            alt="Uploaded Preview"
                            className="w-16 h-16 object-cover rounded-xl border border-amber-300 flex-shrink-0 shadow-sm"
                          />
                          <div className="flex-grow space-y-1 min-w-0">
                            <div className="flex items-center space-x-1 text-emerald-700 font-semibold text-xs">
                              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                              <span>සාර්ථකව Upload විය!</span>
                            </div>
                            {compressionInfo && (
                              <div className="text-[10px] text-gray-600 flex items-center space-x-1">
                                <Sparkles className="w-3 h-3 text-amber-600 flex-shrink-0" />
                                <span>{compressionInfo.originalKB} KB ➡️ <strong className="text-wood-900">{compressionInfo.compressedKB} KB</strong> (Compress විය)</span>
                              </div>
                            )}
                            <div className="text-[10px] text-amber-800 truncate" title={image}>
                              {image}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleClearImage}
                            className="text-gray-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition flex-shrink-0"
                            title="පින්තූරය ඉවත් කරන්න"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      {/* Upload Error Message */}
                      {uploadError && (
                        <div className="text-[11px] text-rose-700 bg-rose-50 border border-rose-200 p-2 rounded-xl flex items-start space-x-1.5">
                          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600 mt-0.5" />
                          <div className="flex-grow">
                            <span>{uploadError}</span>
                            {!imgbbApiKey && (
                              <button
                                type="button"
                                onClick={() => setShowApiKeySettings(true)}
                                className="block mt-1 text-amber-800 underline font-bold"
                              >
                                ImgBB Key එක මෙතැනින් ඇතුළත් කරන්න
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Manual URL input fallback */
                    <div>
                      <input
                        type="url"
                        value={image}
                        onChange={(e) => {
                          setImage(e.target.value);
                          setPreviewDataUrl(e.target.value);
                        }}
                        placeholder="https://..."
                        className="w-full border border-gray-200 p-2.5 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono"
                      />
                      {image && (
                        <div className="mt-2 flex items-center space-x-2">
                          <img
                            src={image}
                            alt="URL Preview"
                            className="w-12 h-12 object-cover rounded-lg border border-amber-200"
                            onError={(e) => ((e.target as HTMLElement).style.display = 'none')}
                          />
                          <span className="text-[11px] text-emerald-700">URL එක සක්‍රියයි</span>
                        </div>
                      )}
                    </div>
                  )}
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
                  disabled={isSubmitting || uploadStatus === 'compressing' || uploadStatus === 'uploading'}
                  className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-xl transition shadow text-xs flex items-center justify-center space-x-1.5 disabled:opacity-50 cursor-pointer"
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
                  <span>පූරණය වෙමින් පවතී...</span>
                </div>
              ) : products.length === 0 ? (
                <p className="text-gray-500 text-center py-12">
                  තවමත් කිසිදු නිර්මාණයක් Catalog එකට ඇතුළත් කර නොමැත.
                </p>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-gray-100">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-wood-50 text-wood-900 uppercase font-semibold">
                      <tr>
                        <th className="p-3">පින්තූරය</th>
                        <th className="p-3">නම</th>
                        <th className="p-3">කාණ්ඩය</th>
                        <th className="p-3">දැව වර්ගය</th>
                        <th className="p-3">මිල</th>
                        <th className="p-3 text-right">ක්‍රියාමාර්ග</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {products.map((p) => (
                        <tr key={p.id} className="hover:bg-amber-50/40 transition">
                          <td className="p-3">
                            <img
                              src={p.image}
                              alt={p.title}
                              className="w-10 h-10 object-cover rounded-lg border border-amber-100 shadow-sm"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80';
                              }}
                            />
                          </td>
                          <td className="p-3 font-semibold text-wood-900">{p.title}</td>
                          <td className="p-3 text-gray-600">{p.category}</td>
                          <td className="p-3 text-amber-800 font-medium">{p.wood}</td>
                          <td className="p-3 font-bold text-amber-700">රු. {p.price.toLocaleString()}</td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end space-x-1">
                              <button
                                onClick={() => handleStartEdit(p)}
                                className="text-gray-400 hover:text-amber-600 p-1.5 rounded-lg hover:bg-amber-50 transition"
                                title="නිර්මාණය සංස්කරණය කරන්න (Edit)"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.id)}
                                className="text-gray-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition"
                                title="නිර්මාණය ඉවත් කරන්න (Delete)"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
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

        {/* Tab 2: Inquiries Management */}
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

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-amber-100 space-y-6">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-100 pb-5">
                <div>
                  <div className="flex items-center space-x-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
                      <Settings className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-wood-900 brand-font">
                      සම්බන්ධතා සහ WhatsApp සැකසුම් (Contact & WhatsApp Settings)
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1.5 leading-relaxed">
                    වෙබ් අඩවියේ ඇති සියලුම WhatsApp ඇණවුම් බොත්තම්, Footer එකේ දුරකථන අංකය සහ ප්‍රදර්ශනාගාර ලිපිනයන් මෙතැනින් එකවර වෙනස් කළ හැක.
                  </p>
                </div>

                {settingsSaveSuccess && (
                  <div className="inline-flex items-center space-x-1.5 bg-emerald-50 text-emerald-800 border border-emerald-300 px-4 py-2 rounded-xl text-xs font-semibold shadow-sm animate-pulse">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>සැකසුම් සාර්ථකව සුරැකිණි! (Saved!)</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Form Column */}
                <form onSubmit={handleSaveSettings} className="lg:col-span-7 space-y-5">
                  
                  {/* WhatsApp Number */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-wood-900 uppercase tracking-wider">
                      WhatsApp දුරකථන අංකය (Customer WhatsApp Order Number)
                    </label>
                    <p className="text-[11px] text-gray-500">
                      පාරිභෝගිකයින් &quot;ඇණවුම් කරන්න&quot;, &quot;WhatsApp හරහා අමතන්න&quot;, &quot;මිල ගණන් විමසන්න&quot; ක්ලික් කළ විට පණිවිඩ ලැබෙන WhatsApp අංකය.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 pt-1">
                      <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-600">
                          <MessageCircle className="w-4 h-4 fill-current" />
                        </div>
                        <input
                          type="text"
                          required
                          value={formWhatsApp}
                          onChange={(e) => setFormWhatsApp(e.target.value)}
                          placeholder="උදා: 0771234567 හෝ 94771234567"
                          className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none bg-wood-50/20"
                        />
                      </div>
                      
                      {/* Test WhatsApp Link Button */}
                      <a
                        href={`https://wa.me/${formatWhatsAppNumber(formWhatsApp)}?text=${encodeURIComponent('ආයුබෝවන් Ceylon Wood Creations! මෙය පරීක්ෂණ පණිවිඩයකි (Test Message).')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition flex-shrink-0 cursor-pointer"
                        title="ඔබේ WhatsApp ගිණුමට නිවැරදිව පණිවිඩයක් යැවිය හැකිදැයි පරීක්ෂා කරන්න"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>WhatsApp පරීක්ෂා කරන්න (Test)</span>
                      </a>
                    </div>
                    <span className="text-[10px] text-gray-500 block">
                      ක්‍රියාකාරී ජාත්‍යන්තර අංකය: <code className="text-emerald-700 font-bold font-mono">+{formatWhatsAppNumber(formWhatsApp)}</code> (ලංකාවේ 94 කේතය ස්වයංක්‍රීයව එක් කෙරේ)
                    </span>
                  </div>

                  {/* Display Phone in Footer */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-wood-900 uppercase tracking-wider">
                      Footer එකේ දිස්වන දුරකථන අංකය (Display Phone for Footer)
                    </label>
                    <p className="text-[11px] text-gray-500">
                      වෙබ් අඩවියේ පතුලේ (Footer) &quot;සම්බන්ධ වන්න&quot; කොටසේ ප්‍රදර්ශනය වන දුරකථන අංකය.
                    </p>
                    <div className="relative pt-1">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-amber-600">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={formDisplayPhone}
                        onChange={(e) => setFormDisplayPhone(e.target.value)}
                        placeholder="උදා: +94 70 000 0000 (WhatsApp / Voice)"
                        className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none bg-wood-50/20"
                      />
                    </div>
                  </div>

                  {/* Address Sinhala */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-wood-900 uppercase tracking-wider">
                      ලිපිනය - සිංහල (Showroom Address - Sinhala)
                    </label>
                    <p className="text-[11px] text-gray-500">
                      සිංහල භාෂාව තෝරා ඇති විට Footer එකේ දිස්වන ප්‍රදර්ශනාගාර ලිපිනය.
                    </p>
                    <div className="relative pt-1">
                      <div className="absolute top-3.5 left-3.5 pointer-events-none text-amber-600">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <textarea
                        rows={2}
                        required
                        value={formAddressSi}
                        onChange={(e) => setFormAddressSi(e.target.value)}
                        placeholder="උදා: නුවර පාර, මොරටුව / ගාල්ල, ශ්‍රී ලංකාව"
                        className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none bg-wood-50/20"
                      />
                    </div>
                  </div>

                  {/* Address English */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-wood-900 uppercase tracking-wider">
                      Address - English (ඉංග්‍රීසි භාෂාවෙන් දිස්වන ලිපිනය)
                    </label>
                    <p className="text-[11px] text-gray-500">
                      ඉංග්‍රීසි භාෂාව තෝරා ඇති විට Footer එකේ දිස්වන ප්‍රදර්ශනාගාර ලිපිනය.
                    </p>
                    <div className="relative pt-1">
                      <div className="absolute top-3.5 left-3.5 pointer-events-none text-amber-600">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <textarea
                        rows={2}
                        required
                        value={formAddressEn}
                        onChange={(e) => setFormAddressEn(e.target.value)}
                        placeholder="e.g. Kandy Road, Moratuwa / Galle, Sri Lanka"
                        className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none bg-wood-50/20"
                      />
                    </div>
                  </div>

                  {/* Submit / Reset Actions */}
                  <div className="flex items-center space-x-3 pt-3 border-t border-gray-100">
                    <button
                      type="submit"
                      className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-6 py-3 rounded-xl text-xs sm:text-sm transition shadow-md hover:shadow-lg flex items-center space-x-2 cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>සැකසුම් සුරකින්න (Save Settings)</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleResetSettings}
                      className="text-gray-500 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 font-semibold px-4 py-3 rounded-xl text-xs sm:text-sm transition flex items-center space-x-1.5 cursor-pointer"
                      title="මුල් පෙරනිමි අගයන්ට නැවත සකසන්න"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>මුල් තත්ත්වයට (Reset)</span>
                    </button>
                  </div>

                </form>

                {/* Live Preview / Impact Explainer Column */}
                <div className="lg:col-span-5 bg-gradient-to-b from-wood-50 to-amber-50/50 rounded-2xl p-5 border border-amber-200/80 space-y-4">
                  <div className="flex items-center space-x-2 text-wood-900 font-bold text-sm border-b border-amber-200 pb-2.5">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>මෙම සැකසුම් යෙදෙන ස්ථාන (Live Preview)</span>
                  </div>

                  <div className="space-y-3 text-xs">
                    
                    {/* Hero Preview */}
                    <div className="bg-white p-3 rounded-xl border border-amber-100 shadow-sm space-y-1">
                      <div className="flex items-center justify-between text-gray-500 font-semibold text-[11px]">
                        <span>1. මුල් පිටුවේ (Hero Section)</span>
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-semibold">Active</span>
                      </div>
                      <div className="flex items-center space-x-1.5 text-wood-900 pt-0.5">
                        <span className="bg-emerald-600 text-white px-2 py-0.5 rounded text-[10px] font-semibold flex items-center space-x-1">
                          <MessageCircle className="w-3 h-3 fill-current inline" />
                          <span>WhatsApp හරහා අමතන්න</span>
                        </span>
                        <span className="text-gray-400">➡️</span>
                        <span className="font-mono text-[11px] text-emerald-800 truncate">
                          wa.me/{formatWhatsAppNumber(formWhatsApp)}
                        </span>
                      </div>
                    </div>

                    {/* Catalog Preview */}
                    <div className="bg-white p-3 rounded-xl border border-amber-100 shadow-sm space-y-1">
                      <div className="flex items-center justify-between text-gray-500 font-semibold text-[11px]">
                        <span>2. නිර්මාණ එකතුව (Catalog Items)</span>
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-semibold">Active</span>
                      </div>
                      <div className="flex items-center space-x-1.5 text-wood-900 pt-0.5">
                        <span className="bg-emerald-600 text-white px-2 py-0.5 rounded text-[10px] font-semibold flex items-center space-x-1">
                          <MessageCircle className="w-3 h-3 fill-current inline" />
                          <span>ඇණවුම් කරන්න</span>
                        </span>
                        <span className="text-gray-400">➡️</span>
                        <span className="font-mono text-[11px] text-emerald-800 truncate">
                          wa.me/{formatWhatsAppNumber(formWhatsApp)}?text=...
                        </span>
                      </div>
                    </div>

                    {/* Custom Orders Preview */}
                    <div className="bg-white p-3 rounded-xl border border-amber-100 shadow-sm space-y-1">
                      <div className="flex items-center justify-between text-gray-500 font-semibold text-[11px]">
                        <span>3. විශේෂ ඇණවුම් (Custom Orders)</span>
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-semibold">Active</span>
                      </div>
                      <div className="flex items-center space-x-1.5 text-wood-900 pt-0.5">
                        <span className="bg-wood-800 text-white px-2 py-0.5 rounded text-[10px] font-semibold flex items-center space-x-1">
                          <MessageCircle className="w-3 h-3 fill-current text-emerald-400 inline" />
                          <span>WhatsApp හරහා මිල ගණන් විමසන්න</span>
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500">
                        පාරිභෝගිකයාගේ නම, දුරකථන අංකය සහ දැව වර්ගය සමඟ පණිවිඩය ලැබෙන්නේ ඉහත WhatsApp අංකයටයි.
                      </p>
                    </div>

                    {/* Footer Preview */}
                    <div className="bg-white p-3 rounded-xl border border-amber-100 shadow-sm space-y-1.5">
                      <div className="flex items-center justify-between text-gray-500 font-semibold text-[11px]">
                        <span>4. Footer (සම්බන්ධ වන්න කොටස)</span>
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-semibold">Active</span>
                      </div>
                      <div className="space-y-1 pt-0.5">
                        <div className="flex items-center space-x-1.5 text-[11px] text-gray-700">
                          <Phone className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                          <span className="font-medium">{formDisplayPhone || 'දුරකථන අංකයක් නැත'}</span>
                        </div>
                        <div className="flex items-start space-x-1.5 text-[11px] text-gray-700">
                          <MapPin className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                          <span className="leading-tight">{formAddressSi || 'ලිපිනයක් නැත'}</span>
                        </div>
                      </div>
                    </div>

                  </div>

                  <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-emerald-900 text-xs flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>ඔබ Save Settings ක්ලික් කළ වහාම මෙම තොරතුරු සියලුම පිටුවල සජීවීව (Live) ක්‍රියාත්මක වේ.</span>
                  </div>

                </div>

              </div>

            </div>
          </div>
        )}

        {/* Edit Product Modal */}
        {editingProduct && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl shadow-2xl border border-amber-200 max-w-lg w-full p-6 space-y-5 my-8 relative">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-amber-100 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
                    <Pencil className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-wood-900">නිර්මාණය සංස්කරණය කරන්න (Edit)</h3>
                    <span className="text-[11px] text-gray-500">ID: #{editingProduct.id}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCloseEdit}
                  className="text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100 transition"
                  title="වසන්න"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleSaveEditProduct} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    නම (Title)
                  </label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full border border-gray-200 p-2.5 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    කාණ්ඩය (Category)
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full border border-gray-200 p-2.5 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="බිත්ති සැරසිලි හා අලංකාර නිර්මාණ">1. බිත්ති සැරසිලි හා අලංකාර නිර්මාණ (Wall Decor & Accessories)</option>
                    <option value="ලී සෙල්ලම් බඩු හා මුළුතැන්ගෙයි උපකරණ">2. ලී සෙල්ලම් බඩු හා මුළුතැන්ගෙයි උපකරණ (Wooden Toys & Kitchenware)</option>
                    <option value="විශේෂිත ලී නිර්මාණ හා ඇණවුම් අනුව නිර්මාණ">3. විශේෂිත ලී නිර්මාණ හා ඇණවුම් අනුව නිර්මාණ (Special Wooden Creations & Custom Orders)</option>
                    <option value="වෙනත් නිර්මාණ (Other)">වෙනත් නිර්මාණ (Other Creations)</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      දැව වර්ගය (Wood Type)
                    </label>
                    <input
                      type="text"
                      required
                      value={editWood}
                      onChange={(e) => setEditWood(e.target.value)}
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
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      className="w-full border border-gray-200 p-2.5 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Photo Edit Section */}
                <div className="space-y-2 pt-1 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-gray-700">
                      පින්තූරය (Photo)
                    </label>
                    <div className="flex items-center space-x-1 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setEditImageMode('upload')}
                        className={`px-2 py-0.5 rounded-md font-medium transition ${
                          editImageMode === 'upload'
                            ? 'bg-amber-100 text-amber-900 font-bold'
                            : 'text-gray-500 hover:text-gray-800'
                        }`}
                      >
                        Upload (100KB)
                      </button>
                      <span>|</span>
                      <button
                        type="button"
                        onClick={() => setEditImageMode('url')}
                        className={`px-2 py-0.5 rounded-md font-medium transition ${
                          editImageMode === 'url'
                            ? 'bg-amber-100 text-amber-900 font-bold'
                            : 'text-gray-500 hover:text-gray-800'
                        }`}
                      >
                        URL
                      </button>
                    </div>
                  </div>

                  {/* Current Image Preview & Change Box */}
                  <div className="flex items-center space-x-3 bg-amber-50/40 p-2.5 rounded-2xl border border-amber-200">
                    <img
                      src={editImage || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80'}
                      alt="Current Preview"
                      className="w-14 h-14 object-cover rounded-xl border border-amber-300 flex-shrink-0 shadow-sm"
                    />
                    <div className="flex-grow min-w-0 space-y-1">
                      {editUploadStatus === 'compressing' ? (
                        <div className="flex items-center space-x-1.5 text-xs text-amber-800">
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                          <span>100KB වලට Compress කරමින්...</span>
                        </div>
                      ) : editUploadStatus === 'uploading' ? (
                        <div className="flex items-center space-x-1.5 text-xs text-amber-800">
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                          <span>ImgBB වෙත Upload වෙමින්...</span>
                        </div>
                      ) : editUploadStatus === 'success' ? (
                        <div className="space-y-0.5">
                          <div className="flex items-center space-x-1 text-emerald-700 font-semibold text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>නව පින්තූරය Upload විය!</span>
                          </div>
                          {editCompressionInfo && (
                            <div className="text-[10px] text-gray-500">
                              {editCompressionInfo.originalKB} KB ➡️ {editCompressionInfo.compressedKB} KB
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-700 block truncate" title={editImage}>
                          දැනට ඇති පින්තූරය
                        </span>
                      )}

                      {editImageMode === 'upload' ? (
                        <div>
                          <input
                            ref={editFileInputRef}
                            type="file"
                            accept="image/png, image/jpeg, image/webp"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleProcessAndUploadEditImage(e.target.files[0]);
                              }
                            }}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => editFileInputRef.current?.click()}
                            disabled={editUploadStatus === 'compressing' || editUploadStatus === 'uploading'}
                            className="inline-flex items-center space-x-1 bg-amber-600 hover:bg-amber-500 text-white px-2.5 py-1 rounded-lg text-[11px] font-semibold transition shadow-sm disabled:opacity-50 cursor-pointer"
                          >
                            <UploadCloud className="w-3 h-3" />
                            <span>නව පින්තූරයක් තෝරන්න</span>
                          </button>
                        </div>
                      ) : (
                        <input
                          type="url"
                          value={editImage}
                          onChange={(e) => setEditImage(e.target.value)}
                          placeholder="https://..."
                          className="w-full border border-gray-200 p-1.5 rounded-lg text-xs font-mono"
                        />
                      )}
                    </div>
                  </div>

                  {editUploadError && (
                    <div className="text-[11px] text-rose-700 bg-rose-50 border border-rose-200 p-2 rounded-xl flex items-center space-x-1.5">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-rose-600" />
                      <span>{editUploadError}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    විස්තර (Description - Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="කැටයම පිළිබඳ කෙටි හැඳින්වීමක්..."
                    className="w-full border border-gray-200 p-2.5 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={handleCloseEdit}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition border border-gray-200 cursor-pointer"
                  >
                    අවලංගු කරන්න (Cancel)
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingEdit || editUploadStatus === 'compressing' || editUploadStatus === 'uploading'}
                    className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition shadow flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    {isSavingEdit ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>වෙනස්කම් සුරකින්න (Save Changes)</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

      </main>
    </div>
  );
}
