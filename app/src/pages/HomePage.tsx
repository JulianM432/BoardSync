import { Board } from "@/components/board/Board";
import { Button } from "@/components/ui/button";
import type { User } from "@/schemas/auth";

type HomeProps = {
  onLogout: () => void;
  user: User;
};

export const HomePage = ({ user, onLogout }: HomeProps) => (
  <main className="grid min-h-screen place-items-center p-4">
    <div className="flex flex-col items-center gap-4 text-center">
      <Board />
      <Button onClick={onLogout}>Cerrar sesion</Button>
    </div>
  </main>
);
