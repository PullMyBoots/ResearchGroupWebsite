import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Plus, ExternalLink, FileText, MessageSquare, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Shares() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const { data: shares, isLoading } = trpc.share.list.useQuery();
  const createShare = trpc.share.create.useMutation({
    onSuccess: () => {
      utils.share.list.invalidate();
      toast.success("分享创建成功");
      setDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("创建失败: " + error.message);
    },
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState<"paper" | "blog" | "slides" | "other">("paper");
  const [url, setUrl] = useState("");
  const [selectedShareId, setSelectedShareId] = useState<number | null>(null);

  const resetForm = () => {
    setTitle("");
    setContent("");
    setType("paper");
    setUrl("");
  };

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) {
      toast.error("请填写标题和内容");
      return;
    }

    createShare.mutate({
      title,
      content,
      type,
      url: url.trim() || undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="text-center">加载中...</div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">内部分享</h1>
          <p className="text-lg text-muted-foreground mt-2">
            组员内部的学术交流和资料分享
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              新建分享
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>创建新分享</DialogTitle>
              <DialogDescription>
                分享推荐的论文、博客或上传组会资料
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">标题</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="输入分享标题"
                />
              </div>
              <div>
                <Label htmlFor="type">类型</Label>
                <Select value={type} onValueChange={(v: any) => setType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paper">论文推荐</SelectItem>
                    <SelectItem value="blog">博客推荐</SelectItem>
                    <SelectItem value="slides">组会讲义</SelectItem>
                    <SelectItem value="other">其他</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="content">内容描述</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="描述分享的内容、要点或推荐理由"
                  rows={5}
                />
              </div>
              <div>
                <Label htmlFor="url">链接（可选）</Label>
                <Input
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={handleSubmit} disabled={createShare.isPending}>
                {createShare.isPending ? "创建中..." : "创建"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Shares list */}
      <div className="space-y-4">
        {shares && shares.length > 0 ? (
          shares.map((share) => (
            <Card key={share.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{share.title}</CardTitle>
                    <CardDescription className="mt-2">
                      <span className="inline-block px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                        {share.type === "paper" && "论文推荐"}
                        {share.type === "blog" && "博客推荐"}
                        {share.type === "slides" && "组会讲义"}
                        {share.type === "other" && "其他"}
                      </span>
                      <span className="ml-3 text-xs">
                        {new Date(share.createdAt).toLocaleDateString("zh-CN")}
                      </span>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {share.content}
                </p>
                <div className="flex gap-2">
                  {share.url && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={share.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        访问链接
                      </a>
                    </Button>
                  )}
                  {share.fileUrl && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={share.fileUrl} target="_blank" rel="noopener noreferrer">
                        <FileText className="h-3 w-3 mr-1" />
                        下载文件
                      </a>
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedShareId(share.id)}
                  >
                    <MessageSquare className="h-3 w-3 mr-1" />
                    评论
                  </Button>
                </div>

                {/* Comments section */}
                {selectedShareId === share.id && (
                  <CommentsSection shareId={share.id} />
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              暂无分享内容，点击右上角"新建分享"开始分享
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function CommentsSection({ shareId }: { shareId: number }) {
  const utils = trpc.useUtils();
  const { data: comments, isLoading } = trpc.share.getComments.useQuery({ shareId });
  const addComment = trpc.share.addComment.useMutation({
    onSuccess: () => {
      utils.share.getComments.invalidate({ shareId });
      setCommentText("");
      toast.success("评论成功");
    },
  });

  const [commentText, setCommentText] = useState("");

  const handleSubmit = () => {
    if (!commentText.trim()) {
      toast.error("请输入评论内容");
      return;
    }
    addComment.mutate({ shareId, content: commentText });
  };

  return (
    <div className="border-t pt-4 space-y-4">
      <h4 className="font-semibold">评论</h4>
      
      {/* Comment input */}
      <div className="flex gap-2">
        <Input
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="写下你的评论..."
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />
        <Button
          size="icon"
          onClick={handleSubmit}
          disabled={addComment.isPending}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {/* Comments list */}
      {isLoading ? (
        <div className="text-sm text-muted-foreground">加载评论中...</div>
      ) : comments && comments.length > 0 ? (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-muted/50 rounded-lg p-3">
              <p className="text-sm">{comment.content}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {new Date(comment.createdAt).toLocaleString("zh-CN")}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-muted-foreground">暂无评论</div>
      )}
    </div>
  );
}

