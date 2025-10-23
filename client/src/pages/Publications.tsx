import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { ExternalLink, FileText } from "lucide-react";
import { useState } from "react";

export default function Publications() {
  const { data: publications, isLoading } = trpc.publication.list.useQuery();
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="text-center">加载中...</div>
      </div>
    );
  }

  // Get unique years
  const years = Array.from(new Set(publications?.map(p => p.year) || [])).sort((a, b) => b - a);

  // Filter publications by year
  const filteredPublications = selectedYear
    ? publications?.filter(p => p.year === selectedYear)
    : publications;

  return (
    <div className="container py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">学术成果</h1>
        <p className="text-lg text-muted-foreground">
          课题组发表的论文和研究成果
        </p>
      </div>

      {/* Year filter */}
      {years.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center">
          <Button
            variant={selectedYear === null ? "default" : "outline"}
            onClick={() => setSelectedYear(null)}
          >
            全部
          </Button>
          {years.map(year => (
            <Button
              key={year}
              variant={selectedYear === year ? "default" : "outline"}
              onClick={() => setSelectedYear(year)}
            >
              {year}
            </Button>
          ))}
        </div>
      )}

      {/* Publications list */}
      <div className="space-y-4">
        {filteredPublications && filteredPublications.length > 0 ? (
          filteredPublications.map((pub) => (
            <Card key={pub.id}>
              <CardHeader>
                <CardTitle className="text-lg">{pub.title}</CardTitle>
                <CardDescription>
                  {pub.authors}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
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
          ))
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              暂无学术成果
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

