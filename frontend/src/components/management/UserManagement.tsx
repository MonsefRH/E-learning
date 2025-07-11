import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, UserPlus, Filter, MoreHorizontal, Check, X } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import userService from "@/lib/services/userService";

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  level?: string;
  lastLogin?: string;
  created_at: string;
}

// Editable cell component
const EditableCell = ({ value, isEditing, onChange, onSave, onCancel }) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  if (isEditing) {
    return (
      <div className="flex items-center">
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 py-1"
        />
        <Button variant="ghost" size="sm" onClick={onSave} className="ml-1 h-8 w-8 p-0">
          <Check className="h-4 w-4 text-green-600" />
        </Button>
        <Button variant="ghost" size="sm" onClick={onCancel} className="h-8 w-8 p-0">
          <X className="h-4 w-4 text-red-600" />
        </Button>
      </div>
    );
  }

  return (
    <span
      className="cursor-pointer hover:text-blue-600"
      onClick={onSave}
    >
      {value}
    </span>
  );
};

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [displayedUsers, setDisplayedUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentTab, setCurrentTab] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const usersPerPage = 10;

  const [editingState, setEditingState] = useState<{
    userId: number | null;
    field: string | null;
    value: string;
  }>({
    userId: null,
    field: null,
    value: ""
  });

  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    role: "learner",
    level: "beginner"
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const fetchedUsers = await userService.getAllUsers();
        console.log("Fetched users:", fetchedUsers);
        setUsers(fetchedUsers);
        setFilteredUsers(fetchedUsers);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    let result = [...users];

    // Filter by role if not "all"
    if (currentTab !== "all") {
      result = result.filter(user => user.role === currentTab);
    }

    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        user =>
          user.username.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term)
      );
    }

    // Apply sorting
    if (sortBy === "newest") {
      result = [...result].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortBy === "oldest") {
      result = [...result].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else if (sortBy === "az") {
      result = [...result].sort((a, b) => a.username.localeCompare(b.username));
    } else if (sortBy === "za") {
      result = [...result].sort((a, b) => b.username.localeCompare(a.username));
    }

    setFilteredUsers(result);
    setTotalPages(Math.ceil(result.length / usersPerPage));
    setCurrentPage(1); // Reset to first page when filtering changes
  }, [currentTab, searchTerm, users, sortBy]);

  // Update displayed users based on pagination
  useEffect(() => {
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    setDisplayedUsers(filteredUsers.slice(indexOfFirstUser, indexOfLastUser));
  }, [filteredUsers, currentPage]);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await userService.createUser(newUser);
      const updatedUsers = await userService.getAllUsers();
      setUsers(updatedUsers);
      setIsAddUserDialogOpen(false);
      setNewUser({
        username: "",
        email: "",
        password: "",
        role: "learner",
        level: "beginner"
      });
    } catch (error) {
      console.error("Failed to create user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        setIsLoading(true);

        await userService.deleteUser(userId);

        const updatedUsers = await userService.getAllUsers();
        setUsers(updatedUsers);
      } catch (error) {
        console.error("Failed to delete user:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Start editing a field
  const startEditing = (userId: number, field: string, value: string) => {
    setEditingState({
      userId,
      field,
      value
    });
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingState({
      userId: null,
      field: null,
      value: ""
    });
  };

  const saveEditing = async (userId: number, field: string, value: string) => {
    if (editingState.userId === userId && editingState.field === field) {
      try {
        setIsLoading(true);

        // Update UI first for responsiveness
        setUsers(prevUsers => prevUsers.map(user =>
          user.id === userId ? { ...user, [field]: editingState.value } : user
        ));

        // Send appropriate parameters to the API based on which field is being updated
        await userService.updateUser(
          userId,
          field === 'username' ? editingState.value : undefined,
          field === 'email' ? editingState.value : undefined,
          field === 'level' ? editingState.value : undefined
        );

        cancelEditing();
      } catch (error) {
        console.error(`Failed to update ${field}:`, error);
        // Refresh from server to ensure UI is in sync with backend
        const fetchedUsers = await userService.getAllUsers();
        setUsers(fetchedUsers);
      } finally {
        setIsLoading(false);
      }
    } else {
      startEditing(userId, field, value);
    }
  };

  return (
    <DashboardLayout
      title="User Management"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "User Management" }]}
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage all system users</CardDescription>
              </div>
              <Button onClick={() => setIsAddUserDialogOpen(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 mb-6">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-3.5 w-3.5 mr-1" />
                  Filter
                </Button>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="az">A-Z</SelectItem>
                    <SelectItem value="za">Z-A</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="all">All Users</TabsTrigger>
                <TabsTrigger value="manager">Managers</TabsTrigger>
                <TabsTrigger value="trainer">Trainers</TabsTrigger>
                <TabsTrigger value="learner">Learners</TabsTrigger>
              </TabsList>

              <TabsContent value={currentTab} className="space-y-4">
                {isLoading ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Loading users...</p>
                  </div>
                ) : filteredUsers.length > 0 ? (
                  <div className="rounded-md border overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="py-3 px-4 text-left font-medium">Username</th>
                          <th className="py-3 px-4 text-left font-medium hidden md:table-cell">Email</th>
                          <th className="py-3 px-4 text-left font-medium hidden md:table-cell">Role</th>
                          {currentTab === "learner" && (
                            <th className="py-3 px-4 text-left font-medium hidden md:table-cell">Level</th>
                          )}
                          <th className="py-3 px-4 text-left font-medium hidden lg:table-cell">Created</th>
                          <th className="py-3 px-4 text-right font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {displayedUsers.map((user) => (
                          <tr key={user.id} className="bg-white hover:bg-muted/30">
                            <td className="py-3 px-4 font-medium">
                              <EditableCell
                                value={editingState.userId === user.id && editingState.field === 'username'
                                  ? editingState.value
                                  : user.username}
                                isEditing={editingState.userId === user.id && editingState.field === 'username'}
                                onChange={(value) => setEditingState({...editingState, value})}
                                onSave={() => saveEditing(user.id, 'username', user.username)}
                                onCancel={cancelEditing}
                              />
                            </td>
                            <td className="py-3 px-4 hidden md:table-cell">
                              <EditableCell
                                value={editingState.userId === user.id && editingState.field === 'email'
                                  ? editingState.value
                                  : user.email}
                                isEditing={editingState.userId === user.id && editingState.field === 'email'}
                                onChange={(value) => setEditingState({...editingState, value})}
                                onSave={() => saveEditing(user.id, 'email', user.email)}
                                onCancel={cancelEditing}
                              />
                            </td>
                            <td className="py-3 px-4 hidden md:table-cell">
                              <Badge
                                variant="outline"
                                className={
                                  user.role === "manager"
                                    ? "bg-purple-50 text-purple-700 border-purple-200"
                                    : user.role === "trainer"
                                    ? "bg-blue-50 text-blue-700 border-blue-200"
                                    : "bg-green-50 text-green-700 border-green-200"
                                }
                              >
                                {user.role}
                              </Badge>
                            </td>

                            {currentTab === "learner" && (
                              <td className="py-3 px-4 hidden md:table-cell">
                                <EditableCell
                                  value={editingState.userId === user.id && editingState.field === 'level'
                                    ? editingState.value
                                    : user.level || "beginner"}
                                  isEditing={editingState.userId === user.id && editingState.field === 'level'}
                                  onChange={(value) => setEditingState({...editingState, value})}
                                  onSave={() => saveEditing(user.id, 'level', user.level || "beginner")}
                                  onCancel={cancelEditing}
                                />
                              </td>
                            )}

                            <td className="py-3 px-4 hidden lg:table-cell text-muted-foreground">
                              {new Date(user.created_at).toLocaleString('fr-FR')}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => handleDeleteUser(user.id)}
                                  >
                                    Delete user
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 border rounded-lg">
                    <p className="text-muted-foreground">No users found</p>
                    {searchTerm && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Try adjusting your search or filters
                      </p>
                    )}
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    Showing {displayedUsers.length} of {filteredUsers.length} users
                    {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
                  </p>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages || totalPages === 0}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Add User Dialog */}
      <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account with the appropriate role.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddUser} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={newUser.username}
                onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={newUser.role}
                onValueChange={(value) => setNewUser({...newUser, role: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="learner">Learner</SelectItem>
                  <SelectItem value="trainer">Trainer</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {newUser.role === "learner" && (
              <div className="space-y-2">
                <Label htmlFor="level">Level</Label>
                <Select
                  value={newUser.level}
                  onValueChange={(value) => setNewUser({...newUser, level: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddUserDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create User"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};
export default UserManagement;