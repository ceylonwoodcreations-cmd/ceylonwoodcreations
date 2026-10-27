import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const username = process.env.ADMIN_DEFAULT_USER || 'admin';
  const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'WoodArtAdmin2026!#';

  const existingAdmin = await prisma.admin.findUnique({
    where: { username },
  });

  if (!existingAdmin) {
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(defaultPassword, salt);
    await prisma.admin.create({
      data: {
        username,
        passwordHash,
      },
    });
    console.log(`Default admin created: ${username}`);
  }

  const count = await prisma.product.count();
  if (count === 0) {
    await prisma.product.createMany({
      data: [
        {
          title: "සමාධි බුද්ධ ප්‍රතිමාව (අඟල් 18)",
          category: "පිළිම සහ ප්‍රතිමා",
          wood: "තේක්ක දැව (Teak Wood)",
          price: 18500,
          image: "https://images.unsplash.com/photo-1544967082-d9d25d867d66?auto=format&fit=crop&w=800&q=80",
          description: "තේක්ක දැවයෙන් නිමවන ලද සාමකාමී සමාධි බුදු පිළිමය."
        },
        {
          title: "සාම්ප්‍රදායික සඳකඩපහණ බිත්ති සැරසිල්ල",
          category: "බිත්ති සැරසිලි",
          wood: "මහෝගනී දැව (Mahogany)",
          price: 14000,
          image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=800&q=80",
          description: "අනුරාධපුර සම්ප්‍රදායේ සියුම් කැටයම් සහිත සඳකඩපහණ බිත්ති සැරසිල්ල."
        },
        {
          title: "කැටයම් කළ ඇත් රූපය (Ceylon Elephant)",
          category: "සිහිවටන (Souvenirs)",
          wood: "කළුවර නිමාව (Ebony Finish)",
          price: 7500,
          image: "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&w=800&q=80",
          description: "ශ්‍රී ලාංකීය අභිමානය විදහා දක්වන සාම්ප්‍රදායික ඇත් රූප සිහිවටනය."
        }
      ]
    });
    console.log("Initial default products seeded.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
