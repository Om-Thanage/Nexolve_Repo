import { useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import api from "../api";

export default function UserSync() {
  const { user, isSignedIn } = useUser();

  useEffect(() => {
    const syncUser = async () => {
      if (isSignedIn && user) {
        try {
          const payload = {
            clerkId: user.id,
            email: user.primaryEmailAddress?.emailAddress,
            name: user.fullName || user.username,
            profilePhoto: user.imageUrl,
          };

          // Upsert user in backend
          const res = await api.post("/users", payload);

          if (res.data.user) {
            localStorage.setItem("userId", res.data.user._id);
            localStorage.setItem("driverId", res.data.user._id);
            localStorage.setItem("userRole", res.data.user.role);
          }
        } catch (e) {
          console.error("Failed to sync user", e);
        }
      }
    };

    syncUser();
  }, [isSignedIn, user]);

  return null;
}
