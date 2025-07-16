import {useEffect, useState} from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Users, BookOpen, TrendingUp, UserPlus, Plus } from "lucide-react";
import userService from "@/lib/services/userService.ts";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import {DialogFooter, DialogHeader } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Input } from "../ui/input";
import { Label } from "@radix-ui/react-label";

const ManagerDashboard = () => {
  const [stats] = useState({

    totalCourses: 24,
    activeEnrollments: 89,
    completionRate: 72
  });

  const [topCourses] = useState([
    { id: 1, title: "Introduction to AI", enrollments: 45, rating: 4.8 },
    { id: 2, title: "Web Development Basics", enrollments: 38, rating: 4.6 },
    { id: 3, title: "Data Science Fundamentals", enrollments: 32, rating: 4.9 },
  ]);

  const [recentUsers, setRecentUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await userService.getAllUsers();
        setTotalUsers(users.length);
        setRecentUsers(users.slice(0, 5));
      } catch (error) {
        console.error("Failed to fetch users:", error);
        setRecentUsers([]);
      }
    };

    fetchUsers().then(() => console.log("Users fetched successfully"));
  }, []);



  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    role: 'learner'
  });

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await userService.createUser(newUser);
      // Refresh user list
      const users = await userService.getAllUsers();
      setRecentUsers(users.slice(0, 5));
      setIsAddUserDialogOpen(false);
      // Reset form
      setNewUser({username: '', email: '', password: '', role: 'learner'});
    } catch (error) {
      console.error("Failed to create user:", error);
    }
  };



  return (
    <DashboardLayout 
      title="Manager Dashboard"
      breadcrumbs={[{ label: "Dashboard" }]}
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-blue-900">{totalUsers}</p>
                  <p className="text-sm text-blue-700">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-green-900">12</p>
                  <p className="text-sm text-green-700">Active Courses</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold text-purple-900">1,205</p>
                  <p className="text-sm text-purple-700">Total Enrollments</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold text-orange-900">87%</p>
                  <p className="text-sm text-orange-700">Completion Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>


        {/* Detailed Views */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="courses">Course Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Recent Users</CardTitle>
                    <CardDescription>Manage and monitor user accounts</CardDescription>
                  </div>
                  <Button onClick={() => setIsAddUserDialogOpen(true)}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add User
                  </Button>

                <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
                    <DialogContent className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg max-w-md w-full z-50">
                      <DialogHeader>
                        <DialogTitle className="text-xl font-semibold text-gray-900">Add New User</DialogTitle>
                        <DialogDescription className="text-sm text-gray-500">
                          Create a new user account with the appropriate role.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleAddUser}>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="username" className="text-right">
                              Username
                            </Label>
                            <Input
                              id="username"
                              value={newUser.username}
                              onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                              className="col-span-3"
                              required
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">
                              Email
                            </Label>
                            <Input
                              id="email"
                              type="email"
                              value={newUser.email}
                              onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                              className="col-span-3"
                              required
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="password" className="text-right">
                              Password
                            </Label>
                            <Input
                              id="password"
                              type="password"
                              value={newUser.password}
                              onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                              className="col-span-3"
                              required
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="role" className="text-right">
                              Role
                            </Label>
                            <Select
                              value={newUser.role}
                              onValueChange={(value) => setNewUser({...newUser, role: value})}
                            >
                              <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select a role" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="learner">Learner</SelectItem>
                                <SelectItem value="trainer">Trainer</SelectItem>
                                <SelectItem value="manager">Manager</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="button" variant="outline" onClick={() => setIsAddUserDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit">Create User</Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                    {isAddUserDialogOpen && <div className="fixed inset-0 bg-black/50 z-40" />}
                  </Dialog>

                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">{user.username}</h4>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={user.role === "trainer" ? "default" : "secondary"}>
                          {user.role}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="courses" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Courses</CardTitle>
                <CardDescription>Courses with highest enrollment and ratings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topCourses.map((course) => (
                    <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">{course.title}</h4>
                        <p className="text-sm text-muted-foreground">{course.enrollments} enrollments</p>
                      </div>
                      <Badge variant="default">
                        ⭐ {course.rating}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Learning Analytics</CardTitle>
                <CardDescription>Platform performance and user engagement metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Analytics dashboard coming soon...</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Charts and detailed metrics will be implemented in Phase 4
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ManagerDashboard;
