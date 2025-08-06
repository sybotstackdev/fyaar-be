const mongoose = require('mongoose');
const Author = require('../models/authorModel');
const logger = require('../utils/logger');

// Sample authors data
const sampleAuthors = [
  {
    authorName: 'Jane Austen',
    writingStyle: 'Known for her witty social commentary and realistic portrayal of 19th-century English society. Her writing is characterized by irony, social realism, and detailed character development.',
    penName: 'A Lady'
  },
  {
    authorName: 'Ernest Hemingway',
    writingStyle: 'Famous for his concise, understated writing style known as the "Iceberg Theory." His prose is characterized by short sentences, simple vocabulary, and deep underlying meaning.',
    penName: 'Papa'
  },
  {
    authorName: 'Virginia Woolf',
    writingStyle: 'Pioneer of stream-of-consciousness narrative technique. Her writing explores the inner lives of characters through poetic, flowing prose and innovative narrative structures.',
    penName: 'V.W.'
  },
  {
    authorName: 'Gabriel García Márquez',
    writingStyle: 'Master of magical realism, blending fantastical elements with realistic settings. His writing is rich in imagery, folklore, and complex family sagas.',
    penName: 'Gabo'
  },  
  {
    authorName: 'Toni Morrison',
    writingStyle: 'Known for her lyrical prose and exploration of African American experience. Her writing features rich symbolism, complex characters, and themes of identity and community.',
    penName: 'Chloe Wofford'
  },
  {
    authorName: 'Haruki Murakami',
    writingStyle: 'Blends magical realism with contemporary Japanese culture. His writing is characterized by surreal elements, detailed descriptions, and themes of loneliness and alienation.',
    penName: 'H.M.'
  },
  {
    authorName: 'Chimamanda Ngozi Adichie',
    writingStyle: 'Known for her powerful storytelling about Nigerian culture and diaspora. Her writing is characterized by strong female protagonists and themes of identity, feminism, and colonialism.',
    penName: 'C.N.A.'
  },
  {
    authorName: 'Jorge Luis Borges',
    writingStyle: 'Master of philosophical fiction and magical realism. His writing features complex labyrinths, infinite libraries, and exploration of time, reality, and human perception.',
    penName: 'B.'
  },
  {
    authorName: 'Sylvia Plath',
    writingStyle: 'Known for her confessional poetry and intense emotional expression. Her writing explores themes of mental illness, female identity, and the search for self.',
    penName: 'Victoria Lucas'
  },
  {
    authorName: 'James Joyce',
    writingStyle: 'Pioneer of modernist literature and stream-of-consciousness technique. His writing is characterized by complex wordplay, allusions, and innovative narrative structures.',
    penName: 'Stephen Dedalus'
  }
];

/**
 * Seed authors into the database
 */
const seedAuthors = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/amora';
    await mongoose.connect(mongoUri);
    logger.info('Connected to MongoDB');

    // Clear existing authors
    await Author.deleteMany({});
    logger.info('Cleared existing authors');

    // Insert sample authors
    const authors = await Author.insertMany(sampleAuthors);
    logger.info(`Seeded ${authors.length} authors successfully`);

    // Log the created authors
    authors.forEach(author => {
      logger.info(`Created author: ${author.authorName} (${author.penName})`);
    });

    logger.info('Author seeding completed successfully');
  } catch (error) {
    logger.error('Error seeding authors:', error);
    throw error;
  } finally {
    // Close database connection
    await mongoose.connection.close();
    logger.info('Database connection closed');
  }
};

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedAuthors()
    .then(() => {
      console.log('Authors seeded successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error seeding authors:', error);
      process.exit(1);
    });
}

module.exports = { seedAuthors }; 