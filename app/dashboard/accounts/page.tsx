import { Save } from "lucide-react";
import { createAccountAction, updateAccountSettingsAction } from "@/app/actions/accounts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAccountRows } from "@/lib/dashboard/data";

export const dynamic = "force-dynamic";

export default async function AccountsPage() {
  const accounts = await getAccountRows();

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>Accounts</CardTitle>
          <CardDescription>Database-driven configuration. Create and tune football accounts from this dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Style</TableHead>
                <TableHead>Threshold</TableHead>
                <TableHead>Run cap</TableHead>
                <TableHead>Limit</TableHead>
                <TableHead>Groq</TableHead>
                <TableHead>Buffer</TableHead>
                <TableHead>Sources</TableHead>
                <TableHead>Keywords</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-medium">{account.name}</TableCell>
                  <TableCell>{account.style}</TableCell>
                  <TableCell>{account.relevance_threshold}</TableCell>
                  <TableCell>{account.max_posts_per_run}</TableCell>
                  <TableCell>{account.character_limit}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Badge variant={account.groq_api_key ? "secondary" : "destructive"}>{account.groq_api_key ? "Configured" : "Missing"}</Badge>
                      <p className="text-xs text-muted-foreground">{account.groq_model ?? "Default model"}</p>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant={account.buffer_access_token ? "secondary" : "destructive"}>{account.buffer_access_token ? "Configured" : "Missing"}</Badge></TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                    <Badge variant={account.gnews_api_key ? "secondary" : "destructive"}>GNews</Badge>
                    <Badge variant={account.guardian_api_key ? "secondary" : "destructive"}>Guardian</Badge>
                    <Badge variant={account.api_football_key ? "secondary" : "destructive"}>Football</Badge>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-sm">{(account.keywords ?? []).slice(0, 5).join(", ")}</TableCell>
                  <TableCell><Badge variant={account.enabled ? "secondary" : "outline"}>{account.enabled ? "Enabled" : "Paused"}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Create Account</CardTitle>
          <CardDescription>Add a football account without opening Supabase.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createAccountAction} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Name" name="name" required />
              <Field label="Slug" name="slug" required placeholder="real-madrid" />
              <Field label="Style" name="style" required placeholder="Excited Madridista" />
              <Field label="Groq model" name="groqModel" required placeholder="llama-3.1-70b-versatile" />
              <Field label="Character limit" name="characterLimit" type="number" defaultValue={260} />
              <Field label="Relevance threshold" name="relevanceThreshold" type="number" min={0} max={10} defaultValue={7} />
              <Field label="Max posts per run" name="maxPostsPerRun" type="number" min={1} max={10} defaultValue={3} />
              <Field label="Groq temperature" name="groqTemperature" type="number" step="0.05" min={0} max={2} defaultValue={0.85} />
              <Field label="Groq max tokens" name="groqMaxTokens" type="number" min={32} max={1000} defaultValue={180} />
              <Field label="Run every minutes" name="scheduleIntervalMinutes" type="number" min={5} max={1440} defaultValue={15} />
              <Field label="Team ID" name="teamId" type="number" />
              <Field label="League ID" name="leagueId" type="number" />
              <Field label="Logo URL" name="logoUrl" />
            </div>
            <TextArea label="Keywords" name="keywords" required placeholder="Real Madrid, Mbappe, Bellingham" />
            <TextArea label="Hashtags" name="hashtags" required placeholder="#HalaMadrid, #RealMadrid" />
            <TextArea
              label="Relevance rules JSON"
              name="relevanceRules"
              required
              defaultValue={defaultRelevanceRulesJson}
              className="min-h-56 font-mono"
            />
            <TextArea label="Buffer channel IDs" name="bufferChannelIds" required placeholder="channel-id-1, channel-id-2" />
            <TextArea label="Schedule time slots" name="scheduleTimeSlots" placeholder="09:00, 13:30, 21:00. Leave blank to use interval only." />
            <TextArea label="Prompt template" name="promptTemplate" required placeholder="You are an excited fan..." />
            <div className="grid gap-3 sm:grid-cols-2">
              <SecretField label="Groq API key" name="groqApiKey" configured={false} />
              <SecretField label="Buffer access token" name="bufferAccessToken" configured={false} />
              <SecretField label="GNews API key" name="gnewsApiKey" configured={false} />
              <SecretField label="Guardian API key" name="guardianApiKey" configured={false} />
              <SecretField label="API-Football key" name="apiFootballKey" configured={false} />
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="gnewsEnabled" defaultChecked className="h-4 w-4" />
                GNews enabled
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="guardianEnabled" defaultChecked className="h-4 w-4" />
                Guardian fallback enabled
              </label>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="enabled" defaultChecked className="h-4 w-4" />
              Enabled
            </label>
            <Button type="submit" size="sm">
              <Save className="h-4 w-4" />
              Create account
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        {accounts.map((account) => (
          <Card key={`${account.id}-settings`}>
            <CardHeader>
              <CardTitle>{account.name}</CardTitle>
              <CardDescription>Per-account model, source, and publishing configuration.</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={updateAccountSettingsAction} className="space-y-4">
                <input type="hidden" name="id" value={account.id} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Name" name="name" defaultValue={account.name} />
                  <Field label="Slug" name="slug" defaultValue={account.slug} />
                  <Field label="Style" name="style" defaultValue={account.style} />
                  <Field label="Groq model" name="groqModel" defaultValue={account.groq_model ?? ""} placeholder="llama-3.1-70b-versatile" />
                  <Field label="Character limit" name="characterLimit" type="number" defaultValue={account.character_limit} />
                  <Field label="Relevance threshold" name="relevanceThreshold" type="number" min={0} max={10} defaultValue={account.relevance_threshold} />
                  <Field label="Max posts per run" name="maxPostsPerRun" type="number" min={1} max={10} defaultValue={account.max_posts_per_run} />
                  <Field label="Groq temperature" name="groqTemperature" type="number" step="0.05" min={0} max={2} defaultValue={account.groq_temperature ?? 0.85} />
                  <Field label="Groq max tokens" name="groqMaxTokens" type="number" min={32} max={1000} defaultValue={account.groq_max_tokens ?? 180} />
                  <Field label="Team ID" name="teamId" type="number" defaultValue={account.team_id ?? ""} />
                  <Field label="League ID" name="leagueId" type="number" defaultValue={account.league_id ?? ""} />
                  <Field label="Logo URL" name="logoUrl" defaultValue={account.logo_url ?? ""} />
                </div>

                <TextArea label="Keywords" name="keywords" defaultValue={(account.keywords ?? []).join(", ")} />
                <TextArea label="Hashtags" name="hashtags" defaultValue={(account.hashtags ?? []).join(", ")} />
                <TextArea
                  label="Relevance rules JSON"
                  name="relevanceRules"
                  defaultValue={formatJson(account.relevance_rules)}
                  className="min-h-56 font-mono"
                />
                <TextArea label="Buffer channel IDs" name="bufferChannelIds" defaultValue={(account.buffer_channel_ids?.length ? account.buffer_channel_ids : account.buffer_profiles ?? []).join(", ")} />
                <TextArea label="Schedule time slots" name="scheduleTimeSlots" defaultValue={(account.schedule_time_slots ?? []).join(", ")} placeholder="Leave blank to use interval only." />
                <TextArea label="New prompt template" name="promptTemplate" placeholder="Leave blank to keep current active prompt." />

                <div className="grid gap-3 sm:grid-cols-2">
                  <SecretField label="Groq API key" name="groqApiKey" configured={Boolean(account.groq_api_key)} clearName="clearGroqApiKey" />
                  <SecretField label="Buffer access token" name="bufferAccessToken" configured={Boolean(account.buffer_access_token)} clearName="clearBufferAccessToken" />
                  <SecretField label="GNews API key" name="gnewsApiKey" configured={Boolean(account.gnews_api_key)} clearName="clearGnewsApiKey" />
                  <SecretField label="Guardian API key" name="guardianApiKey" configured={Boolean(account.guardian_api_key)} clearName="clearGuardianApiKey" />
                  <SecretField label="API-Football key" name="apiFootballKey" configured={Boolean(account.api_football_key)} clearName="clearApiFootballKey" />
                </div>
                <Field label="Run every minutes" name="scheduleIntervalMinutes" type="number" min={5} max={1440} defaultValue={account.schedule_interval_minutes ?? 15} />

                <div className="flex flex-wrap items-center gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="enabled" defaultChecked={account.enabled} className="h-4 w-4" />
                    Enabled
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="gnewsEnabled" defaultChecked={account.gnews_enabled ?? true} className="h-4 w-4" />
                    GNews enabled
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="guardianEnabled" defaultChecked={account.guardian_enabled ?? true} className="h-4 w-4" />
                    Guardian fallback enabled
                  </label>
                </div>

                <Button type="submit" size="sm">
                  <Save className="h-4 w-4" />
                  Save account
                </Button>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Field(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string; name: string }) {
  const { label, ...inputProps } = props;
  return (
    <label className="space-y-1 text-sm">
      <span className="font-medium">{label}</span>
      <input className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" {...inputProps} />
    </label>
  );
}

function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; name: string }) {
  const { label, className, ...textareaProps } = props;
  return (
    <label className="space-y-1 text-sm">
      <span className="font-medium">{label}</span>
      <textarea
        className={`min-h-20 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring ${className ?? ""}`}
        {...textareaProps}
      />
    </label>
  );
}

function SecretField({ label, name, configured, clearName }: { label: string; name: string; configured: boolean; clearName?: string }) {
  return (
    <div className="space-y-2">
      <label className="space-y-1 text-sm">
        <span className="font-medium">{label}</span>
        <input
          name={name}
          type="password"
          placeholder={configured ? "Configured. Leave blank to keep." : "Paste key"}
          className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </label>
      {clearName ? (
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <input type="checkbox" name={clearName} className="h-4 w-4" />
          Clear stored value
        </label>
      ) : null}
    </div>
  );
}

const defaultRelevanceRulesJson = formatJson({
  categoryWeights: {
    transfer: 10,
    result: 10,
    fixture: 8,
    standing: 7,
    injury: 8,
    squad: 7,
    team_news: 6,
    quote: 7,
    academy: 3,
    other: 4
  },
  keywordBoost: 1,
  keywordBoosts: {},
  terms: [{ term: "world cup", score: 10 }],
  phraseBoosts: [{ phrase: "official", boost: 1 }]
});

function formatJson(value: unknown) {
  return JSON.stringify(value && typeof value === "object" ? value : {}, null, 2);
}
