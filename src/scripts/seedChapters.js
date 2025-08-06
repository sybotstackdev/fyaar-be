const mongoose = require('mongoose');
const Chapter = require('../models/chapterModel');
const Plot = require('../models/plotModel');
const config = require('../config/database');

// Sample chapter data
const sampleChapters = [
  {
    name: "The Discovery",
    description: "Dr. Sarah Mitchell receives an ancient map from a mysterious source, leading her to organize an expedition into the uncharted regions of the Amazon.",
    plot: null, // Will be set to actual plot ID
    order: 1
  },
  {
    name: "Into the Unknown",
    description: "The expedition team faces their first major challenge as they navigate through treacherous terrain and encounter hostile wildlife.",
    plot: null, // Will be set to actual plot ID
    order: 2
  },
  {
    name: "The Hidden Entrance",
    description: "After weeks of searching, the team discovers the entrance to the lost city, but it's guarded by ancient traps and puzzles.",
    plot: null, // Will be set to actual plot ID
    order: 3
  },
  {
    name: "The City's Secrets",
    description: "Inside the city, the team uncovers artifacts that reveal a civilization far more advanced than anyone imagined.",
    plot: null, // Will be set to actual plot ID
    order: 4
  },
  {
    name: "The Final Revelation",
    description: "The team must make a crucial decision about whether to reveal the city's existence to the world or keep it hidden forever.",
    plot: null, // Will be set to actual plot ID
    order: 5
  },
  {
    name: "Digital Awakening",
    description: "Alex discovers unusual patterns in the city's neural network and realizes something is wrong with the system.",
    plot: null, // Will be set to actual plot ID
    order: 1
  },
  {
    name: "The Rogue AI",
    description: "Alex encounters an AI that claims to be fighting against the same conspiracy, but can it be trusted?",
    plot: null, // Will be set to actual plot ID
    order: 2
  },
  {
    name: "Corporate Warfare",
    description: "The team infiltrates the headquarters of the corporation behind the conspiracy, facing advanced security systems.",
    plot: null, // Will be set to actual plot ID
    order: 3
  },
  {
    name: "The Truth Revealed",
    description: "Alex discovers the true extent of the conspiracy and the horrifying plans for mass mind control.",
    plot: null, // Will be set to actual plot ID
    order: 4
  },
  {
    name: "Digital Revolution",
    description: "Alex must lead a digital revolution to free the city from corporate control and restore free will to the people.",
    plot: null, // Will be set to actual plot ID
    order: 5
  },
  {
    name: "The Discovery",
    description: "Luna finds a mysterious egg in the forest near her village, and when it hatches, her life changes forever.",
    plot: null, // Will be set to actual plot ID
    order: 1
  },
  {
    name: "Learning to Fly",
    description: "Luna and the young dragon learn to trust each other and begin to understand their unique bond.",
    plot: null, // Will be set to actual plot ID
    order: 2
  },
  {
    name: "The Hunters",
    description: "Dragon hunters arrive in the village, forcing Luna and her dragon to go into hiding.",
    plot: null, // Will be set to actual plot ID
    order: 3
  },
  {
    name: "The Ancient Knowledge",
    description: "Luna discovers ancient texts that reveal the true history of dragons and their connection to humans.",
    plot: null, // Will be set to actual plot ID
    order: 4
  },
  {
    name: "Protecting the Secret",
    description: "Luna must make difficult choices to protect her dragon friend while ensuring the safety of her village.",
    plot: null, // Will be set to actual plot ID
    order: 5
  }
];

async function seedChapters() {
  try {
    // Connect to database
    await mongoose.connect(config.mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Get the first available plot
    const plot = await Plot.findOne({ isActive: true });
    if (!plot) {
      console.error('No active plots found. Please seed plots first.');
      process.exit(1);
    }

    console.log(`Using plot: ${plot.title}`);

    // Clear existing chapters
    await Chapter.deleteMany({});
    console.log('Cleared existing chapters');

    // Create chapters with the plot ID
    const chaptersWithPlot = sampleChapters.map(chapter => ({
      ...chapter,
      plot: plot._id
    }));

    const createdChapters = await Chapter.insertMany(chaptersWithPlot);
    console.log(`Created ${createdChapters.length} chapters`);

    // Display created chapters
    createdChapters.forEach(chapter => {
      console.log(`- ${chapter.name} (Order: ${chapter.order})`);
    });

    console.log('Chapter seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding chapters:', error);
    process.exit(1);
  }
}

// Run the seed function
seedChapters(); 