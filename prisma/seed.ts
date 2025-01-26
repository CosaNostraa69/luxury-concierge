import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const specialties = [
    // Transport
    'Private Jets',
    'Luxury Yachts',
    'Classic Cars',
    'Luxury Vehicles',
    'Private Chauffeur',
    
    // Real Estate
    'Luxury Properties',
    'Vacation Villas',
    'Penthouses',
    'Private Islands',
    'Castles',
    
    // Art & Collection
    'Contemporary Art',
    'Antiques',
    'Rare Artworks',
    'Collectibles',
    'Luxury Auctions',
    
    // Fashion & Accessories
    'Haute Couture',
    'Vintage Fashion',
    'Rare Accessories',
    'Fine Jewelry',
    'Luxury Watches',
    
    // Events & Experiences
    'Private Events',
    'Luxury Weddings',
    'Exclusive Parties',
    'VIP Experiences',
    'VIP Access',
    
    // Lifestyle & Wellness
    'Luxury Spas',
    'Personal Coaching',
    'Beauty Services',
    'Aesthetic Medicine',
    'Personal Nutrition',
    
    // Gastronomy
    'Fine Dining',
    'Private Chefs',
    'Luxury Food',
    'Luxury Pastry',
    'Gourmet Delicacies',
    
    // Travel
    'Exclusive Destinations',
    'Luxury Hotels',
    'Unique Experiences',
    'Private Travel',
    'Travel Concierge'
  ];

  // Création des spécialités
  for (const name of specialties) {
    await prisma.specialty.upsert({
      where: { name },
      update: {},
      create: { 
        name,
      },
    });
  }

  console.log('✅ Specialties seeded successfully');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding specialties:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });