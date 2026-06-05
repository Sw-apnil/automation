import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAnalytics } from "@/lib/dashboard/data";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const { summary, logs } = await getAnalytics();

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {Object.entries(summary).map(([key, value]) => (
          <Card key={key}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm capitalize">{key.replace(/([A-Z])/g, " $1")}</CardTitle>
            </CardHeader>
            <CardContent><span className="text-2xl font-semibold">{value}</span></CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Audit Logs</CardTitle>
          <CardDescription>API, AI, duplicate, retry, and publishing events.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Level</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell><Badge variant={log.level === "error" ? "destructive" : "outline"}>{log.level}</Badge></TableCell>
                  <TableCell>{log.event_type}</TableCell>
                  <TableCell className="max-w-2xl">{log.message}</TableCell>
                  <TableCell>{new Date(log.created_at).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
