import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, "..");

// Minimax API configuration
const MINIMAX_API_URL = "https://minimax-m2.com/api/v1/chat/completions";
const MINIMAX_MODEL = "MiniMax-M2.1";

// Load prompt templates
async function loadPrompt(filename) {
  const promptPath = path.join(ROOT_DIR, "prompts", filename);
  return await fs.readFile(promptPath, "utf-8");
}

// Load salons data
async function loadSalons() {
  const salonsPath = path.join(ROOT_DIR, "data", "salons.json");
  const data = await fs.readFile(salonsPath, "utf-8");
  return JSON.parse(data);
}

// Call Minimax LLM
async function callLLM(systemPrompt, userMessage) {
  const apiKey = process.env.MINIMAX_API_KEY;
  
  if (!apiKey) {
    throw new Error("MINIMAX_API_KEY environment variable is not set");
  }

  const response = await fetch(MINIMAX_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MINIMAX_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Minimax API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  
  if (data.choices && data.choices[0] && data.choices[0].message) {
    return data.choices[0].message.content;
  }
  
  throw new Error(`Unexpected Minimax response: ${JSON.stringify(data)}`);
}

// Parse JSON from LLM response
function parseJsonResponse(content, salonName) {
  try {
    // Try to extract JSON if wrapped in markdown code blocks
    const jsonMatch =
      content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : content;
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error(`Failed to parse JSON for ${salonName}:`, error.message);
    console.error("Raw response:", content);
    return null;
  }
}

// Generate email for a single salon
async function generateEmail(salon, emailPrompt, voiceGuide) {
  const systemPrompt = `${voiceGuide}\n\n---\n\n${emailPrompt}`;
  const userMessage = `Generate a personalized outreach email for this salon:\n\n${JSON.stringify(salon, null, 2)}`;

  const content = await callLLM(systemPrompt, userMessage);
  return parseJsonResponse(content, salon.name);
}

// Generate microsite content for a single salon
async function generateMicrositeContent(salon, micrositePrompt, voiceGuide) {
  const systemPrompt = `${voiceGuide}\n\n---\n\n${micrositePrompt}`;
  const userMessage = `Generate personalized microsite content for this salon:\n\n${JSON.stringify(salon, null, 2)}`;

  const content = await callLLM(systemPrompt, userMessage);
  return parseJsonResponse(content, salon.name);
}

// Main execution
async function main() {
  console.log("Loading prompts and data...");
  console.log(`Using Minimax model: ${MINIMAX_MODEL}`);

  // Load all resources
  const [voiceGuide, emailPrompt, micrositePrompt, salons] = await Promise.all([
    loadPrompt("mare_voice.md"),
    loadPrompt("email_generator.md"),
    loadPrompt("microsite_generator.md"),
    loadSalons(),
  ]);

  console.log(`Loaded ${salons.length} salons`);

  // Generate emails
  console.log("\n--- Generating Emails ---");
  const generatedEmails = [];

  for (const salon of salons) {
    console.log(`Generating email for: ${salon.name}`);
    try {
      const email = await generateEmail(salon, emailPrompt, voiceGuide);
      if (email) {
        generatedEmails.push({
          salon_id: salon.id,
          salon_name: salon.name,
          ...email,
        });
        console.log(`  Subject: ${email.subject}`);
      }
    } catch (error) {
      console.error(`  Error: ${error.message}`);
    }
  }

  // Generate microsite content
  console.log("\n--- Generating Microsite Content ---");
  const generatedMicrosites = [];

  for (const salon of salons) {
    console.log(`Generating microsite for: ${salon.name}`);
    try {
      const microsite = await generateMicrositeContent(
        salon,
        micrositePrompt,
        voiceGuide
      );
      if (microsite) {
        generatedMicrosites.push({
          salon_id: salon.id,
          salon_name: salon.name,
          ...microsite,
        });
        console.log(`  Headline: ${microsite.hero_headline}`);
      }
    } catch (error) {
      console.error(`  Error: ${error.message}`);
    }
  }

  // Save outputs
  const emailsPath = path.join(ROOT_DIR, "data", "generated_emails.json");
  const micrositesPath = path.join(
    ROOT_DIR,
    "data",
    "generated_microsite_content.json"
  );

  await fs.writeFile(emailsPath, JSON.stringify(generatedEmails, null, 2));
  await fs.writeFile(micrositesPath, JSON.stringify(generatedMicrosites, null, 2));

  console.log("\n--- Complete ---");
  console.log(`Emails saved to: ${emailsPath}`);
  console.log(`Microsites saved to: ${micrositesPath}`);
  console.log(
    `Generated ${generatedEmails.length} emails and ${generatedMicrosites.length} microsites`
  );
}

main().catch(console.error);
