import { useState, type ChangeEvent, type SubmitEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import type { LoginCredentials } from "@/schemas/auth";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup, FieldLabel, Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Spinner } from "../../../components/ui/spinner";

type LoginFormProps = {
  onSubmit: (input: LoginCredentials) => Promise<void>;
  isSubmitting?: boolean;
  error?: string | null;
};

export const Login = ({
  onSubmit,
  isSubmitting = false,
  error,
}: LoginFormProps) => {
  const [form, setForm] = useState<LoginCredentials>({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    void onSubmit(form);
  };

  return (
    <div className="w-full max-w-sm">
      <Card>
        <CardHeader>
          <CardTitle>Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={form.email}
                  onChange={handleChange}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    className="pr-10"
                    required
                    value={form.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    aria-label={
                      showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {showPassword ? (
                      <EyeOff aria-hidden="true" size={16} />
                    ) : (
                      <Eye aria-hidden="true" size={16} />
                    )}
                  </button>
                </div>
              </Field>
              {error && (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              )}
              <Field>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Spinner />}
                  Login
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
