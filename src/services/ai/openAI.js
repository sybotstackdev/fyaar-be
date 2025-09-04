require('dotenv').config();
const OpenAI = require('openai');
const logger = require('../../utils/logger');
const ApiError = require('../../utils/ApiError');

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

/**
 * Generate a chat completion using OpenAI.
 * @param {string} systemPrompt - The system prompt defining the assistant's behavior.
 * @param {string} userPrompt - The user's prompt.
 * @param {string} model - The model to use for the completion (e.g., 'gpt-4', 'gpt-3.5-turbo', 'o3-mini'). Defaults to 'gpt-4'.
 * @returns {Promise<string>} The generated content from the assistant.
 */
const generateChatCompletion = async (systemPrompt, userPrompt, model = 'o3-mini') => {
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
  const systemPrompt = `You are a professional publishing assistant. Follow these universal rules strictly for book title
generation:
- Titles must be original: do not duplicate or closely copy famous books, films, or TV brands.
- No profanity, sexual slang, graphic violence, or extreme kinks in titles.
- No names or references to gods, deities, sacred texts, temples, mosques, churches, rituals,
caste identities, politics, or nationalism.
- Avoid cultural caricatures, stereotypes, or discriminatory language.
- No meta commentary, filler words, subtitles, numbering, or format breaks.
- Avoid clichés/overused words in titles: forever, always, passion, destiny, heart, soul, dark,
legend, silent, girl, missing.
- Titles must remain under 5 words and follow the exact output format requested.`;

  const userPrompt = `You are a professional book-naming editor specializing in international romance and women’s
fiction.
INPUT
STORY_DESCRIPTION: ${storyDescription}
GENRE_LAYER: ${genreLayer}
TASK
Step 1 (internal): Extract motifs, emotional themes, and unique phrases. Do not output this step.
Step 2: Generate 9 book titles divided into 3 categories:
1) poetic_metaphorical → lyrical, image-driven, emotional (≤4 words)
2) conversational_modern → casual, quotable, playful (≤4 words)
3) ironic_bittersweet → paradoxical or layered tone (≤4 words)
OUTPUT FORMAT
{
"poetic_metaphorical": ["t1", "t2", "t3"],
"conversational_modern": ["t4", "t5", "t6"],
"ironic_bittersweet": ["t7", "t8", "t9"]
}
HARD RULES
- Keep every title under 5 words.
- Do not use restricted words listed in system rules.
- Each title must have distinct rhythm/structure (avoid repeating “The [Noun] of [Noun]”).
- Titles should align with GENRE_LAYER while still appealing to contemporary
romance/women’s fiction readers (think Colleen Hoover, Emily Henry, Taylor Jenkins Reid, Sally
Rooney).
- Cultural sensitivity required; optional subtle Indian-English imagery is allowed (monsoon,
verandas, trains, courtyards, mango, chai) but keep wording universal/international.`;

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

  const systemPrompt = `You are a professional publishing editor who writes book descriptions (back-cover blurbs) for international markets.
Follow these rules strictly:
- All characters must be 21+ (no minors).
- No incest, teacher/student, intoxication, coercion, non-consent/dub-con, humiliation, bestiality, medical/knife/needle play, or porn-industry settings.
- No profanity, sexual slang, extreme kinks, or graphic violence.
- No references to gods, deities, sacred texts, temples, mosques, churches, rituals, worship, caste identities, politics, or nationalism.
- No stereotypes, cultural caricatures, or discriminatory language.
- No clichés (“heart skipped a beat,” “souls entwined,” etc.).
- No meta commentary, filler text, or author notes.
- No breaking format: return output exactly as instructed.`;

  const userPrompt = `INPUT
title: ${title}
genre: ${genre}
variant: ${variant}
location: ${location || ""}
characters: ${JSON.stringify(characters || "")} // if missing, use trope names; if none, use roles/professions
trope_description: ${trope_description}
chapter_summaries: ${chapter_summaries}

TASK
Step 1 (internal): Extract conflict, romantic tension, emotional stakes, motifs, and character dynamics. Weave in location if provided (1–2 times). Do not output this step.
Step 2: Write ONE description (~100 words) in the specified variant style.

HARD RULES
- Length: ~100 words, no labels or numbering.
- Use provided or fallback character names naturally (2–3 mentions max).
- Mention location (if provided) 1–2 times max.
- Do not reveal chapter structure, POV, or spice level.
- Do not spoil the ending.
- Output only the description, nothing else.`;

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

  const systemPrompt = `SYSTEM: ROMANCE SHORT STORY ENGINE — CHAPTER GENERATION

You are a professional romance author creating immersive, emotionally intense stories for an international audience.
Follow these universal rules strictly:
- All characters must be 21+.
- No incest, teacher/student, intoxication, coercion, non-consent/dub-con, humiliation, bestiality, medical/knife/needle play, porn-industry settings.
- No profanity, extreme kinks, or graphic violence.
- No references to gods, deities, sacred texts, temples, mosques, churches, rituals, worship, caste identities, politics, or nationalism.
- No stereotypes, cultural caricatures, or discriminatory language.
- No clichés (“heart skipped a beat,” “souls entwined,” etc.).
- No meta commentary, filler text, watermarks, or author notes.
- No format breaks (output prose only, follow requested structure).`;

  const userPrompt = `INPUT
title: ${title}
trope_name: ${trope_name}
trope_description: ${trope_description}
chapter_beats: ${chapter_beats} # 3-chapter plan with key beats per chapter
Narrative: ${narrative} 
spice_level: ${spice_level} # apply intimacy baseline; step down if continuity breaks
ending_type: ${ending_type}
location: ${location || ''}
characters: ${JSON.stringify(characters) || '""'} # if absent, use trope names; if none, assign natural names and keep consistent

SPECIFICATIONS
- Chapters: 3 (long-form, immersive)
- Length: 5000–9000 characters each (~1000–1500 words)
- Follow pov_pattern per chapter_beats
- Apply spice_level with explicit consent and aftercare where required
- Maintain strict continuity of names, setting, timeline, and world details across chapters

TASK
Write all 3 chapters in sequence. Each chapter must:
- Start with a short *tagline* (sets mood).
- Follow the assigned POV for that chapter.
- Include intimacy per the spice baseline; step down one level if continuity or consent would break.
- End with a *cliffhanger or resolution line* that fits the ending_type.
- Flow naturally into the next chapter.

OUTPUT FORMAT
Return ONLY valid JSON. Do not include markdown fences, commentary, or labels.
{
  "chapters": [
    { "title": "string", "tagline": "string", "prose": "string" },
    { "title": "string", "tagline": "string", "prose": "string" },
    { "title": "string", "tagline": "string", "prose": "string" }
  ]
}`;

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

  const systemPrompt = ``;

  const userPrompt = `Write a concise scene description (1–3 sentences) for a book cover.  
Base it on the ${trope_description} and key ${chapter_summaries}.  
Convey ${ending_type} and ${spice_level} through atmosphere, mood, body language, and proximity cues.  
Do not reference art style, colors, or typography.  
Output only the scene description, no extra commentary.`;

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
  OpenAIParseError
};
