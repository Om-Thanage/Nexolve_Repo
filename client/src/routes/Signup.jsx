import { SignUp } from "@clerk/clerk-react";

export default function Signup() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <SignUp path="/signup" routing="path" signInUrl="/login" />
    </div>
  );
}
