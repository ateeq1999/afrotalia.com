import { Button } from "@afrotalia/ui/components/button";
import { Input } from "@afrotalia/ui/components/input";
import { Label } from "@afrotalia/ui/components/label";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import z from "zod";

import { authClient } from "@/lib/auth-client";

import Loader from "./loader";

export default function SignUpForm() {
  const navigate = useNavigate();
  const { isPending } = authClient.useSession();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
    onSubmit: async ({ value }) => {
      await authClient.signUp.email(
        {
          email: value.email,
          password: value.password,
          name: value.name,
        },
        {
          onSuccess: () => {
            navigate({
              to: "/",
            });
            toast.success("Account created — complete activation to start bidding");
          },
          onError: (error) => {
            toast.error(error.error.message || error.error.statusText);
          },
        },
      );
    },
    validators: {
      onSubmit: z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
      }),
    },
  });

  if (isPending) {
    return <Loader />;
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-4"
    >
      <div>
        <form.Field name="name">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name} className="text-[#8F9095]">
                Name
              </Label>
              <Input
                id={field.name}
                name={field.name}
                autoComplete="name"
                placeholder="Your full name"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              {field.state.meta.errors.map((error) => (
                <p key={error?.message} className="text-[13px] text-[#FF5C5C]">
                  {error?.message}
                </p>
              ))}
            </div>
          )}
        </form.Field>
      </div>

      <div>
        <form.Field name="email">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name} className="text-[#8F9095]">
                Email
              </Label>
              <Input
                id={field.name}
                name={field.name}
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              {field.state.meta.errors.map((error) => (
                <p key={error?.message} className="text-[13px] text-[#FF5C5C]">
                  {error?.message}
                </p>
              ))}
            </div>
          )}
        </form.Field>
      </div>

      <div>
        <form.Field name="password">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name} className="text-[#8F9095]">
                Password
              </Label>
              <Input
                id={field.name}
                name={field.name}
                type="password"
                autoComplete="new-password"
                placeholder="At least 8 characters"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              {field.state.meta.errors.map((error) => (
                <p key={error?.message} className="text-[13px] text-[#FF5C5C]">
                  {error?.message}
                </p>
              ))}
            </div>
          )}
        </form.Field>
      </div>

      <form.Subscribe
        selector={(state) => ({ canSubmit: state.canSubmit, isSubmitting: state.isSubmitting })}
      >
        {({ canSubmit, isSubmitting }) => (
          <Button
            type="submit"
            className="h-12 w-full bg-[#FFBF19] text-[15px] font-bold text-black transition-colors hover:bg-[#FFC93A] active:bg-[#F0AD00] disabled:cursor-not-allowed disabled:bg-[#2A2A2E] disabled:text-[#6E6E73]"
            disabled={!canSubmit || isSubmitting}
          >
            {isSubmitting ? "Creating account..." : "Create Account"}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
