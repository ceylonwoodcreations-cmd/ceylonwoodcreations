import { prisma } from '@/lib/prisma';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import ProductCatalog from '@/components/ProductCatalog';
import CustomOrderSection from '@/components/CustomOrderSection';
import Footer from '@/components/Footer';

// Revalidate every 60 seconds or on demand
export const revalidate = 60;

export default async function HomePage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
  });

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
