import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Github, GraduationCap, Linkedin, FileText, User } from "lucide-react";
import { Link } from "wouter";

export default function Members() {
  const { data: profiles, isLoading } = trpc.profile.list.useQuery();

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="text-center">加载中...</div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">团队成员</h1>
        <p className="text-lg text-muted-foreground">
          我们的研究团队由一群充满热情的研究者组成
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {profiles?.map((profile) => (
          <Card key={profile.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex flex-col items-center space-y-4">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.fullName}
                    className="h-32 w-32 rounded-full object-cover border-4 border-primary/10"
                  />
                ) : (
                  <div className="h-32 w-32 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-16 w-16 text-primary" />
                  </div>
                )}
                <div className="text-center space-y-1">
                  <CardTitle>{profile.fullName}</CardTitle>
                  {profile.title && (
                    <CardDescription>{profile.title}</CardDescription>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.bio && (
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {profile.bio}
                </p>
              )}
              
              <div className="flex flex-wrap gap-2 justify-center">
                {profile.githubUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer">
                      <Github className="h-4 w-4" />
                    </a>
                  </Button>
                )}
                {profile.scholarUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <a href={profile.scholarUrl} target="_blank" rel="noopener noreferrer">
                      <GraduationCap className="h-4 w-4" />
                    </a>
                  </Button>
                )}
                {profile.linkedinUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer">
                      <Linkedin className="h-4 w-4" />
                    </a>
                  </Button>
                )}
                {profile.cvUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <a href={profile.cvUrl} target="_blank" rel="noopener noreferrer">
                      <FileText className="h-4 w-4 mr-1" />
                      简历
                    </a>
                  </Button>
                )}
              </div>

              <Link href={`/member/${profile.id}`}>
                <Button variant="default" className="w-full">
                  查看详情
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {(!profiles || profiles.length === 0) && (
        <div className="text-center py-12 text-muted-foreground">
          暂无团队成员信息
        </div>
      )}
    </div>
  );
}

