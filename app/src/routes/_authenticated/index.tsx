import { createFileRoute } from "@tanstack/react-router";
import { BoardsIndexPage } from "@/pages/BoardsIndexPage";

export const Route = createFileRoute("/_authenticated/")({
  component: BoardsIndexPage,
});
