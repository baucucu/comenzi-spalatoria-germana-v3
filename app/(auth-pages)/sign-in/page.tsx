import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Logo from "@/components/logo";

export default async function Login(props: { searchParams: Promise<Message> }) {
  const searchParams = await props.searchParams;
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg flex flex-col items-center w-full max-w-md">
        <Logo width={140} height={48} />
        <h1 className="text-2xl font-medium text-center w-full mb-6 mt-4">Sign in</h1>
        <form className="flex flex-col gap-2 w-full items-center">
          <div className="flex flex-col gap-2 [&>input]:mb-3 w-full">
            <Label htmlFor="email">Email</Label>
            <Input name="email" placeholder="you@example.com" required />
            <div className="flex justify-between items-center">
              <Label htmlFor="password">Password</Label>
            </div>
            <Input
              type="password"
              name="password"
              placeholder="Your password"
              required
            />
            <SubmitButton pendingText="Signing In..." formAction={signInAction}>
              Sign in
            </SubmitButton>
            <FormMessage message={searchParams} />
          </div>
        </form>
      </div>
    </div>
  );
}
