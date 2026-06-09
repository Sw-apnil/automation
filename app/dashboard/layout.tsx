import { Sidebar } from "@/components/sidebar";
import { PageWrapper } from "@/components/page-wrapper";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <main className="lg:pl-[272px]">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <PageWrapper>
            {children}
          </PageWrapper>
        </div>
      </main>
    </div>
  );
}
