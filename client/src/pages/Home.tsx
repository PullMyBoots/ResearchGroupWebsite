import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_TITLE, getLoginUrl } from "@/const";
import { Users, FileText, Share2, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="container py-8 space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-6 py-12">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          焦熙昀教授课题组
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          南方科技大学统计与数据科学系
        </p>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          专注于计算统计、贝叶斯统计、马尔可夫链蒙特卡罗算法和群体遗传学中的统计方法研究
        </p>
      </section>

      {/* Research Areas */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold text-center">研究方向</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>计算统计</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                开发高效的统计计算方法和算法，解决复杂数据分析问题。
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>贝叶斯统计</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                利用贝叶斯方法进行统计推断，提供更灵活的建模框架。
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>马尔可夫链蒙特卡罗算法</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                设计和改进MCMC采样算法，提高统计推断的效率和准确性。
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>群体遗传学中的统计方法</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                应用统计方法研究物种演化、基因流动等群体遗传学问题。
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Quick Links */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold text-center">快速导航</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Link href="/members">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="h-12 w-12 mb-4 text-primary" />
                <CardTitle>团队成员</CardTitle>
                <CardDescription>
                  了解我们的研究团队和成员信息
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="w-full">
                  查看详情 <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/publications">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <FileText className="h-12 w-12 mb-4 text-primary" />
                <CardTitle>学术成果</CardTitle>
                <CardDescription>
                  浏览我们发表的论文和研究成果
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="w-full">
                  查看详情 <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </Link>

          {user ? (
            <Link href="/shares">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Share2 className="h-12 w-12 mb-4 text-primary" />
                  <CardTitle>内部分享</CardTitle>
                  <CardDescription>
                    组员内部的学术交流和资料分享
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="w-full">
                    查看详情 <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ) : (
            <Card>
              <CardHeader>
                <Share2 className="h-12 w-12 mb-4 text-muted-foreground" />
                <CardTitle>内部分享</CardTitle>
                <CardDescription>
                  组员内部的学术交流和资料分享
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.location.href = getLoginUrl()}
                >
                  登录查看
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Contact */}
      <section className="text-center space-y-4 py-8">
        <h2 className="text-2xl font-bold">联系我们</h2>
        <p className="text-muted-foreground">
          邮箱：jiaoxy@sustech.edu.cn
        </p>
        <p className="text-muted-foreground">
          电话：0755-88015734
        </p>
      </section>
    </div>
  );
}

