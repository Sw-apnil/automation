import { chromium, type Browser, type Page } from "playwright-core";

export type RawTweet = {
  tweetId: string;
  username: string;
  text: string;
  createdAt: string | null;
  isRetweet: boolean;
  isReply: boolean;
  isQuote: boolean;
  mediaUrls: string[];
  raw: Record<string, unknown>;
};

export class PlaywrightCollector {
  async fetchTweets(username: string, sinceId?: string | null): Promise<RawTweet[]> {
    let browser: Browser | null = null;
    let page: Page | null = null;

    try {
      // Find executable path based on OS (macOS default path or linux)
      // Note: For production, this path needs to be configured depending on the Docker/VPS environment.
      const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || 
        (process.platform === 'darwin' ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : '/usr/bin/chromium-browser');

      browser = await chromium.launch({
        headless: true,
        executablePath,
        args: [
          "--disable-blink-features=AutomationControlled",
          "--disable-dev-shm-usage",
          "--no-sandbox",
          "--disable-setuid-sandbox"
        ]
      });

      const context = await browser.newContext({
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        viewport: { width: 1280, height: 800 },
        deviceScaleFactor: 1,
      });

      page = await context.newPage();
      
      // Setup simple request interception to block images/media to speed up loading
      await page.route("**/*", (route) => {
        const type = route.request().resourceType();
        if (["image", "media", "font"].includes(type)) {
          route.abort();
        } else {
          route.continue();
        }
      });

      await page.goto(`https://x.com/${username}`, { waitUntil: "domcontentloaded", timeout: 30000 });
      
      // Wait for tweets to load
      await page.waitForSelector('article[data-testid="tweet"]', { timeout: 15000 }).catch(() => null);

      // We inject a script to extract tweet text to avoid complex DOM parsing logic inside the Node context.
      // This is a basic extraction. X.com DOM is complex.
      const extractedTweets = await page.evaluate(() => {
        const articles = document.querySelectorAll('article[data-testid="tweet"]');
        const results: Record<string, unknown>[] = [];
        
        articles.forEach((article) => {
          const links = Array.from(article.querySelectorAll('a[href*="/status/"]'));
          const statusLink = links.find(l => l.getAttribute('href')?.includes('/status/'))?.getAttribute('href');
          
          if (!statusLink) return;
          
          const parts = statusLink.split('/');
          const tweetId = parts[parts.length - 1];
          const tweetUsername = parts[1];
          
          const textContent = article.querySelector('div[data-testid="tweetText"]')?.textContent || "";
          const timeEl = article.querySelector('time');
          const createdAt = timeEl ? timeEl.getAttribute('datetime') : null;
          
          const isRetweet = article.textContent?.includes('reposted') || false;
          
          results.push({
            tweetId,
            username: tweetUsername,
            text: textContent,
            createdAt,
            isRetweet,
            isReply: false, // simplified for V1
            isQuote: false, // simplified for V1
            mediaUrls: [],
            raw: {}
          });
        });
        
        return results;
      });

      const rawTweets: RawTweet[] = [];
      for (const extracted of extractedTweets) {
        const tweet = extracted as unknown as RawTweet;
        
        // Stop if we hit the cursor
        if (sinceId && tweet.tweetId === sinceId) {
          break;
        }
        
        // Skip retweets from other users for this fan account scope (usually we want their own tweets)
        if (tweet.isRetweet && tweet.username.toLowerCase() !== username.toLowerCase()) {
          continue;
        }

        rawTweets.push(tweet);
      }

      return rawTweets;
      
    } catch (error) {
      console.error(`Playwright collector error for ${username}:`, error);
      throw error;
    } finally {
      if (page) await page.close().catch(() => {});
      if (browser) await browser.close().catch(() => {});
    }
  }
}
