import { PageHeader } from "@/components/page-header";

export const BoardsIndexPage = () => {
  return (
    <>
      <PageHeader title="Boards" />
      <p className="p-4 text-sm text-muted-foreground">
        Seleccioná un board para empezar.
      </p>
    </>
  );
};
