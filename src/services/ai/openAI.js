require('dotenv').config();
const OpenAI = require('openai');
const logger = require('../../utils/logger');
const ApiError = require('../../utils/ApiError');
const instructionModel = require('../../models/instructionModel');

class OpenAIParseError extends ApiError {
  constructor(message, prompt, rawResponse) {
    super(500, message);
    this.prompt = prompt;
    this.rawResponse = rawResponse;
  }
}

if (!process.env.OPENAI_API_KEY) {
  logger.error('OpenAI API key is not configured. Please check your .env file.');
  throw new Error('OpenAI API key is not configured.');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Helper to extract instruction text from new Instruction schema
// Looks for an item with instructionName matching role (e.g., 'system' or 'user')
// Falls back to concatenating all instructionValue entries if specific role not found
const extractInstructionText = (doc, role) => {
  try {
    if (!doc || !Array.isArray(doc.instructions)) return '';
    const match = doc.instructions.find(i =>
      typeof i?.instructionName === 'string' && i.instructionName.toLowerCase() === String(role).toLowerCase()
    );
    if (match && typeof match.instructionValue === 'string') {
      return match.instructionValue.trim();
    }
    return doc.instructions
      .map(i => (typeof i?.instructionValue === 'string' ? i.instructionValue.trim() : ''))
      .filter(Boolean)
      .join('\n');
  } catch (_) {
    return '';
  }
};

/**
 * Generate a chat completion using OpenAI.
 * @param {string} systemPrompt - The system prompt defining the assistant's behavior.
 * @param {string} userPrompt - The user's prompt.
 * @param {string} model - The model to use for the completion (e.g., 'gpt-4', 'gpt-3.5-turbo', 'o3-mini'). Defaults to 'gpt-4'.
 * @returns {Promise<string>} The generated content from the assistant.
 */
const generateChatCompletion = async (systemPrompt, userPrompt, model = 'gpt-4o-mini') => {
  try {
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    logger.info(`Requesting OpenAI chat completion with model ${model}`);

    const response = await openai.chat.completions.create({
      model,
      messages
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No content in OpenAI response.');
    }

    logger.info('OpenAI chat completion generated successfully.');
    return content.trim();
  } catch (error) {
    logger.error('Error generating chat completion from OpenAI:', error.message);
    throw new ApiError(500, 'Failed to generate chat completion from OpenAI');
  }
};

/**
 * Generates book titles using OpenAI based on a specific prompt structure.
 * @param {string} storyDescription - The description of the story.
 * @param {string} genreLayer - The genre layer for the story.
 * @returns {Promise<Object>} A promise that resolves to an object with categorized book titles.
 */
const generateBookTitles = async (storyDescription, genreLayer) => {
  const prompt = await instructionModel.findOne({ name: "Book Title" })
  const systemPrompt = extractInstructionText(prompt, 'TitleSystemInstructions');

  //   const userPrompt = `
  //   ${extractInstructionText(prompt, 'BookTitleUser')}
  // INPUT
  // STORY_DESCRIPTION: ${storyDescription}
  // GENRE_LAYER: ${genreLayer}`;
  const variables = {
    storyDescription: storyDescription,
    genreLayer: genreLayer
  };


  const templateText = extractInstructionText(prompt, 'TitleUserInstructions');

  const userPrompt = new Function(...Object.keys(variables), `return \`${templateText}\`;`)(...Object.values(variables));

  console.log('User prompt (Book Title):');
  console.log(userPrompt);

  const fullPrompt = `${systemPrompt}\n\nUSER PROMPT:\n${userPrompt}`;
  const rawContent = await generateChatCompletion(systemPrompt, userPrompt);

  try {
    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      logger.error('No valid JSON object found in the AI response.');
      throw new OpenAIParseError('No valid JSON object found in the AI response.', fullPrompt, rawContent);
    }
    const jsonString = jsonMatch[0];
    const parsedContent = JSON.parse(jsonString);
    logger.info('Successfully parsed book titles from OpenAI response.');
    return { parsedContent, fullPrompt, rawContent };
  } catch (error) {
    logger.error('Failed to parse JSON from OpenAI response:', error.message);
    logger.debug('Raw content from OpenAI:', rawContent);
    throw new OpenAIParseError('Failed to parse book titles from AI response.', fullPrompt, rawContent);
  }
};

/**
 * Generates book tags using OpenAI based on a specific prompt structure.
 * @param {string} storyDescription - The description of the story.
 * @param {string} genreLayer - The genre layer for the story.
 * @returns {Promise<Object>} A promise that resolves to an object with categorized book tags.
 */
const generateBookTags = async (storyDescription, genreLayer, spiceLevel, ending) => {
  const prompt = await instructionModel.findOne({ name: "Book Tags" })
  const systemPrompt = extractInstructionText(prompt, 'TagsSystemInstructions');

  const variables = {
    storyDescription: storyDescription,
    genreLayer: genreLayer,
    spiceLevel: spiceLevel,
    ending: ending
  };

  //   const userPrompt = `
  //   ${extractInstructionText(prompt, 'BookTagsUser')}
  // USER INPUT  
  // [STORY_DESCRIPTION : ${storyDescription}]  
  // [GENRE_LAYER : ${genreLayer}]  
  // [SPICE_LEVEL : ${spiceLevel}]  
  // [ENDING_TYPE : ${ending}]  `;


  const templateText = extractInstructionText(prompt, 'TagsUserInstructions');

  const userPrompt = new Function(...Object.keys(variables), `return \`${templateText}\`;`)(...Object.values(variables));

  console.log('User prompt (Book Tags):');
  console.log(userPrompt);

  const fullPrompt = `${systemPrompt}\n\nUSER PROMPT:\n${userPrompt}`;
  const rawContent = await generateChatCompletion(systemPrompt, userPrompt);

  try {
    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      logger.error('No valid JSON object found in the AI response.');
      throw new OpenAIParseError('No valid JSON object found in the AI response.', fullPrompt, rawContent);
    }
    const jsonString = jsonMatch[0];
    const parsedContent = JSON.parse(jsonString);
    logger.info('Successfully parsed book titles from OpenAI response.');
    return { parsedContent, fullPrompt, rawContent };
  } catch (error) {
    logger.error('Failed to parse JSON from OpenAI response:', error.message);
    logger.debug('Raw content from OpenAI:', rawContent);
    throw new OpenAIParseError('Failed to parse book titles from AI response.', fullPrompt, rawContent);
  }
};

/**
 * Generates a book description using OpenAI.
 * @param {object} promptData - The data for the prompt.
 * @returns {Promise<object>} A promise that resolves to the generated description and the full prompt.
 */
const generateBookDescription = async (promptData) => {
  const { title, genre, variant, location, characters, trope_description, chapter_summaries } = promptData;
  const prompt = await instructionModel.findOne({ name: "Book Description" })

  const systemPrompt = extractInstructionText(prompt, 'DescriptionSystemInstructions');

  //   const userPrompt = `
  // INPUT
  // title: ${title}
  // genre: ${genre}
  // variant: ${variant}
  // location: ${location || ""}
  // characters: ${JSON.stringify(characters || "")} // if missing, use trope names; if none, use roles/professions
  // trope_description: ${trope_description}
  // chapter_summaries: ${chapter_summaries}

  // ${extractInstructionText(prompt, 'BookDescriptionUser')}
  // `;

  const variables = {
    title: title,
    trope_description: trope_description,
    genre: genre,
    variant: variant,
    chapter_summaries: chapter_summaries,
    location: location,
    characters: characters
  };

  const templateText = extractInstructionText(prompt, 'DescriptionUserInstructions');

  const userPrompt = new Function(...Object.keys(variables), `return \`${templateText}\`;`)(...Object.values(variables));

  console.log('User prompt (Book Description):');
  console.log(promptData);

  const fullPrompt = `${systemPrompt}\n\nUSER PROMPT:\n${userPrompt}`;
  const rawContent = await generateChatCompletion(systemPrompt, userPrompt);

  return { description: rawContent, fullPrompt, rawContent };
};

/**
 * Generates book chapters using OpenAI.
 * @param {object} promptData - The data for the prompt.
 * @returns {Promise<object>} A promise that resolves to the generated chapters and the full prompt.
 */
const generateBookChapters = async (promptData) => {
  const { title, trope_name, trope_description, chapter_beats, narrative, spice_level, ending_type, location, characters } = promptData;
  const prompt = await instructionModel.findOne({ name: "Book Chapters" })
  const systemPrompt = extractInstructionText(prompt, 'ChaptersSystemInstructions');


  //   const userPrompt = `INPUT
  // title: ${title}
  // trope_name: ${trope_name}
  // trope_description: ${trope_description}
  // chapter_beats: ${chapter_beats} # 3-chapter plan with key beats per chapter
  // Narrative: ${narrative} 
  // spice_level: ${spice_level} # apply intimacy baseline; step down if continuity breaks
  // ending_type: ${ending_type}
  // location: ${location || ''}
  // characters: ${JSON.stringify(characters) || '""'} # if absent, use trope names; if none, assign natural names and keep consistent

  // ${extractInstructionText(prompt, 'BookChaptersUser')}`;


  const variables = {
    title: title,
    trope_description: trope_description,
    trope_name: trope_name,
    chapter_beats: chapter_beats,
    narrative: narrative,
    spice_level: spice_level,
    ending_type: ending_type,
    location: location,
    characters: characters
  };

  const templateText = extractInstructionText(prompt, 'ChaptersUserInstructions');

  const userPrompt = new Function(...Object.keys(variables), `return \`${templateText}\`;`)(...Object.values(variables));

  console.log('User prompt (Book Chapters):');
  console.log(userPrompt);

  const fullPrompt = `${systemPrompt}\n\nUSER PROMPT:\n${userPrompt}`;
  const rawContent = await generateChatCompletion(systemPrompt, userPrompt);

  const stripFences = (s) =>
    (s || '')
      .replace(/```json\s*([\s\S]*?)```/gi, '$1')
      .replace(/```\s*([\s\S]*?)```/gi, '$1')
      .trim();

  const cleaned = stripFences(rawContent);
  let parsed;

  try {
    const match = cleaned.match(/\{[\s\S]*\}$/);
    const jsonText = (match ? match[0] : cleaned);
    parsed = JSON.parse(jsonText);

    if (!parsed || !Array.isArray(parsed.chapters) || parsed.chapters.length !== 3) {
      throw new Error('Invalid chapter JSON: "chapters" must be an array of 3 items.');
    }
  } catch (error) {
    logger.error('Failed to parse chapters JSON from OpenAI:', error.message);
    logger.debug('Raw content from OpenAI (chapters):', rawContent);
    throw new OpenAIParseError('Failed to parse chapters JSON from AI response.', fullPrompt, rawContent);
  }

  logger.info('Successfully parsed chapters JSON from OpenAI.');
  return { chaptersJSON: parsed, fullPrompt, rawContent };
};

const generateBookCoverPrompt = async (promptData) => {
  const { trope_description, chapter_summaries, ending_type, spice_level } = promptData;
  const prompt = await instructionModel.findOne({ name: "Book Cover" })

  const systemPrompt = ``;

    const variables = {
    trope_description: trope_description,
    chapter_summaries: chapter_summaries,
    spice_level: spice_level,
    ending_type: ending_type,
  };

//   const userPrompt = `Write a concise scene description (1–3 sentences) for a book cover.  
// Base it on the ${trope_description} and key ${chapter_summaries}.  
// Convey ${ending_type} and ${spice_level} through atmosphere, mood, body language, and proximity cues.  
// Do not reference art style, colors, or typography.  
// Output only the scene description, no extra commentary.`;

  const templateText = extractInstructionText(prompt, 'CoverPromptGeneration');

  const userPrompt = new Function(...Object.keys(variables), `return \`${templateText}\`;`)(...Object.values(variables));

  console.log('User prompt (Book Chapters):');
  console.log(userPrompt);

  const fullPrompt = `${systemPrompt}\n\nUSER PROMPT:\n${userPrompt}`;
  const rawContent = await generateChatCompletion(systemPrompt, userPrompt);

  return { description: rawContent, fullPrompt, rawContent };
};


module.exports = {
  generateChatCompletion,
  generateBookTitles,
  generateBookDescription,
  generateBookChapters,
  generateBookCoverPrompt,
  generateBookTags,
  extractInstructionText,
  OpenAIParseError
};
