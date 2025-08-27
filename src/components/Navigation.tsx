import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FlaskConical, Monitor, Stethoscope, Home } from "lucide-react";

export const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Lab", icon: FlaskConical },
    { path: "/radiology", label: "Radiology", icon: Monitor },
    { path: "/gi", label: "GI", icon: Stethoscope },
  ];

  return (
    <Card className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-white/80 backdrop-blur-sm shadow-lg border-0">
      <div className="flex items-center gap-2 p-2">
        <Link to="/">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 font-medium"
          >
            <Home className="h-4 w-4" />
            Girum Hospital
          </Button>
        </Link>
        <div className="h-6 w-px bg-border mx-2" />
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link key={item.path} to={item.path}>
              <Button
                variant={isActive ? "default" : "ghost"}
                size="sm"
                className="flex items-center gap-2"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </div>
    </Card>
  );
};