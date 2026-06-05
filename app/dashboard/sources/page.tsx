import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getRecentEvents } from "@/lib/dashboard/data";

export const dynamic = "force-dynamic";

export default async function SourcesPage() {
  const events = await getRecentEvents(100);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Incoming Events</CardTitle>
        <CardDescription>Normalized source items with relevance scores before queue generation.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Headline</TableHead>
              <TableHead>Account</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event.id}>
                <TableCell className="max-w-xl font-medium">{event.title}</TableCell>
                <TableCell>{event.accounts?.name}</TableCell>
                <TableCell>{event.source}</TableCell>
                <TableCell><Badge variant="secondary">{event.category}</Badge></TableCell>
                <TableCell>{event.score}/10</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
