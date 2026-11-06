import { prisma } from '@/lib/prisma';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import ProductCatalog from '@/components/ProductCatalog';
import { ProductData } from '@/components/ProductCard';
import CustomOrderSection from '@/components/CustomOrderSection';
import Footer from '@/components/Footer';

// Revalidate every 60 seconds or on demand
export const revalidate = 60;

const defaultProducts: ProductData[] = [
  {
    id: 1,
    title: "සමාධි බුද්ධ ප්‍රතිමාව (අඟල් 18)",
    category: "පිළිම සහ ප්‍රතිමා",
    wood: "තේක්ක දැව (Teak Wood)",
    price: 18500,
    image: "https://images.unsplash.com/photo-1545063914-a1a6ec821c88?auto=format&fit=crop&w=800&q=80",
    description: "තේක්ක දැවයෙන් නිමවන ලද සාමකාමී සමාධි බුදු පිළිමය."
  },
  {
    id: 2,
    title: "සාම්ප්‍රදායික සඳකඩපහණ බිත්ති සැරසිල්ල",
    category: "බිත්ති සැරසිලි",
    wood: "මහෝගනී දැව (Mahogany)",
    price: 14000,
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80",
    description: "අනුරාධපුර සම්ප්‍රදායේ සියුම් කැටයම් සහිත සඳකඩපහණ බිත්ති සැරසිල්ල."
  },
  {
    id: 3,
    title: "කැටයම් කළ ඇත් රූපය (Ceylon Elephant)",
    category: "සිහිවටන (Souvenirs)",
    wood: "කළුවර නිමාව (Ebony Finish)",
    price: 7500,
    image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
    description: "ශ්‍රී ලාංකීය අභිමානය විදහා දක්වන සාම්ප්‍රදායික ඇත් රූප සිහිවටනය."
  }
];

export default async function HomePage() {
  let products: ProductData[] = defaultProducts;

  try {
    const dbProducts = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });
    if (dbProducts && dbProducts.length > 0) {
      products = dbProducts;
    }
  } catch (error) {
    // If DB is initializing or empty, fallback seamlessly to default handcrafted wood products
    console.warn('Falling back to default products during prerender:', error);
  }

  return (
    <>
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <ProductCatalog initialProducts={products} />
        <CustomOrderSection />
      </main>
      <Footer />
    </>
  );
}
