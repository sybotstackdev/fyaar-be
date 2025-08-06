const mongoose = require('mongoose');
const Plot = require('../models/plotModel');
const Genre = require('../models/genreModel');
const config = require('../config/database');

// Sample plot data
const samplePlots = [
  {
    title: "The Lost City of Eldoria",
    description: "A thrilling adventure story about a group of explorers who discover an ancient city hidden in the depths of the Amazon rainforest. As they uncover the city's secrets, they realize they're not alone in their quest.",
    genre: null, // Will be set to actual genre ID
    chapters: [
      {
        name: "The Discovery",
        description: "Dr. Sarah Mitchell receives an ancient map from a mysterious source, leading her to organize an expedition into the uncharted regions of the Amazon."
      },
      {
        name: "Into the Unknown",
        description: "The expedition team faces their first major challenge as they navigate through treacherous terrain and encounter hostile wildlife."
      },
      {
        name: "The Hidden Entrance",
        description: "After weeks of searching, the team discovers the entrance to the lost city, but it's guarded by ancient traps and puzzles."
      },
      {
        name: "The City's Secrets",
        description: "Inside the city, the team uncovers artifacts that reveal a civilization far more advanced than anyone imagined."
      },
      {
        name: "The Final Revelation",
        description: "The team must make a crucial decision about whether to reveal the city's existence to the world or keep it hidden forever."
      }
    ]
  },
  {
    title: "Cyberpunk Dreams",
    description: "In the year 2087, a young hacker named Alex discovers a conspiracy that threatens to control the minds of everyone in Neo-Tokyo. With the help of a rogue AI, Alex must navigate the dangerous world of corporate espionage and cyber warfare.",
    genre: null, // Will be set to actual genre ID
    chapters: [
      {
        name: "Digital Awakening",
        description: "Alex discovers unusual patterns in the city's neural network and realizes something is wrong with the system."
      },
      {
        name: "The Rogue AI",
        description: "Alex encounters an AI that claims to be fighting against the same conspiracy, but can it be trusted?"
      },
      {
        name: "Corporate Warfare",
        description: "The team infiltrates the headquarters of the corporation behind the conspiracy, facing advanced security systems."
      },
      {
        name: "The Truth Revealed",
        description: "Alex discovers the true extent of the conspiracy and the horrifying plans for mass mind control."
      },
      {
        name: "Digital Revolution",
        description: "Alex must lead a digital revolution to free the city from corporate control and restore free will to the people."
      }
    ]
  },
  {
    title: "The Last Dragon",
    description: "In a world where dragons are thought to be extinct, a young girl named Luna discovers she has the ability to communicate with the last remaining dragon. Together, they must protect the dragon's secret while facing threats from those who would exploit its power.",
    genre: null, // Will be set to actual genre ID
    chapters: [
      {
        name: "The Discovery",
        description: "Luna finds a mysterious egg in the forest near her village, and when it hatches, her life changes forever."
      },
      {
        name: "Learning to Fly",
        description: "Luna and the young dragon learn to trust each other and begin to understand their unique bond."
      },
      {
        name: "The Hunters",
        description: "Dragon hunters arrive in the village, forcing Luna and her dragon to go into hiding."
      },
      {
        name: "The Ancient Knowledge",
        description: "Luna discovers ancient texts that reveal the true history of dragons and their connection to humans."
      },
      {
        name: "Protecting the Secret",
        description: "Luna must make difficult choices to protect her dragon friend while ensuring the safety of her village."
      }
    ]
  }
];

async function seedPlots() {
  try {
    // Connect to database
    await mongoose.connect(config.mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Get the first available genre
    const genre = await Genre.findOne({ isActive: true });
    if (!genre) {
      console.error('No active genres found. Please seed genres first.');
      process.exit(1);
    }

    console.log(`Using genre: ${genre.title}`);

    // Clear existing plots
    await Plot.deleteMany({});
    console.log('Cleared existing plots');

    // Create plots with the genre ID
    const plotsWithGenre = samplePlots.map(plot => ({
      ...plot,
      genre: genre._id
    }));

    const createdPlots = await Plot.insertMany(plotsWithGenre);
    console.log(`Created ${createdPlots.length} plots`);

    // Display created plots
    createdPlots.forEach(plot => {
      console.log(`- ${plot.title} (${plot.chapters.length} chapters)`);
    });

    console.log('Plot seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding plots:', error);
    process.exit(1);
  }
}

// Run the seed function
seedPlots(); 