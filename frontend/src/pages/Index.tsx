
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import LoginForm from "@/components/auth/LoginForm";
import ManagerDashboard from "@/components/dashboards/ManagerDashboard";
import TrainerDashboard from "@/components/dashboards/TrainerDashboard";
import LearnerDashboard from "@/components/dashboards/LearnerDashboard";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  // Render appropriate dashboard based on user role
  switch (user.role) {
    case "manager":
      return <ManagerDashboard />;
    case "trainer":
      return <TrainerDashboard />;
    case "learner":
      return <LearnerDashboard />;
    default:
      return <Navigate to="/login" replace />;
  }
};

export default Index;
