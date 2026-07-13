import { ShieldCheck } from "lucide-react";
import { UserSection } from "./UserSection";
import { ThemeToggle } from "./ThemeToggle";

export function DashboardHeader() {

  return (
    <header className="border-b border-border bg-card header-nav-bg">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-8 w-8 text-primary" />
              <div className="header-nav-text">
                <h1 className="text-xl font-bold">AI Disaster Response System</h1>
                <p className="text-sm text-muted-foreground">
                  Real-time monitoring & predictive analytics
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <UserSection />
          </div>
        </div>
      </div>
    </header>
  );
}