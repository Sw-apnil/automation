import { Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getPublished } from "@/lib/dashboard/data";

export const dynamic = "force-dynamic";

export default async function PublishedPage() {
  const posts = await getPublished(100);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Send className="h-4 w-4" /> Published Posts</CardTitle>
        <CardDescription>Posts successfully accepted by Buffer for each platform profile.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Content</TableHead>
              <TableHead>Account</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Buffer post</TableHead>
              <TableHead>Published</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((post) => (
              <TableRow key={post.id}>
                <TableCell className="max-w-2xl">{post.post_queue?.content}</TableCell>
                <TableCell>{post.accounts?.name}</TableCell>
                <TableCell><Badge>{post.platform}</Badge></TableCell>
                <TableCell className="font-mono text-xs">{post.post_id}</TableCell>
                <TableCell>{new Date(post.published_at).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
