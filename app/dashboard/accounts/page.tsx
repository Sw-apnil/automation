import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAccountRows } from "@/lib/dashboard/data";

export const dynamic = "force-dynamic";

export default async function AccountsPage() {
  const accounts = await getAccountRows();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Accounts</CardTitle>
        <CardDescription>Database-driven configuration. Add rows in Supabase to onboard new football accounts.</CardDescription>
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
                <TableCell className="max-w-sm">{(account.keywords ?? []).slice(0, 5).join(", ")}</TableCell>
                <TableCell><Badge variant={account.enabled ? "secondary" : "outline"}>{account.enabled ? "Enabled" : "Paused"}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
