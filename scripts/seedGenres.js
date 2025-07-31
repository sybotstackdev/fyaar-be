const mongoose = require('mongoose');
const Genre = require('../src/models/genreModel');
require('dotenv').config();

const genres = [
  {
    title: 'College Romance',
    description: 'Love stories rooted in student life — campuses, hostels, internships, fresh starts, and first heartbreaks. Ideal for exploring coming-of-age themes, identity, and emotional intensity.'
  },
  {
    title: 'Office Romance',
    description: 'Set in startups, corporate offices, co-working spaces, or remote teams. Explores ambition, power dynamics, workplace tension, and the balance between career and connection.'
  },
  {
    title: 'Arranged Marriage / Forced Proximity',
    description: 'Stories where characters are thrown together by family, culture, or circumstance. Includes modern arranged marriages, fake marriages, roommates, and unexpected cohabitation.'
  },
  {
    title: 'Second Chance / Rekindled Love',
    description: 'Ex-lovers, childhood friends, or missed connections getting another shot at love. Focuses on maturity, emotional growth, past wounds, and "right person, wrong time" arcs.'
  },
  {
    title: 'Friends to Lovers',
    description: 'Romance that grows out of familiarity — roommates, creative partners, lifelong friends. Often features slow burn, unspoken feelings, and deep emotional comfort.'
  },
  {
    title: 'Enemies to Lovers',
    description: 'From banter to bitterness to romance — includes rivals, opposites, or past betrayals. Rich with tension, transformation, and reluctant vulnerability.'
  },
  {
    title: 'Forbidden / Taboo Romance',
    description: 'Love that breaks rules or norms — such as boss/intern, teacher/student, engaged to someone else, or best friend\'s sibling. High in stakes, secrecy, and emotional conflict.'
  },
  {
    title: 'Strangers to Lovers',
    description: 'Chance encounters that spark something real — dating apps, airport run-ins, wrong-number texts, or travel flings. Ideal for fast emotional connection and fresh dynamics.'
  },
  {
    title: 'Fake Relationship / Pretend Love',
    description: 'Characters pretend to be in love — for family, work, or reputation — only to fall for each other for real. Great for slow build-up, denial, and emotional payoff.'
  },
  {
    title: 'Late Bloom / Healing Romance',
    description: 'Romance for characters who are older, guarded, or emotionally scarred — divorcees, single parents, burned-out professionals. These stories center emotional safety, growth, and rediscovery.'
  },
  {
    title: 'Speculative / Sci-Fi / Fantasy Romance',
    description: 'Stories set in worlds beyond our current reality — including futuristic tech, alternate timelines, magical systems, shifters, vampires, gods, curses, or any supernatural twist. These romances are driven by emotional arcs but layered with world-building, destiny, or fantastical rules that shape the connection.'
  }
];

const seedGenres = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/amora';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing genres
    await Genre.deleteMany({});
    console.log('Cleared existing genres');

    // Insert new genres
    const createdGenres = await Genre.insertMany(genres);
    console.log(`Successfully seeded ${createdGenres.length} genres:`);

    createdGenres.forEach(genre => {
      console.log(`- ${genre.title}`);
    });

    console.log('\nGenre seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding genres:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the seeding function
seedGenres(); 