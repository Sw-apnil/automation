import type { AccountConfig, FootballEvent } from "@/lib/events/types";

type GroqResponse = {
  choices?: { message?: { content?: string } }[];
};

export async function generatePostContent(event: FootballEvent, account: AccountConfig): Promise<string> {
  const apiKey = account.groqApiKey;
  if (!apiKey) throw new Error(`Missing Groq API key for account: ${account.slug}`);
  if (!account.groqModel) throw new Error(`Missing Groq model for account: ${account.slug}`);

  const prompt = buildPrompt(event, account);
  let content = postProcess(await callGroq(prompt, account, apiKey), account.characterLimit);

  if (isPoorQuality(content)) {
    const retryPrompt = `${prompt}

Rewrite once. Make it sound less robotic and less journalistic. Use a real fan voice, short punchy lines, and do not start with phrases like breaking news or according to reports.`;
    content = postProcess(await callGroq(retryPrompt, account, apiKey), account.characterLimit);
  }

  if (isPoorQuality(content)) throw new Error(`Groq output failed quality checks for account: ${account.slug}`);
  return content;
}

async function callGroq(prompt: string, account: AccountConfig, apiKey: string) {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: account.groqModel,
      messages: [
        {
          role: "system",
          content: `You write short social media posts for football fan accounts.

Rules that never change:
- One post per event. No lists, no threads, no markdown.
- Never invent facts. Only use what the event data provides.
- Never sound like a journalist or a news bot.
- React to the event — do not summarize it.
- No hashtags. They are added separately.
- Stay within the character limit given in the prompt.`
        },
        { role: "user", content: prompt }
      ],
      temperature: account.groqTemperature,
      max_tokens: account.groqMaxTokens
    })
  });

  if (!response.ok) throw new Error(`Groq failed: ${response.status} ${await response.text()}`);
  const payload = (await response.json()) as GroqResponse;
  return payload.choices?.[0]?.message?.content?.trim() ?? "";
}

function buildPrompt(event: FootballEvent, account: AccountConfig) {
  const template = account.promptTemplate ?? accountSpecificFallbackPrompt(account);
  return template
    .replaceAll("{accountName}", account.name)
    .replaceAll("{style}", account.style)
    .replaceAll("{characterLimit}", String(account.characterLimit))
    .replaceAll("{title}", event.title)
    .replaceAll("{description}", event.description ?? "No extra context")
    .replaceAll("{category}", event.category)
    .replaceAll("{source}", event.source)
    .replaceAll("{publishedAt}", event.publishedAt)
    .replaceAll("{keywords}", account.keywords.join(", "));
}

function accountSpecificFallbackPrompt(account: AccountConfig) {
  return `You are posting for {accountName} as a ${account.style}. React like a real football fan, not a reporter. Event data controls the substance: {title}. Context: {description}. Category: {category}. Keep it under {characterLimit} characters before hashtags.`;
}

function postProcess(content: string, limit: number) {
  const cleaned = content
    .replace(/```[\s\S]*?```/g, "")
    .replace(/^["']|["']$/g, "")
    .replace(/\b(breaking news|according to reports|in a recent development|it has been reported|as per sources)\b[:\s-]*/gi, "")
    .replace(/\b(this article|the report|journalist)\b/gi, "")
    .replace(/\s+#\w+/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return trimToLimit(cleaned, limit);
}

function isPoorQuality(content: string) {
  const lower = content.toLowerCase();
  if (content.length < 25) return true;
  if (/(breaking news|according to reports|in a recent development|as per sources)/i.test(content)) return true;
  if (lower.includes("as an ai") || lower.includes("i cannot")) return true;
  if (content.split(/\s+/).length > 80) return true;
  return false;
}

function trimToLimit(content: string, limit: number) {
  if (content.length <= limit) return content;
  return `${content.slice(0, Math.max(0, limit - 1)).trimEnd()}…`;
}
