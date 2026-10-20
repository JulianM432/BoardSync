import { PageHeader } from "@/components/page-header";

export const BoardNotFoundPage = () => {
  return (
    <>
      <PageHeader title="Board no encontrado" />
      <p className="p-4 text-sm text-muted-foreground">
        El board no existe o no tenés acceso.
      </p>
    </>
  );
};
