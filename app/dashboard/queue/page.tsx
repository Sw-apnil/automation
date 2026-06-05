import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getQueue } from "@/lib/dashboard/data";

export const dynamic = "force-dynamic";

export default async function QueuePage() {
  const posts = await getQueue(100);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Post Queue</CardTitle>
        <CardDescription>Generated fan posts, retry state, images, and source scores.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Post</TableHead>
              <TableHead>Account</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Retries</TableHead>
              <TableHead>Image</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((post) => (
              <TableRow key={post.id}>
                <TableCell className="max-w-2xl">{post.content}</TableCell>
                <TableCell>{post.accounts?.name}</TableCell>
                <TableCell><Badge variant={post.status === "failed" ? "destructive" : "outline"}>{post.status}</Badge></TableCell>
                <TableCell>{post.retry_count}/{post.max_retries}</TableCell>
                <TableCell>{post.image_url ? "Attached" : "None"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
