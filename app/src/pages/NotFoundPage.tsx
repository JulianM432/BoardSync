import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const NotFoundPage = () => {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-4">
      <p className="text-sm text-muted-foreground">Página no encontrada.</p>
      <Button variant="outline" nativeButton={false} render={<Link to="/" />}>
        Volver al inicio
      </Button>
    </main>
  );
};
