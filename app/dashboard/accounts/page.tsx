import { Save, Settings2, Plus, CheckCircle2, XCircle, Lock, Globe, Cpu, Zap, Key } from "lucide-react";
import { createAccountAction, updateAccountSettingsAction } from "@/app/actions/accounts";
import { ActionForm, SubmitButton } from "@/components/ui/action-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { getAccountRows } from "@/lib/dashboard/data";

export const dynamic = "force-dynamic";

export default async function AccountsPage() {
  const accounts = await getAccountRows();

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/25 bg-violet-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-violet-400">
            <Settings2 className="h-2.5 w-2.5" />
            Configuration
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">
          <span className="gradient-text-purple">Football</span>{" "}
          <span className="text-foreground/90">Accounts</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Database-driven configuration. Create and tune football fan accounts from this dashboard.
        </p>
      </div>

      {/* Accounts Overview Table */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Account Overview</CardTitle>
              <CardDescription>All configured football fan accounts and their API health status.</CardDescription>
            </div>
            {accounts.length > 0 && (
              <span className="rounded-lg border border-border/40 bg-muted/20 px-3 py-1.5 text-xs font-semibold tabular-nums text-foreground/60">
                {accounts.length} account{accounts.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {accounts.length === 0 ? (
            <EmptyState
              title="No accounts configured"
              description="Create your first football fan account using the form below."
              icon={<Settings2 className="h-6 w-6" />}
              className="py-8"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account</TableHead>
                  <TableHead>Style</TableHead>
                  <TableHead>Settings</TableHead>
                  <TableHead>AI</TableHead>
                  <TableHead>Buffer</TableHead>
                  <TableHead>Sources</TableHead>
                  <TableHead>Keywords</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        {account.logo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={account.logo_url}
                            alt={account.name}
                            className="h-7 w-7 rounded-lg object-contain bg-muted/50"
                          />
                        ) : (
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-border/40">
                            <Zap className="h-3.5 w-3.5 text-emerald-400" />
                          </div>
                        )}
                        <div>
                          <p className="text-[13px] font-semibold text-foreground/90">{account.name}</p>
                          <p className="text-[10px] text-muted-foreground/60">{account.slug}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground/70 max-w-[120px] line-clamp-1">
                        {account.style}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5 text-[10px] text-muted-foreground/60">
                        <span>Score ≥ {account.relevance_threshold}</span>
                        <span>{account.max_posts_per_run} posts/run</span>
                        <span>{account.character_limit} chars</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <ApiStatus configured={account.groq_api_key} label="Groq" />
                        {account.groq_model && (
                          <p className="text-[9px] text-muted-foreground/50 font-mono ml-4">
                            {account.groq_model.split("-").slice(0, 2).join("-")}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <ApiStatus configured={account.buffer_access_token} label="Buffer" />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <ApiStatus configured={account.gnews_api_key} label="GNews" size="xs" />
                        <ApiStatus configured={account.guardian_api_key} label="Guardian" size="xs" />
                        <ApiStatus configured={account.api_football_key} label="Football API" size="xs" />
                        <ApiStatus configured={account.twitter_username != null && account.twitter_username !== ""} label="Twitter/X" size="xs" />
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[160px]">
                      <p className="text-[10px] text-muted-foreground/60 line-clamp-2">
                        {(account.keywords ?? []).slice(0, 5).join(", ")}
                        {(account.keywords ?? []).length > 5 && ` +${(account.keywords ?? []).length - 5}`}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge variant={account.enabled ? "success" : "ghost"}>
                        {account.enabled ? "Active" : "Paused"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Account Form */}
      <Card className="border-border/50 border-dashed">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-border/40">
              <Plus className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">Create New Account</CardTitle>
              <CardDescription>Add a football fan account without opening Supabase.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ActionForm 
            action={createAccountAction} 
            className="space-y-6"
            successMessage="Account created successfully!"
            resetOnSuccess
          >
            <FormSection title="Basic Info" icon={<Globe className="h-3.5 w-3.5" />}>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Field label="Account Name" name="name" required placeholder="Real Madrid FC" />
                <Field label="Slug" name="slug" required placeholder="real-madrid" />
                <Field label="Content Style" name="style" required placeholder="Excited Madridista fan" />
                <Field label="Character Limit" name="characterLimit" type="number" defaultValue={260} />
                <Field label="Relevance Threshold" name="relevanceThreshold" type="number" min={0} max={10} defaultValue={7} />
                <Field label="Max Posts Per Run" name="maxPostsPerRun" type="number" min={1} max={10} defaultValue={3} />
                <Field label="Team ID (API-Football)" name="teamId" type="number" />
                <Field label="League ID (API-Football)" name="leagueId" type="number" />
                <Field label="Logo URL" name="logoUrl" placeholder="https://..." />
                <Field label="Twitter/X Username" name="twitterUsername" placeholder="FabrizioRomano" />
              </div>
            </FormSection>

            <FormSection title="AI Configuration" icon={<Cpu className="h-3.5 w-3.5" />}>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Field label="Groq Model" name="groqModel" required placeholder="llama-3.1-70b-versatile" />
                <Field label="Temperature" name="groqTemperature" type="number" step="0.05" min={0} max={2} defaultValue={0.85} />
                <Field label="Max Tokens" name="groqMaxTokens" type="number" min={32} max={1000} defaultValue={180} />
                <Field label="Run Every (minutes)" name="scheduleIntervalMinutes" type="number" min={5} max={1440} defaultValue={15} />
                <Field label="Twitter Min Confidence" name="twitterMinConfidence" type="number" min={0} max={100} defaultValue={70} />
              </div>
            </FormSection>

            <FormSection title="Content" icon={<Zap className="h-3.5 w-3.5" />}>
              <div className="grid gap-3">
                <TextArea label="Keywords (comma-separated)" name="keywords" required placeholder="Real Madrid, Mbappe, Bellingham" />
                <TextArea label="Hashtags (comma-separated)" name="hashtags" required placeholder="#HalaMadrid, #RealMadrid" />
                <TextArea
                  label="Relevance Rules (JSON)"
                  name="relevanceRules"
                  required
                  defaultValue={defaultRelevanceRulesJson}
                  className="min-h-48 font-mono text-[11px]"
                />
                <TextArea label="Buffer Channel IDs (comma-separated)" name="bufferChannelIds" required placeholder="channel-id-1, channel-id-2" />
                <TextArea label="Schedule Time Slots" name="scheduleTimeSlots" placeholder="09:00, 13:30, 21:00 — leave blank for interval only" />
                <TextArea label="Prompt Template" name="promptTemplate" required placeholder="You are an excited fan who creates engaging football content..." />
              </div>
            </FormSection>

            <FormSection title="API Keys" icon={<Key className="h-3.5 w-3.5" />}>
              <div className="grid gap-3 sm:grid-cols-2">
                <SecretField label="Groq API Key" name="groqApiKey" configured={false} />
                <SecretField label="Buffer Access Token" name="bufferAccessToken" configured={false} />
                <SecretField label="GNews API Key" name="gnewsApiKey" configured={false} />
                <SecretField label="Guardian API Key" name="guardianApiKey" configured={false} />
                <SecretField label="API-Football Key" name="apiFootballKey" configured={false} />
              </div>
            </FormSection>

            <div className="rounded-xl border border-border/40 bg-muted/20 p-4 space-y-2">
              <p className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">Data Sources</p>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm text-foreground/80 cursor-pointer">
                  <input type="checkbox" name="apiFootballEnabled" defaultChecked className="h-4 w-4 rounded accent-emerald-500" />
                  <span>API-Football enabled</span>
                </label>
                <label className="flex items-center gap-2 text-sm text-foreground/80 cursor-pointer">
                  <input type="checkbox" name="gnewsEnabled" defaultChecked className="h-4 w-4 rounded accent-emerald-500" />
                  <span>GNews enabled</span>
                </label>
                <label className="flex items-center gap-2 text-sm text-foreground/80 cursor-pointer">
                  <input type="checkbox" name="guardianEnabled" defaultChecked className="h-4 w-4 rounded accent-emerald-500" />
                  <span>Guardian fallback enabled</span>
                </label>
                <label className="flex items-center gap-2 text-sm text-foreground/80 cursor-pointer">
                  <input type="checkbox" name="twitterEnabled" defaultChecked={false} className="h-4 w-4 rounded accent-emerald-500" />
                  <span>Twitter/X enabled</span>
                </label>
                <label className="flex items-center gap-2 text-sm text-foreground/80 cursor-pointer">
                  <input type="checkbox" name="enabled" defaultChecked className="h-4 w-4 rounded accent-emerald-500" />
                  <span>Account enabled</span>
                </label>
              </div>
            </div>

            <SubmitButton 
              type="submit" 
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/20 shadow-glow-emerald hover:shadow-[0_0_20px_rgba(52,211,153,0.3)] h-9 px-4 py-2"
            >
              <Plus className="h-4 w-4" />
              Create Account
            </SubmitButton>
          </ActionForm>
        </CardContent>
      </Card>

      {/* Per-Account Settings */}
      {accounts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border/60 to-transparent" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
              Per-Account Settings
            </p>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border/60 to-transparent" />
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            {accounts.map((account) => (
              <Card key={`${account.id}-settings`} className="border-border/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    {account.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={account.logo_url}
                        alt={account.name}
                        className="h-8 w-8 rounded-lg object-contain bg-muted/50"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-border/40">
                        <Zap className="h-3.5 w-3.5 text-emerald-400" />
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-sm font-semibold text-foreground/90">{account.name}</CardTitle>
                      <CardDescription>Per-account model, source, and publishing configuration.</CardDescription>
                    </div>
                    <div className="ml-auto">
                      <Badge variant={account.enabled ? "success" : "ghost"}>
                        {account.enabled ? "Active" : "Paused"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ActionForm 
                    action={updateAccountSettingsAction} 
                    className="space-y-5"
                    successMessage="Settings updated successfully!"
                  >
                    <input type="hidden" name="id" value={account.id} />

                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="Name" name="name" defaultValue={account.name} />
                      <Field label="Slug" name="slug" defaultValue={account.slug} />
                      <Field label="Style" name="style" defaultValue={account.style} />
                      <Field label="Groq Model" name="groqModel" defaultValue={account.groq_model ?? ""} placeholder="llama-3.1-70b-versatile" />
                      <Field label="Character Limit" name="characterLimit" type="number" defaultValue={account.character_limit} />
                      <Field label="Relevance Threshold" name="relevanceThreshold" type="number" min={0} max={10} defaultValue={account.relevance_threshold} />
                      <Field label="Max Posts Per Run" name="maxPostsPerRun" type="number" min={1} max={10} defaultValue={account.max_posts_per_run} />
                      <Field label="Groq Temperature" name="groqTemperature" type="number" step="0.05" min={0} max={2} defaultValue={account.groq_temperature ?? 0.85} />
                      <Field label="Groq Max Tokens" name="groqMaxTokens" type="number" min={32} max={1000} defaultValue={account.groq_max_tokens ?? 180} />
                      <Field label="Team ID" name="teamId" type="number" defaultValue={account.team_id ?? ""} />
                      <Field label="League ID" name="leagueId" type="number" defaultValue={account.league_id ?? ""} />
                      <Field label="Logo URL" name="logoUrl" defaultValue={account.logo_url ?? ""} />
                      <Field label="Twitter/X Username" name="twitterUsername" defaultValue={account.twitter_username ?? ""} />
                    </div>

                    <div className="grid gap-3">
                      <TextArea label="Keywords" name="keywords" defaultValue={(account.keywords ?? []).join(", ")} />
                      <TextArea label="Hashtags" name="hashtags" defaultValue={(account.hashtags ?? []).join(", ")} />
                      <TextArea
                        label="Relevance Rules (JSON)"
                        name="relevanceRules"
                        defaultValue={formatJson(account.relevance_rules)}
                        className="min-h-48 font-mono text-[11px]"
                      />
                      <TextArea
                        label="Buffer Channel IDs"
                        name="bufferChannelIds"
                        defaultValue={(
                          account.buffer_channel_ids?.length
                            ? account.buffer_channel_ids
                            : account.buffer_profiles ?? []
                        ).join(", ")}
                      />
                      <TextArea
                        label="Schedule Time Slots"
                        name="scheduleTimeSlots"
                        defaultValue={(account.schedule_time_slots ?? []).join(", ")}
                        placeholder="Leave blank to use interval only."
                      />
                      <TextArea
                        label="New Prompt Template"
                        name="promptTemplate"
                        placeholder="Leave blank to keep current active prompt."
                      />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <SecretField label="Groq API Key" name="groqApiKey" configured={Boolean(account.groq_api_key)} clearName="clearGroqApiKey" />
                      <SecretField label="Buffer Access Token" name="bufferAccessToken" configured={Boolean(account.buffer_access_token)} clearName="clearBufferAccessToken" />
                      <SecretField label="GNews API Key" name="gnewsApiKey" configured={Boolean(account.gnews_api_key)} clearName="clearGnewsApiKey" />
                      <SecretField label="Guardian API Key" name="guardianApiKey" configured={Boolean(account.guardian_api_key)} clearName="clearGuardianApiKey" />
                      <SecretField label="API-Football Key" name="apiFootballKey" configured={Boolean(account.api_football_key)} clearName="clearApiFootballKey" />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="Run Every (minutes)" name="scheduleIntervalMinutes" type="number" min={5} max={1440} defaultValue={account.schedule_interval_minutes ?? 15} />
                      <Field label="Twitter Min Confidence" name="twitterMinConfidence" type="number" min={0} max={100} defaultValue={account.twitter_min_confidence ?? 70} />
                    </div>

                    <div className="rounded-xl border border-border/40 bg-muted/20 p-4 space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground/50">Toggle Settings</p>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <label className="flex items-center gap-2 text-sm text-foreground/80 cursor-pointer">
                          <input type="checkbox" name="apiFootballEnabled" defaultChecked={account.api_football_enabled ?? true} className="h-4 w-4 rounded accent-emerald-500" />
                          <span>API-Football enabled</span>
                        </label>
                        <label className="flex items-center gap-2 text-sm text-foreground/80 cursor-pointer">
                          <input type="checkbox" name="enabled" defaultChecked={account.enabled} className="h-4 w-4 rounded accent-emerald-500" />
                          <span>Account enabled</span>
                        </label>
                        <label className="flex items-center gap-2 text-sm text-foreground/80 cursor-pointer">
                          <input type="checkbox" name="gnewsEnabled" defaultChecked={account.gnews_enabled ?? true} className="h-4 w-4 rounded accent-emerald-500" />
                          <span>GNews enabled</span>
                        </label>
                        <label className="flex items-center gap-2 text-sm text-foreground/80 cursor-pointer">
                          <input type="checkbox" name="guardianEnabled" defaultChecked={account.guardian_enabled ?? true} className="h-4 w-4 rounded accent-emerald-500" />
                          <span>Guardian fallback</span>
                        </label>
                        <label className="flex items-center gap-2 text-sm text-foreground/80 cursor-pointer">
                          <input type="checkbox" name="twitterEnabled" defaultChecked={account.twitter_enabled ?? false} className="h-4 w-4 rounded accent-emerald-500" />
                          <span>Twitter/X enabled</span>
                        </label>
                      </div>
                    </div>

                    <SubmitButton 
                      type="submit" 
                      className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/20 shadow-glow-emerald hover:shadow-[0_0_20px_rgba(52,211,153,0.3)] h-9 px-4 py-2"
                    >
                      <Save className="h-3.5 w-3.5" />
                      Save Changes
                    </SubmitButton>
                  </ActionForm>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Helper Components ─────────────────────────────────────────────────────

function ApiStatus({ configured, label, size = "sm" }: { configured: boolean; label: string; size?: "sm" | "xs" }) {
  return (
    <div className={`flex items-center gap-1 ${size === "xs" ? "text-[10px]" : "text-xs"}`}>
      {configured ? (
        <CheckCircle2 className={`flex-shrink-0 text-emerald-400 ${size === "xs" ? "h-2.5 w-2.5" : "h-3 w-3"}`} />
      ) : (
        <XCircle className={`flex-shrink-0 text-red-400 ${size === "xs" ? "h-2.5 w-2.5" : "h-3 w-3"}`} />
      )}
      <span className={configured ? "text-foreground/70" : "text-muted-foreground/50"}>{label}</span>
    </div>
  );
}

function FormSection({
  title,
  icon,
  children
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {icon && (
          <span className="flex h-5 w-5 items-center justify-center rounded bg-muted/60 text-muted-foreground">
            {icon}
          </span>
        )}
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">{title}</p>
        <div className="h-px flex-1 bg-border/40" />
      </div>
      {children}
    </div>
  );
}

function Field(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string; name: string }) {
  const { label, ...inputProps } = props;
  return (
    <label className="space-y-1.5 text-sm">
      <span className="text-xs font-medium text-foreground/70">{label}</span>
      <input
        className="h-9 w-full rounded-lg border border-border/60 bg-input/50 px-3 text-sm text-foreground/90 placeholder:text-muted-foreground/40 outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-primary/30 focus:bg-muted/40"
        {...inputProps}
      />
    </label>
  );
}

function TextArea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; name: string }
) {
  const { label, className, ...textareaProps } = props;
  return (
    <label className="space-y-1.5 text-sm">
      <span className="text-xs font-medium text-foreground/70">{label}</span>
      <textarea
        className={`min-h-20 w-full rounded-lg border border-border/60 bg-input/50 px-3 py-2 text-sm text-foreground/90 placeholder:text-muted-foreground/40 outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-primary/30 focus:bg-muted/40 ${className ?? ""}`}
        {...textareaProps}
      />
    </label>
  );
}

function SecretField({
  label,
  name,
  configured,
  clearName
}: {
  label: string;
  name: string;
  configured: boolean;
  clearName?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="space-y-1.5 text-sm">
        <div className="flex items-center gap-1.5">
          <Lock className="h-2.5 w-2.5 text-muted-foreground/50" />
          <span className="text-xs font-medium text-foreground/70">{label}</span>
          {configured && (
            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-400">
              Configured
            </span>
          )}
        </div>
        <input
          name={name}
          type="password"
          placeholder={configured ? "Leave blank to keep existing key" : "Paste API key here"}
          className="h-9 w-full rounded-lg border border-border/60 bg-input/50 px-3 text-sm text-foreground/90 placeholder:text-muted-foreground/40 outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-primary/30 focus:bg-muted/40"
        />
      </label>
      {clearName && (
        <label className="flex items-center gap-2 text-[11px] text-muted-foreground/50 cursor-pointer">
          <input type="checkbox" name={clearName} className="h-3 w-3 rounded accent-red-500" />
          Clear stored value
        </label>
      )}
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
