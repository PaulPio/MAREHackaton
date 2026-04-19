import Anthropic from "@anthropic-ai/sdk";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, "..");

// Initialize Anthropic client
const anthropic = new Anthropic();

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

// Generate email for a single salon
async function generateEmail(salon, emailPrompt, voiceGuide) {
  const systemPrompt = `${voiceGuide}\n\n---\n\n${emailPrompt}`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `Generate a personalized outreach email for this salon:\n\n${JSON.stringify(salon, null, 2)}`,
      },
    ],
    system: systemPrompt,
  });

  const content = response.content[0].text;

  // Parse JSON from response
  try {
    // Try to extract JSON if wrapped in markdown code blocks
    const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error(`Failed to parse email JSON for ${salon.name}:`, error.message);
    console.error("Raw response:", content);
    return null;
  }
}

// Generate microsite content for a single salon
async function generateMicrositeContent(salon, micrositePrompt, voiceGuide) {
  const systemPrompt = `${voiceGuide}\n\n---\n\n${micrositePrompt}`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `Generate personalized microsite content for this salon:\n\n${JSON.stringify(salon, null, 2)}`,
      },
    ],
    system: systemPrompt,
  });

  const content = response.content[0].text;

  // Parse JSON from response
  try {
    const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error(`Failed to parse microsite JSON for ${salon.name}:`, error.message);
    console.error("Raw response:", content);
    return null;
  }
}

// Main execution
async function main() {
  console.log("Loading prompts and data...");

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
    const email = await generateEmail(salon, emailPrompt, voiceGuide);
    if (email) {
      generatedEmails.push({
        salon_id: salon.id,
        salon_name: salon.name,
        ...email,
      });
      console.log(`  Subject: ${email.subject}`);
    }
  }

  // Generate microsite content
  console.log("\n--- Generating Microsite Content ---");
  const generatedMicrosites = [];

  for (const salon of salons) {
    console.log(`Generating microsite for: ${salon.name}`);
    const microsite = await generateMicrositeContent(salon, micrositePrompt, voiceGuide);
    if (microsite) {
      generatedMicrosites.push({
        salon_id: salon.id,
        salon_name: salon.name,
        ...microsite,
      });
      console.log(`  Headline: ${microsite.hero_headline}`);
    }
  }

  // Save outputs
  const emailsPath = path.join(ROOT_DIR, "data", "generated_emails.json");
  const micrositesPath = path.join(ROOT_DIR, "data", "generated_microsite_content.json");

  await fs.writeFile(emailsPath, JSON.stringify(generatedEmails, null, 2));
  await fs.writeFile(micrositesPath, JSON.stringify(generatedMicrosites, null, 2));

  console.log("\n--- Complete ---");
  console.log(`Emails saved to: ${emailsPath}`);
  console.log(`Microsites saved to: ${micrositesPath}`);
  console.log(`Generated ${generatedEmails.length} emails and ${generatedMicrosites.length} microsites`);
}

main().catch(console.error);
