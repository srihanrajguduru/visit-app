import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Create a default developer/admin user
  const hashedPassword = await bcrypt.hash("adminpassword", 10);
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@visit.com" },
    update: {},
    create: {
      id: "demo-admin-uid",
      name: "Developer Admin",
      email: "admin@visit.com",
      password: hashedPassword,
      role: "developer",
    },
  });

  await prisma.userProfile.upsert({
    where: { userId: "demo-admin-uid" },
    update: {},
    create: {
      userId: "demo-admin-uid",
      name: "Developer Admin",
      email: "admin@visit.com",
      avatarUrl: null,
      areasAssociated: JSON.stringify([]),
    },
  });

  // 2. Create Demo Areas
  const areas = [
    { id: 'demo-area-1', name: 'Cyber City', latitude: 17.4435, longitude: 78.3772, zone: 'West Zone', currentVisitScore: 85.5 },
    { id: 'demo-area-2', name: 'Jubilee Hills', latitude: 17.4326, longitude: 78.4071, zone: 'Central Zone', currentVisitScore: 78.2 },
    { id: 'demo-area-3', name: 'Banjara Hills', latitude: 17.4156, longitude: 78.4398, zone: 'Central Zone', currentVisitScore: 82.0 }
  ];

  for (const area of areas) {
    await prisma.area.upsert({
      where: { id: area.id },
      update: area,
      create: area,
    });
  }

  // 3. Create default area metrics to make scores calculations function properly
  const metrics = [
    {
      areaId: 'demo-area-1',
      aqi: 45,
      noise: 55,
      floodRisk: 1,
      metroDistance: 350,
      roadQuality: 0.9,
      waterSupplyScore: 0.85,
      internetScore: 0.95,
      crimeRate: 15,
      womenSafetyScore: 88,
      amenityScore: 92,
    },
    {
      areaId: 'demo-area-2',
      aqi: 65,
      noise: 58,
      floodRisk: 1,
      metroDistance: 800,
      roadQuality: 0.85,
      waterSupplyScore: 0.8,
      internetScore: 0.9,
      crimeRate: 20,
      womenSafetyScore: 82,
      amenityScore: 85,
    },
    {
      areaId: 'demo-area-3',
      aqi: 55,
      noise: 62,
      floodRisk: 2,
      metroDistance: 1200,
      roadQuality: 0.8,
      waterSupplyScore: 0.75,
      internetScore: 0.85,
      crimeRate: 22,
      womenSafetyScore: 80,
      amenityScore: 88,
    }
  ];

  for (const metric of metrics) {
    const existing = await prisma.areaMetrics.findFirst({
      where: { areaId: metric.areaId }
    });
    if (!existing) {
      await prisma.areaMetrics.create({
        data: metric,
      });
    }
  }

  // 4. Create Demo Property Listings
  const properties = [
    {
      id: 'prop-demo-1',
      title: 'Tech Park Office Space',
      description: 'Premium office space in the heart of Cyber City.',
      price: 150000,
      propertyType: 'commercial',
      listingCategory: 'rent',
      bedrooms: 0,
      bathrooms: 4,
      areaSqft: 2500,
      latitude: 17.444,
      longitude: 78.378,
      areaId: 'demo-area-1',
      visitScoreSnapshot: 88.5,
      ownerId: 'demo-owner',
      verified: true,
    },
    {
      id: 'prop-demo-2',
      title: 'Luxury 3BHK Apartment',
      description: 'Modern apartment with skyline views.',
      price: 25000000,
      propertyType: 'apartment',
      listingCategory: 'sale',
      bedrooms: 3,
      bathrooms: 3,
      areaSqft: 2200,
      latitude: 17.442,
      longitude: 78.376,
      areaId: 'demo-area-1',
      visitScoreSnapshot: 85.0,
      ownerId: 'demo-owner',
      verified: true,
    },
    {
      id: 'prop-demo-3',
      title: 'Co-working Desk Space (To-Let)',
      description: 'Fully furnished desk spaces available.',
      price: 15000,
      propertyType: 'commercial',
      listingCategory: 'rent',
      bedrooms: 0,
      bathrooms: 1,
      areaSqft: 150,
      latitude: 17.445,
      longitude: 78.375,
      areaId: 'demo-area-1',
      visitScoreSnapshot: null,
      ownerId: 'demo-owner',
      verified: false,
    },
    {
      id: 'prop-demo-4',
      title: 'Independent Villa',
      description: 'Spacious villa with private garden and pool.',
      price: 85000000,
      propertyType: 'villa',
      listingCategory: 'sale',
      bedrooms: 5,
      bathrooms: 6,
      areaSqft: 6000,
      latitude: 17.433,
      longitude: 78.408,
      areaId: 'demo-area-2',
      visitScoreSnapshot: 79.5,
      ownerId: 'demo-owner',
      verified: true,
    },
    {
      id: 'prop-demo-5',
      title: 'Prime Residential Plot',
      description: 'Corner plot ideal for custom home construction.',
      price: 45000000,
      propertyType: 'land',
      listingCategory: 'sale',
      bedrooms: 0,
      bathrooms: 0,
      areaSqft: 4500,
      latitude: 17.430,
      longitude: 78.410,
      areaId: 'demo-area-2',
      visitScoreSnapshot: 75.0,
      ownerId: 'demo-owner',
      verified: true,
    },
    {
      id: 'prop-demo-6',
      title: '2BHK Annex For Rent',
      description: 'Quiet residential annex, perfect for small families.',
      price: 35000,
      propertyType: 'apartment',
      listingCategory: 'rent',
      bedrooms: 2,
      bathrooms: 2,
      areaSqft: 1200,
      latitude: 17.435,
      longitude: 78.405,
      areaId: 'demo-area-2',
      visitScoreSnapshot: 80.0,
      ownerId: 'demo-owner',
      verified: false,
    },
    {
      id: 'prop-demo-7',
      title: 'Commercial Showroom',
      description: 'Ground floor retail space on main road.',
      price: 300000,
      propertyType: 'commercial',
      listingCategory: 'rent',
      bedrooms: 0,
      bathrooms: 2,
      areaSqft: 3000,
      latitude: 17.416,
      longitude: 78.440,
      areaId: 'demo-area-3',
      visitScoreSnapshot: 84.5,
      ownerId: 'demo-owner',
      verified: true,
    },
    {
      id: 'prop-demo-8',
      title: '4BHK Penthouse',
      description: 'Luxurious penthouse with terrace garden.',
      price: 55000000,
      propertyType: 'apartment',
      listingCategory: 'sale',
      bedrooms: 4,
      bathrooms: 4,
      areaSqft: 4200,
      latitude: 17.414,
      longitude: 78.438,
      areaId: 'demo-area-3',
      visitScoreSnapshot: 83.0,
      ownerId: 'demo-owner',
      verified: true,
    },
    {
      id: 'prop-demo-9',
      title: 'Empty Land for Lease',
      description: 'Open land suitable for nursery or temporary setups.',
      price: 50000,
      propertyType: 'land',
      listingCategory: 'rent',
      bedrooms: 0,
      bathrooms: 0,
      areaSqft: 10000,
      latitude: 17.418,
      longitude: 78.442,
      areaId: 'demo-area-3',
      visitScoreSnapshot: null,
      ownerId: 'demo-owner',
      verified: false,
    }
  ];

  for (const prop of properties) {
    await prisma.propertyListing.upsert({
      where: { id: prop.id },
      update: prop,
      create: prop,
    });

    // Create default metadata scores for the properties
    await prisma.propertyMetadata.upsert({
      where: { id: `meta-${prop.id}` },
      update: {},
      create: {
        id: `meta-${prop.id}`,
        propertyId: prop.id,
        cleanlinessScore: 8.5,
        maintenanceScore: 8.0,
        demandScore: 7.5,
        noiseScore: prop.propertyType === 'commercial' ? 6.5 : 8.0,
      }
    });
  }

  // 5. Create Infrastructure Nodes
  const infraNodes = [
    { name: 'Jubilee Hills Checkpost Checkpoint', type: 'Metro Station', latitude: 17.4325, longitude: 78.4070, status: 'Operational' },
    { name: 'ORR Phase 2 Extension Corridor', type: 'Road Network (Highway)', latitude: 17.4410, longitude: 78.3450, status: 'Under Construction' },
    { name: 'Gachibowli Tech Fiber Ring', type: 'Fiber Internet Hub', latitude: 17.4400, longitude: 78.3489, status: 'Operational' },
    { name: 'Durgam Cheruvu Link Road', type: 'Road Network (Arterial)', latitude: 17.4300, longitude: 78.3900, status: 'Operational' }
  ];

  for (const node of infraNodes) {
    const existing = await prisma.infrastructureNode.findFirst({
      where: { name: node.name }
    });
    if (!existing) {
      await prisma.infrastructureNode.create({
        data: node,
      });
    }
  }

  console.log("Seeding finished successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
