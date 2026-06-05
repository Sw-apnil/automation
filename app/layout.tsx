import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, Bot, Clock, ListChecks, Newspaper, Send, Settings } from "lucide-react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Football Social Automation",
  description: "AI-powered football social media publishing engine."
};

const nav = [
  { href: "/dashboard", label: "Overview", icon: BarChart3 },
  { href: "/dashboard/sources", label: "Sources", icon: Newspaper },
  { href: "/dashboard/queue", label: "Queue", icon: ListChecks },
  { href: "/dashboard/published", label: "Published", icon: Send },
  { href: "/dashboard/analytics", label: "Analytics", icon: Clock },
  { href: "/dashboard/accounts", label: "Accounts", icon: Settings }
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen">
          <aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-white/85 px-4 py-5 backdrop-blur lg:block">
            <Link href="/dashboard" className="flex items-center gap-3 px-2">
              <span className="grid h-10 w-10 place-items-center rounded-md bg-primary text-primary-foreground">
                <Bot className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-sm font-semibold">Football Engine</span>
                <span className="text-xs text-muted-foreground">Buffer automation</span>
              </span>
            </Link>
            <nav className="mt-8 space-y-1">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>
          <main className="lg:pl-64">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
