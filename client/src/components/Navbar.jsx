import React from "react";
import { Link, NavLink } from "react-router-dom";
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";

export default function Navbar() {
  return (
    <nav className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="mr-6 flex items-center space-x-2">
          <span className="font-bold text-xl tracking-tight text-foreground">
            Carpool
          </span>
        </Link>

        <div className="flex flex-1 items-center justify-end space-x-4">
          {/* Navigation Links */}
          <ul className="hidden md:flex items-center gap-6 text-sm font-medium mr-4">
            <li>
              <NavLink
                to="/search"
                className={({ isActive }) =>
                  isActive
                    ? "text-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground transition-colors"
                }
              >
                Search
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/create-trip"
                className={({ isActive }) =>
                  isActive
                    ? "text-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground transition-colors"
                }
              >
                Offer a Trip
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/driver/register"
                className={({ isActive }) =>
                  isActive
                    ? "text-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground transition-colors"
                }
              >
                Become Driver
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  isActive
                    ? "text-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground transition-colors"
                }
              >
                Dashboard
              </NavLink>
            </li>
          </ul>

          <nav className="flex items-center gap-2">
            <SignedOut>
              <Link
                to="/login"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 shadow"
              >
                Sign up
              </Link>
            </SignedOut>
            <SignedIn>
              <div className="flex items-center gap-4">
                <UserButton afterSignOutUrl="/" />
              </div>
            </SignedIn>
          </nav>
        </div>
      </div>
    </nav>
  );
}
