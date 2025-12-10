import { SignIn } from "@clerk/clerk-react";

export default function Login() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <SignIn path="/login" routing="path" signUpUrl="/signup" />
    </div>
  );
}
