import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, ClipboardList } from "lucide-react";
import Link from "next/link";

interface CourseCardProps {
  id: string;
  title: string;
  description: string | null;
  currentLevel?: number;
  role: "STUDENT" | "TEACHER";
}

export function CourseCard({ id, title, description, currentLevel, role }: CourseCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <BookOpen className="w-8 h-8 text-primary mb-2" />
          {role === "STUDENT" && currentLevel && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
              Nivel {currentLevel}
            </span>
          )}
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {role === "STUDENT" && currentLevel && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Nivel actual</span>
              <span>{currentLevel} / 5</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${(currentLevel / 5) * 100}%` }}
              />
            </div>
          </div>
        )}
        {role === "STUDENT" ? (
  <div className="grid grid-cols-3 gap-1 mt-4">
    <Link href={`/dashboard/course/${id}`}>
      <Button variant="outline" className="w-full">
        Contenido
      </Button>
    </Link>
    
    <Link href={`/dashboard/exercise/${id}`}>
      <Button className="w-full">
        Test
      </Button>
    </Link>

    <Link href={`/dashboard/assignment/${id}`}>
    <Button variant="outline" className="w-full">
      Tareas
    </Button>
    </Link>
  </div>
        ) : (
          <Link href={`/teacher/courses/${id}`}>
            <Button className="w-full" variant="outline">
              <ClipboardList className="w-4 h-4 mr-2" />
              Gestionar curso
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}