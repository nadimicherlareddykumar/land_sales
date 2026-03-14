const dotenv = require("dotenv");
const mongoose = require("mongoose");

const connectDB = require("../config/db");
const Property = require("../models/Property");

dotenv.config();

const seedProperties = [
  {
    title: "Premium Residential Plot Near Airport",
    description:
      "East-facing residential plot in a gated layout with clear title, close to NH44 and airport corridor.",
    propertyType: "Residential Plot",
    listingType: "Sale",
    price: 3500000,
    location: {
      area: "Devanahalli",
      city: "Bangalore",
      state: "Karnataka",
      country: "India",
      latitude: 13.246,
      longitude: 77.711
    },
    landDetails: {
      plotSize: 1200,
      plotSizeUnit: "sqft",
      dimensions: { length: 40, width: 30, unit: "ft" },
      roadAccess: true,
      facing: "East",
      zoningType: "Residential",
      utilities: {
        water: true,
        electricity: true,
        sewage: true
      }
    },
    images: [
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200",
      "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1200"
    ],
    ownerContact: {
      name: "Arjun R",
      phone: "+91-9876543210",
      email: "arjun.plot@example.com"
    },
    isFeatured: true
  },
  {
    title: "Agricultural Land with Borewell",
    description:
      "Fertile agricultural land suitable for plantation with road-touch access and existing borewell.",
    propertyType: "Agricultural Land",
    listingType: "Sale",
    price: 9500000,
    location: {
      area: "Nandi Hills Road",
      city: "Bangalore",
      state: "Karnataka",
      country: "India",
      latitude: 13.371,
      longitude: 77.683
    },
    landDetails: {
      plotSize: 2.3,
      plotSizeUnit: "acre",
      dimensions: { length: 320, width: 312, unit: "ft" },
      roadAccess: true,
      facing: "North",
      zoningType: "Agricultural",
      utilities: {
        water: true,
        electricity: true,
        sewage: false
      }
    },
    images: ["https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1200"],
    ownerContact: {
      name: "Maya P",
      phone: "+91-9988776655",
      email: "maya.farm@example.com"
    }
  },
  {
    title: "Commercial Corner Plot",
    description:
      "Main-road commercial land ideal for showroom or mixed-use development in fast-growing hub.",
    propertyType: "Commercial Land",
    listingType: "Sale",
    price: 22000000,
    location: {
      area: "Whitefield",
      city: "Bangalore",
      state: "Karnataka",
      country: "India",
      latitude: 12.971,
      longitude: 77.751
    },
    landDetails: {
      plotSize: 3000,
      plotSizeUnit: "sqft",
      dimensions: { length: 60, width: 50, unit: "ft" },
      roadAccess: true,
      facing: "North-East",
      zoningType: "Commercial",
      utilities: {
        water: true,
        electricity: true,
        sewage: true
      }
    },
    images: ["https://images.unsplash.com/photo-1505692952047-1a78307da8f2?w=1200"],
    ownerContact: {
      name: "Ibrahim K",
      phone: "+91-9001122334",
      email: "ik.commercial@example.com"
    }
  },
  {
    title: "3 BHK Villa in Gated Community",
    description:
      "Spacious villa with private garden, clubhouse access, and covered parking.",
    propertyType: "House/Villa",
    listingType: "Sale",
    price: 18500000,
    location: {
      area: "Sarjapur",
      city: "Bangalore",
      state: "Karnataka",
      country: "India",
      latitude: 12.899,
      longitude: 77.691
    },
    builtUpArea: 2450,
    bedrooms: 3,
    bathrooms: 3,
    parking: 2,
    amenities: ["Clubhouse", "Gym", "Power Backup"],
    images: ["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200"],
    ownerContact: {
      name: "Kiran S",
      phone: "+91-9090909090",
      email: "kiran.villa@example.com"
    }
  },
  {
    title: "Modern 2 BHK Apartment",
    description:
      "Well-ventilated apartment near metro station with premium amenities.",
    propertyType: "Apartment",
    listingType: "Rent",
    price: 42000,
    location: {
      area: "Indiranagar",
      city: "Bangalore",
      state: "Karnataka",
      country: "India",
      latitude: 12.978,
      longitude: 77.641
    },
    builtUpArea: 1200,
    bedrooms: 2,
    bathrooms: 2,
    parking: 1,
    amenities: ["Lift", "Swimming Pool", "24x7 Security"],
    images: ["https://images.unsplash.com/photo-1494526585095-c41746248156?w=1200"],
    ownerContact: {
      name: "Nidhi T",
      phone: "+91-8080808080",
      email: "nidhi.apartment@example.com"
    }
  }
];

const seed = async () => {
  try {
    await connectDB();

    await Property.deleteMany();
    const created = await Property.insertMany(seedProperties);

    console.log(`Seeded ${created.length} properties`);
  } catch (error) {
    console.error(`Seed failed: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

if (require.main === module) {
  seed();
} else {
  module.exports = { seedProperties, seed };
}
