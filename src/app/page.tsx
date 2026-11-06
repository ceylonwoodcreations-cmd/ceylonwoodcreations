import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import ProductCatalog from '@/components/ProductCatalog';
import { ProductData } from '@/components/ProductCard';
import CustomOrderSection from '@/components/CustomOrderSection';
import Footer from '@/components/Footer';

const defaultProducts: ProductData[] = [
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

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <ProductCatalog initialProducts={defaultProducts} />
        <CustomOrderSection />
      </main>
      <Footer />
    </>
  );
}
