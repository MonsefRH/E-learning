import { Link, Navigate } from "react-router-dom";
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
    console.log("No user found:", user);
    return <LoginForm />;
  }

  console.log("User role:", user.role);
  switch (user.role) {
    case "manager":
      return <ManagerDashboard />;
    case "trainer":
      return <TrainerDashboard />;
    case "learner":
      return <LearnerDashboard />;
    default:
      console.error("Invalid user role:", user.role);
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">
              Error: Invalid Role
            </h1>
            <p className="text-gray-600">
              Your account has an invalid role. Please contact support.
            </p>
            <Link to="/" className="text-blue-500 hover:text-blue-700 underline">
              Return to Home
            </Link>
          </div>
        </div>
      );
  }
};

export default Index;