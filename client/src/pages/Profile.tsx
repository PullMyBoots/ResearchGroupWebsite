import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Upload, User } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Profile() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const { data: profile, isLoading } = trpc.profile.me.useQuery();
  const updateProfile = trpc.profile.update.useMutation({
    onSuccess: () => {
      utils.profile.me.invalidate();
      toast.success("个人信息更新成功");
    },
    onError: (error) => {
      toast.error("更新失败: " + error.message);
    },
  });

  const uploadAvatar = trpc.profile.uploadAvatar.useMutation({
    onSuccess: () => {
      utils.profile.me.invalidate();
      toast.success("头像上传成功");
    },
    onError: (error) => {
      toast.error("上传失败: " + error.message);
    },
  });

  const uploadCV = trpc.profile.uploadCV.useMutation({
    onSuccess: () => {
      utils.profile.me.invalidate();
      toast.success("简历上传成功");
    },
    onError: (error) => {
      toast.error("上传失败: " + error.message);
    },
  });

  const [fullName, setFullName] = useState("");
  const [title, setTitle] = useState("");
  const [bio, setBio] = useState("");
  const [researchInterests, setResearchInterests] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [scholarUrl, setScholarUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || "");
      setTitle(profile.title || "");
      setBio(profile.bio || "");
      setResearchInterests(profile.researchInterests || "");
      setGithubUrl(profile.githubUrl || "");
      setScholarUrl(profile.scholarUrl || "");
      setLinkedinUrl(profile.linkedinUrl || "");
    }
  }, [profile]);

  const handleSubmit = () => {
    if (!fullName.trim()) {
      toast.error("请填写姓名");
      return;
    }

    updateProfile.mutate({
      fullName,
      title: title || undefined,
      bio: bio || undefined,
      researchInterests: researchInterests || undefined,
      githubUrl: githubUrl || undefined,
      scholarUrl: scholarUrl || undefined,
      linkedinUrl: linkedinUrl || undefined,
    });
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("文件大小不能超过5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result?.toString().split(",")[1];
      if (base64) {
        uploadAvatar.mutate({
          filename: file.name,
          contentType: file.type,
          data: base64,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("文件大小不能超过10MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result?.toString().split(",")[1];
      if (base64) {
        uploadCV.mutate({
          filename: file.name,
          contentType: file.type,
          data: base64,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="text-center">加载中...</div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8 max-w-4xl">
      <div>
        <h1 className="text-4xl font-bold">个人中心</h1>
        <p className="text-lg text-muted-foreground mt-2">
          管理你的个人信息和学术资料
        </p>
      </div>

      {/* Avatar Section */}
      <Card>
        <CardHeader>
          <CardTitle>头像</CardTitle>
          <CardDescription>上传你的个人头像（最大5MB）</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-6">
          {profile?.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt="Avatar"
              className="h-32 w-32 rounded-full object-cover border-4 border-primary/10"
            />
          ) : (
            <div className="h-32 w-32 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-16 w-16 text-primary" />
            </div>
          )}
          <div>
            <input
              type="file"
              id="avatar-upload"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
              disabled={uploadAvatar.isPending}
            />
            <Button
              asChild
              disabled={uploadAvatar.isPending}
            >
              <label htmlFor="avatar-upload" className="cursor-pointer">
                <Upload className="mr-2 h-4 w-4" />
                {uploadAvatar.isPending ? "上传中..." : "上传头像"}
              </label>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>基本信息</CardTitle>
          <CardDescription>填写你的基本个人信息</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="fullName">姓名 *</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="输入你的姓名"
            />
          </div>
          <div>
            <Label htmlFor="title">职称/身份</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：博士生、博士后"
            />
          </div>
          <div>
            <Label htmlFor="bio">个人简介</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="简要介绍你的背景和经历"
              rows={4}
            />
          </div>
          <div>
            <Label htmlFor="researchInterests">研究兴趣</Label>
            <Textarea
              id="researchInterests"
              value={researchInterests}
              onChange={(e) => setResearchInterests(e.target.value)}
              placeholder="描述你的研究方向和兴趣"
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Links */}
      <Card>
        <CardHeader>
          <CardTitle>学术链接</CardTitle>
          <CardDescription>添加你的学术主页和社交媒体链接</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="githubUrl">GitHub</Label>
            <Input
              id="githubUrl"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/username"
            />
          </div>
          <div>
            <Label htmlFor="scholarUrl">Google Scholar</Label>
            <Input
              id="scholarUrl"
              value={scholarUrl}
              onChange={(e) => setScholarUrl(e.target.value)}
              placeholder="https://scholar.google.com/..."
            />
          </div>
          <div>
            <Label htmlFor="linkedinUrl">LinkedIn</Label>
            <Input
              id="linkedinUrl"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="https://linkedin.com/in/username"
            />
          </div>
        </CardContent>
      </Card>

      {/* CV Upload */}
      <Card>
        <CardHeader>
          <CardTitle>个人简历</CardTitle>
          <CardDescription>上传你的简历PDF文件（最大10MB）</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile?.cvUrl && (
            <div className="text-sm text-muted-foreground">
              当前简历：
              <a
                href={profile.cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline ml-2"
              >
                查看
              </a>
            </div>
          )}
          <div>
            <input
              type="file"
              id="cv-upload"
              accept=".pdf"
              className="hidden"
              onChange={handleCVUpload}
              disabled={uploadCV.isPending}
            />
            <Button
              asChild
              variant="outline"
              disabled={uploadCV.isPending}
            >
              <label htmlFor="cv-upload" className="cursor-pointer">
                <Upload className="mr-2 h-4 w-4" />
                {uploadCV.isPending ? "上传中..." : "上传简历"}
              </label>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={updateProfile.isPending}
          size="lg"
        >
          {updateProfile.isPending ? "保存中..." : "保存更改"}
        </Button>
      </div>
    </div>
  );
}

