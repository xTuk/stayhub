/**
 * Optional local dev seed script. Creates a demo host, a demo guest, and a
 * handful of listings so the search/browse UI has something to show.
 *
 * Run with: npm run seed
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "password123";

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const host = await prisma.user.upsert({
    where: { email: "host@stayhub.dev" },
    update: {},
    create: {
      name: "Marina Costa",
      email: "host@stayhub.dev",
      passwordHash,
    },
  });

  const guest = await prisma.user.upsert({
    where: { email: "guest@stayhub.dev" },
    update: {},
    create: {
      name: "Diego Alvarez",
      email: "guest@stayhub.dev",
      passwordHash,
    },
  });

  const listingsData = [
    {
      title: "Sunlit Loft near Palermo Soho",
      description:
        "A bright, high-ceilinged loft in the heart of Palermo Soho, walking distance to cafes, galleries, and the botanical garden. Fully equipped kitchen and a private balcony.",
      city: "Buenos Aires",
      country: "Argentina",
      pricePerNight: 78,
      amenities: ["Wifi", "Kitchen", "Air conditioning", "Balcony", "Washer"],
      photos: [
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80",
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80",
      ],
    },
    {
      title: "Modern Studio, Polanco",
      description:
        "Minimalist studio in Polanco with skyline views, 24/7 security, and a rooftop pool. Perfect base for exploring Mexico City.",
      city: "Mexico City",
      country: "Mexico",
      pricePerNight: 95,
      amenities: ["Wifi", "Pool", "Gym", "Elevator", "Doorman"],
      photos: [
        "https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=1200&q=80",
        "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&q=80",
      ],
    },
    {
      title: "Cozy Cabin by Lake Llanquihue",
      description:
        "Wood cabin with volcano views, a wood-burning stove, and direct lake access. Ideal for a quiet weekend away from the city.",
      city: "Puerto Varas",
      country: "Chile",
      pricePerNight: 64,
      amenities: ["Wifi", "Fireplace", "Lake access", "Parking", "Pet friendly"],
      photos: [
        "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=1200&q=80",
        "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200&q=80",
      ],
    },
    {
      title: "Colonial House in La Candelaria",
      description:
        "Restored colonial house with an interior courtyard, steps from the historic center's museums and street art.",
      city: "Bogota",
      country: "Colombia",
      pricePerNight: 52,
      amenities: ["Wifi", "Kitchen", "Courtyard", "Workspace"],
      photos: [
        "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=80",
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80",
      ],
    },
    {
      title: "Beachfront Apartment, Punta del Este",
      description:
        "Floor-to-ceiling windows facing the Atlantic, a short walk to Playa Brava. Sleeps four comfortably.",
      city: "Punta del Este",
      country: "Uruguay",
      pricePerNight: 140,
      amenities: ["Wifi", "Beachfront", "Air conditioning", "Parking", "Pool"],
      photos: [
        "https://images.unsplash.com/photo-1519821172141-b5d8342b1a98?w=1200&q=80",
        "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1200&q=80",
      ],
    },
    {
      title: "Design Apartment in Providencia",
      description:
        "Architect-owned two-bedroom with curated furniture, a home office nook, and easy metro access across Santiago.",
      city: "Santiago",
      country: "Chile",
      pricePerNight: 71,
      amenities: ["Wifi", "Workspace", "Washer", "Elevator", "Kitchen"],
      photos: [
        "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=80",
        "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=1200&q=80",
      ],
    },
  ];

  for (const data of listingsData) {
    await prisma.listing.create({
      data: { ...data, hostId: host.id },
    });
  }

  console.log("Seed complete.");
  console.log(`  Host login:  host@stayhub.dev / ${DEMO_PASSWORD}`);
  console.log(`  Guest login: guest@stayhub.dev / ${DEMO_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
