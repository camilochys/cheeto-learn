import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface LoadingScreenProps {
  title?: string;
  description?: string;
  fadingOut?: boolean;
  visible?: boolean;
}

export function LoadingScreen({
  title = "Cargando...",
  description = "Por favor espera...",
  fadingOut = false,
  visible = false
}: LoadingScreenProps) {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-background transition-opacity duration-600"
      style={{ opacity: fadingOut ? 0 : visible ? 1 : 0 }}
    >
      <Card className="w-full max-w-md text-center">
        <CardHeader className="space-y-2">
          <img src="/cheeto_learn_logo.png" className="h-12 mx-auto mb-2" />
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="pb-8">
          <div className="flex justify-center gap-2 mt-4">
            <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0ms]" />
            <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:150ms]" />
            <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:300ms]" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}