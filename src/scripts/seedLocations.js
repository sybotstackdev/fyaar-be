const mongoose = require('mongoose');
const Location = require('../models/locationModel');
const logger = require('../utils/logger');

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/amora');
    logger.info('Connected to MongoDB');
  } catch (error) {
    logger.error('Database connection failed:', error.message);
    process.exit(1);
  }
};

// Location data organized by categories
const locationData = [
  // Tier-1 Cities (Urban, Cosmopolitan)
  {
    name: 'Mumbai',
    category: 'tier1-cities',
    description: 'The financial capital of India, known for its fast-paced lifestyle, Bollywood, and diverse culture. Perfect for office romances, career-focused stories, and startup culture narratives.',
    country: 'India',
    state: 'Maharashtra'
  },
  {
    name: 'Delhi',
    category: 'tier1-cities',
    description: 'The capital city with rich history and modern development. Ideal for political intrigue, cultural clashes, and power dynamics in relationships.',
    country: 'India',
    state: 'Delhi'
  },
  {
    name: 'Bangalore',
    category: 'tier1-cities',
    description: 'The Silicon Valley of India, known for its tech culture, pleasant weather, and cosmopolitan lifestyle. Great for startup romances and digital nomad stories.',
    country: 'India',
    state: 'Karnataka'
  },
  {
    name: 'Hyderabad',
    category: 'tier1-cities',
    description: 'A city of pearls and technology, blending traditional charm with modern development. Perfect for stories about heritage meeting progress.',
    country: 'India',
    state: 'Telangana'
  },
  {
    name: 'Pune',
    category: 'tier1-cities',
    description: 'The Oxford of the East, known for its educational institutions and pleasant climate. Ideal for campus romances and academic settings.',
    country: 'India',
    state: 'Maharashtra'
  },
  {
    name: 'Chennai',
    category: 'tier1-cities',
    description: 'The gateway to South India, known for its classical music, beaches, and traditional values. Great for cultural romance stories.',
    country: 'India',
    state: 'Tamil Nadu'
  },
  {
    name: 'Kolkata',
    category: 'tier1-cities',
    description: 'The cultural capital, known for its intellectual heritage, literature, and artistic soul. Perfect for intellectual romances and artistic passion.',
    country: 'India',
    state: 'West Bengal'
  },
  {
    name: 'Gurgaon',
    category: 'tier1-cities',
    description: 'A modern corporate hub with high-rise buildings and international companies. Ideal for corporate romances and power couple dynamics.',
    country: 'India',
    state: 'Haryana'
  },
  {
    name: 'Noida',
    category: 'tier1-cities',
    description: 'A planned city with modern infrastructure and corporate offices. Great for stories about ambition and modern relationships.',
    country: 'India',
    state: 'Uttar Pradesh'
  },

  // Tier-2 / Smaller Cities (Grounded, Relatable)
  {
    name: 'Jaipur',
    category: 'tier2-cities',
    description: 'The Pink City, known for its royal heritage, colorful culture, and traditional values. Perfect for nostalgic homecomings and royal romance.',
    country: 'India',
    state: 'Rajasthan'
  },
  {
    name: 'Bhopal',
    category: 'tier2-cities',
    description: 'The City of Lakes, with a mix of old and new India. Ideal for stories about second chances and rediscovering love.',
    country: 'India',
    state: 'Madhya Pradesh'
  },
  {
    name: 'Kochi',
    category: 'tier2-cities',
    description: 'A coastal city with colonial heritage and modern development. Great for stories about cultural fusion and coastal romance.',
    country: 'India',
    state: 'Kerala'
  },
  {
    name: 'Lucknow',
    category: 'tier2-cities',
    description: 'The City of Nawabs, known for its refined culture and traditional values. Perfect for stories about grace, tradition, and timeless love.',
    country: 'India',
    state: 'Uttar Pradesh'
  },
  {
    name: 'Indore',
    category: 'tier2-cities',
    description: 'A clean and progressive city with a mix of traditional and modern values. Ideal for stories about growth and evolving relationships.',
    country: 'India',
    state: 'Madhya Pradesh'
  },
  {
    name: 'Surat',
    category: 'tier2-cities',
    description: 'The Diamond City, known for its business acumen and entrepreneurial spirit. Great for stories about ambition and partnership.',
    country: 'India',
    state: 'Gujarat'
  },
  {
    name: 'Nagpur',
    category: 'tier2-cities',
    description: 'The Orange City, with a laid-back lifestyle and strong community bonds. Perfect for stories about community, family, and lasting love.',
    country: 'India',
    state: 'Maharashtra'
  },
  {
    name: 'Chandigarh',
    category: 'tier2-cities',
    description: 'A planned city with beautiful architecture and a high quality of life. Ideal for stories about balance and harmonious relationships.',
    country: 'India',
    state: 'Chandigarh'
  },
  {
    name: 'Guwahati',
    category: 'tier2-cities',
    description: 'The Gateway to Northeast India, with diverse cultures and natural beauty. Great for stories about discovery and cultural exploration.',
    country: 'India',
    state: 'Assam'
  },

  // Vacation & Travel Settings
  {
    name: 'Goa',
    category: 'vacation-travel',
    description: 'The Pearl of the Orient, known for its beaches, nightlife, and laid-back vibe. Perfect for vacation romances and carefree love stories.',
    country: 'India',
    state: 'Goa'
  },
  {
    name: 'Manali',
    category: 'vacation-travel',
    description: 'A hill station with snow-capped mountains and adventure sports. Ideal for adventure romances and mountain love stories.',
    country: 'India',
    state: 'Himachal Pradesh'
  },
  {
    name: 'Udaipur',
    category: 'vacation-travel',
    description: 'The City of Lakes, known for its romantic palaces and scenic beauty. Perfect for fairy-tale romances and royal love stories.',
    country: 'India',
    state: 'Rajasthan'
  },
  {
    name: 'Pondicherry',
    category: 'vacation-travel',
    description: 'A French colonial town with spiritual centers and coastal charm. Great for stories about spiritual awakening and peaceful romance.',
    country: 'India',
    state: 'Puducherry'
  },
  {
    name: 'Rishikesh',
    category: 'vacation-travel',
    description: 'The Yoga Capital of the World, with spiritual retreats and adventure activities. Ideal for stories about spiritual connection and inner peace.',
    country: 'India',
    state: 'Uttarakhand'
  },
  {
    name: 'Leh-Ladakh',
    category: 'vacation-travel',
    description: 'A high-altitude desert with stunning landscapes and Buddhist culture. Perfect for stories about adventure, discovery, and profound connections.',
    country: 'India',
    state: 'Ladakh'
  },
  {
    name: 'Ooty',
    category: 'vacation-travel',
    description: 'The Queen of Hill Stations, with tea gardens and colonial charm. Great for stories about gentle romance and natural beauty.',
    country: 'India',
    state: 'Tamil Nadu'
  },
  {
    name: 'Darjeeling',
    category: 'vacation-travel',
    description: 'A hill station known for its tea gardens and colonial heritage. Ideal for stories about heritage, tradition, and timeless love.',
    country: 'India',
    state: 'West Bengal'
  },

  // International Locations (Global Touch)
  {
    name: 'New York',
    category: 'international',
    description: 'The Big Apple, a global metropolis of dreams and opportunities. Perfect for NRI romance, ambitious love stories, and cross-cultural dynamics.',
    country: 'United States',
    state: 'New York'
  },
  {
    name: 'London',
    category: 'international',
    description: 'The historic capital with royal heritage and modern diversity. Great for stories about tradition meeting modernity and international romance.',
    country: 'United Kingdom',
    state: 'England'
  },
  {
    name: 'Dubai',
    category: 'international',
    description: 'A futuristic city in the desert, known for luxury and innovation. Ideal for stories about ambition, luxury, and cross-cultural relationships.',
    country: 'United Arab Emirates',
    state: 'Dubai'
  },
  {
    name: 'Paris',
    category: 'international',
    description: 'The City of Love, known for romance, art, and culture. Perfect for passionate love stories and artistic romance.',
    country: 'France',
    state: 'Île-de-France'
  },
  {
    name: 'Singapore',
    category: 'international',
    description: 'A modern city-state with diverse cultures and high technology. Great for stories about efficiency, diversity, and modern relationships.',
    country: 'Singapore',
    state: 'Singapore'
  },
  {
    name: 'Toronto',
    category: 'international',
    description: 'A multicultural city known for diversity and opportunity. Ideal for stories about immigration, cultural fusion, and new beginnings.',
    country: 'Canada',
    state: 'Ontario'
  },
  {
    name: 'Sydney',
    category: 'international',
    description: 'A coastal city with beautiful beaches and laid-back lifestyle. Perfect for stories about work-life balance and coastal romance.',
    country: 'Australia',
    state: 'New South Wales'
  },
  {
    name: 'Bali',
    category: 'international',
    description: 'An island paradise known for spirituality and natural beauty. Great for stories about spiritual awakening and tropical romance.',
    country: 'Indonesia',
    state: 'Bali'
  },
  {
    name: 'Tokyo',
    category: 'international',
    description: 'A futuristic city blending tradition with cutting-edge technology. Ideal for stories about cultural contrast and modern love.',
    country: 'Japan',
    state: 'Tokyo'
  },
  {
    name: 'Istanbul',
    category: 'international',
    description: 'A city spanning two continents with rich history and culture. Perfect for stories about cultural bridges and historical romance.',
    country: 'Turkey',
    state: 'Istanbul'
  },

  // Speculative / Fantasy Settings (For Sci-Fi/Magic)
  {
    name: 'Alternate Futuristic City',
    category: 'speculative-fantasy',
    description: 'A high-tech metropolis with flying cars, holographic displays, and advanced AI. Perfect for sci-fi romance and futuristic love stories.',
    country: 'Fictional',
    state: 'Future'
  },
  {
    name: 'Magical University',
    category: 'speculative-fantasy',
    description: 'A mystical institution where magic and romance intertwine. Ideal for fantasy romance and magical love stories.',
    country: 'Fictional',
    state: 'Magical Realm'
  },
  {
    name: 'Floating Islands',
    category: 'speculative-fantasy',
    description: 'Mystical islands suspended in the sky with unique ecosystems. Great for adventure romance and otherworldly love stories.',
    country: 'Fictional',
    state: 'Sky Realm'
  },
  {
    name: 'Tech-Dystopia India',
    category: 'speculative-fantasy',
    description: 'A futuristic India where technology has transformed society. Perfect for cyberpunk romance and dystopian love stories.',
    country: 'Fictional',
    state: 'Future India'
  },
  {
    name: 'Enchanted Forest',
    category: 'speculative-fantasy',
    description: 'A mystical forest with magical creatures and ancient secrets. Ideal for fantasy romance and nature-based love stories.',
    country: 'Fictional',
    state: 'Magical Realm'
  },
  {
    name: 'Shifter Clan Territory',
    category: 'speculative-fantasy',
    description: 'A realm where shape-shifters live in organized clans. Perfect for paranormal romance and shifter love stories.',
    country: 'Fictional',
    state: 'Shifter Realm'
  },
  {
    name: 'Post-Apocalyptic Wasteland',
    category: 'speculative-fantasy',
    description: 'A world rebuilt after global catastrophe. Great for survival romance and post-apocalyptic love stories.',
    country: 'Fictional',
    state: 'Post-Apocalyptic'
  },
  {
    name: 'Interdimensional Café',
    category: 'speculative-fantasy',
    description: 'A mystical café that exists between dimensions. Ideal for surreal romance and magical realism love stories.',
    country: 'Fictional',
    state: 'Between Dimensions'
  },
  {
    name: 'Vampire-Dominated Metropolis',
    category: 'speculative-fantasy',
    description: 'A city where vampires rule and humans are second-class citizens. Perfect for dark romance and vampire love stories.',
    country: 'Fictional',
    state: 'Vampire Realm'
  },
  {
    name: 'Reincarnation Loops Across Eras',
    category: 'speculative-fantasy',
    description: 'A mystical realm where souls reincarnate across different time periods. Great for time-travel romance and eternal love stories.',
    country: 'Fictional',
    state: 'Timeless Realm'
  }
];

// Seed function
const seedLocations = async () => {
  try {
    // Clear existing locations
    await Location.deleteMany({});
    logger.info('Cleared existing locations');

    // Insert new locations
    const locations = await Location.insertMany(locationData);
    logger.info(`Successfully seeded ${locations.length} locations`);

    // Log categories and counts
    const categoryCounts = {};
    locations.forEach(location => {
      categoryCounts[location.category] = (categoryCounts[location.category] || 0) + 1;
    });

    logger.info('Location categories seeded:');
    Object.entries(categoryCounts).forEach(([category, count]) => {
      logger.info(`- ${category}: ${count} locations`);
    });

    process.exit(0);
  } catch (error) {
    logger.error('Seeding failed:', error.message);
    process.exit(1);
  }
};

// Run the seeder
if (require.main === module) {
  connectDB().then(() => {
    seedLocations();
  });
}

module.exports = { seedLocations }; 