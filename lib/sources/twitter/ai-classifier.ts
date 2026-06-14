import type { AccountConfig, EventCategory } from "@/lib/events/types";

export type ClassificationResult = {
  isNewsworthy: boolean;
  category: EventCategory;
  confidence: number;
  reason: string;
};

type GroqClassificationResponse = {
  choices?: { message?: { content?: string } }[];
};

export async function classifyTweetNewsworthiness(
  tweetText: string,
  account: AccountConfig
): Promise<ClassificationResult> {
  const apiKey = account.groqApiKey;
  if (!apiKey) throw new Error(`Missing Groq API key for account: ${account.slug}`);
  if (!account.groqModel) throw new Error(`Missing Groq model for account: ${account.slug}`);

  const systemPrompt = `You are an AI assistant filtering tweets for a football fan account.
The account tracks: ${account.keywords.join(", ")}.

Your job is to read a tweet and determine if it is factual football news worth publishing, or if it is engagement farming, opinion, memes, or unrelated.

Respond ONLY with a valid JSON object with the following structure:
{
  "isNewsworthy": boolean,
  "category": "transfer" | "injury" | "contract" | "manager" | "lineup" | "match_result" | "official_statement" | "tournament_news" | "engagement" | "opinion" | "meme" | "other",
  "confidence": number (0 to 100),
  "reason": "Brief explanation"
}`;

  const userPrompt = `Tweet: "${tweetText}"`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: account.groqModel,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.1, // low temperature for consistent JSON classification
        max_tokens: 150
      })
    });

    if (!response.ok) {
      throw new Error(`Groq classification failed: ${response.status} ${await response.text()}`);
    }

    const payload = (await response.json()) as GroqClassificationResponse;
    const content = payload.choices?.[0]?.message?.content?.trim() || "{}";
    
    const parsed = JSON.parse(content) as ClassificationResult;
    
    // Ensure category is valid EventCategory, fallback to 'other' if weird
    const validCategories = [
      "transfer", "injury", "contract", "manager", "lineup", "match_result", 
      "official_statement", "tournament_news", "engagement", "opinion", "meme", "other"
    ];
    
    if (!validCategories.includes(parsed.category)) {
      parsed.category = "other";
    }

    // Force non-newsworthy if it's engagement/meme/opinion regardless of what AI says
    if (["engagement", "opinion", "meme"].includes(parsed.category)) {
      parsed.isNewsworthy = false;
    }

    return parsed;

  } catch (error) {
    console.error("Failed to classify tweet:", error);
    // Fail closed: if we can't classify, we skip the tweet.
    return {
      isNewsworthy: false,
      category: "other",
      confidence: 0,
      reason: "Classification failed"
    };
  }
}
