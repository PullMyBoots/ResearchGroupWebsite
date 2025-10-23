import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Github, GraduationCap, Linkedin, FileText, User, ArrowLeft, ExternalLink } from "lucide-react";
import { Link, useParams } from "wouter";

export default function MemberDetail() {
  const params = useParams();
  const profileId = parseInt(params.id || "0");
  
  const { data: profile, isLoading: profileLoading } = trpc.profile.getById.useQuery({ id: profileId });
  const { data: publications, isLoading: pubsLoading } = trpc.publication.byProfile.useQuery({ profileId });

  if (profileLoading) {
    return (
      <div className="container py-8">
        <div className="text-center">加载中...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container py-8">
        <div className="text-center">未找到该成员信息</div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      <Link href="/members">
        <Button variant="ghost">
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回团队列表
        </Button>
      </Link>

      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-shrink-0">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.fullName}
                  className="h-48 w-48 rounded-full object-cover border-4 border-primary/10"
                />
              ) : (
                <div className="h-48 w-48 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-24 w-24 text-primary" />
                </div>
              )}
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-3xl font-bold">{profile.fullName}</h1>
                {profile.title && (
                  <p className="text-lg text-muted-foreground mt-2">{profile.title}</p>
                )}
              </div>

              {profile.bio && (
                <div>
                  <h3 className="font-semibold mb-2">个人简介</h3>
                  <p className="text-muted-foreground">{profile.bio}</p>
                </div>
              )}

              {profile.researchInterests && (
                <div>
                  <h3 className="font-semibold mb-2">研究兴趣</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{profile.researchInterests}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                {profile.githubUrl && (
                  <Button variant="outline" asChild>
                    <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer">
                      <Github className="h-4 w-4 mr-2" />
                      GitHub
                    </a>
                  </Button>
                )}
                {profile.scholarUrl && (
                  <Button variant="outline" asChild>
                    <a href={profile.scholarUrl} target="_blank" rel="noopener noreferrer">
                      <GraduationCap className="h-4 w-4 mr-2" />
                      Google Scholar
                    </a>
                  </Button>
                )}
                {profile.linkedinUrl && (
                  <Button variant="outline" asChild>
                    <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer">
                      <Linkedin className="h-4 w-4 mr-2" />
                      LinkedIn
                    </a>
                  </Button>
                )}
                {profile.cvUrl && (
                  <Button variant="outline" asChild>
                    <a href={profile.cvUrl} target="_blank" rel="noopener noreferrer">
                      <FileText className="h-4 w-4 mr-2" />
                      下载简历
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Publications */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">学术成果</h2>
        {pubsLoading ? (
          <div className="text-center py-8">加载中...</div>
        ) : publications && publications.length > 0 ? (
          <div className="space-y-4">
            {publications.map((pub) => (
              <Card key={pub.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{pub.title}</CardTitle>
                  <CardDescription>
                    {pub.authors}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold">{pub.journalOrConference}</span>, {pub.year}
                  </p>
                  <div className="flex gap-2">
                    {pub.doiUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={pub.doiUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          DOI
                        </a>
                      </Button>
                    )}
                    {pub.pdfUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={pub.pdfUrl} target="_blank" rel="noopener noreferrer">
                          <FileText className="h-3 w-3 mr-1" />
                          PDF
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              暂无学术成果
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

