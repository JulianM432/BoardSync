import { Spinner } from "@/components/ui/spinner";

export const FullPageSpinner = () => {
  return (
    <main className="flex min-h-dvh items-center justify-center">
      <Spinner className="size-8" />
    </main>
  );
};
