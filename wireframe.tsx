"use client";

import { useState } from "react";
import {
  BarChart,
  Bell,
  FileText,
  Grid,
  Home,
  Users,
  LogOut,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { OrgTree } from "@/components/org-tree";
import { CreateBreakerForm } from "@/components/create-breaker-form";
import { AddUserForm } from "@/components/add-user-form";

export default function Wireframe() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [breakers, setBreakers] = useState([
    {
      id: "1",
      breakerId: "BRK001",
      name: "Breaker A",
      location: "Building 1",
      status: "Active",
      assignedUser: "John Doe",
      lastAction: "Turned on (2 hours ago)",
    },
    {
      id: "2",
      breakerId: "BRK002",
      name: "Breaker B",
      location: "Building 2",
      status: "Inactive",
      assignedUser: "Jane Smith",
      lastAction: "Turned off (1 day ago)",
    },
  ]);
  const [users, setUsers] = useState([
    {
      id: "1",
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      contact: "123-456-7890",
      hierarchyPosition: "Operator",
      permissions: "Level 2",
      status: "Active",
    },
  ]);
  const [hierarchyLevels, setHierarchyLevels] = useState([
    "Root",
    "Manager",
    "Supervisor",
    "Operator",
  ]);
  const [error, setError] = useState<string | null>(null);

  const tabs = [
    { name: "Dashboard", icon: Home },
    { name: "Organizational Management", icon: Users },
    { name: "Breaker Management", icon: Grid },
    { name: "Notifications", icon: Bell },
    { name: "Audit Logs", icon: FileText },
  ];

  const handleCreateBreaker = async (newBreaker: {
    breakerId: string;
    location: string;
    name: string;
    operator: string;
  }) => {
    try {
      const assignedUser = users.find(
        (user) => user.id === newBreaker.operator,
      );
      setBreakers((prevBreakers) => [
        ...prevBreakers,
        {
          id: (prevBreakers.length + 1).toString(),
          breakerId: newBreaker.breakerId,
          name: newBreaker.name,
          location: newBreaker.location,
          status: "Inactive",
          assignedUser: assignedUser
            ? `${assignedUser.firstName} ${assignedUser.lastName}`
            : "Unassigned",
          lastAction: "Created (just now)",
        },
      ]);
      setError(null);
    } catch (err) {
      console.error("Error creating breaker:", err);
      setError("Failed to create breaker. Please try again.");
    }
  };

  const handleAddUser = async (newUser: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    contact: string;
    hierarchyPosition: string;
    permissions: string;
  }) => {
    try {
      setUsers((prevUsers) => [
        ...prevUsers,
        {
          id: (prevUsers.length + 1).toString(),
          ...newUser,
          status: "Active",
        },
      ]);
      setError(null);
    } catch (err) {
      console.error("Error adding user:", err);
      setError("Failed to add user. Please try again.");
    }
  };

  const toggleBreakerStatus = async (breakerId: string) => {
    try {
      setBreakers((prevBreakers) =>
        prevBreakers.map((breaker) =>
          breaker.id === breakerId
            ? {
                ...breaker,
                status: breaker.status === "Active" ? "Inactive" : "Active",
              }
            : breaker,
        ),
      );
      setError(null);
    } catch (err) {
      console.error("Error toggling breaker status:", err);
      setError("Failed to update breaker status. Please try again.");
    }
  };

  const toggleUserStatus = async (userId: string) => {
    try {
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId
            ? {
                ...user,
                status: user.status === "Active" ? "Blocked" : "Active",
              }
            : user,
        ),
      );
      setError(null);
    } catch (err) {
      console.error("Error toggling user status:", err);
      setError("Failed to update user status. Please try again.");
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="flex h-full w-64 flex-col bg-white shadow-md">
        <div className="p-4 text-xl font-bold">Root Admin Dashboard</div>
        <nav className="flex-grow">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              className={`flex w-full items-center px-4 py-2 text-left ${
                activeTab === tab.name ? "bg-blue-100 text-blue-600" : ""
              }`}
              onClick={() => setActiveTab(tab.name)}
            >
              <tab.icon className="mr-2 h-5 w-5" />
              {tab.name}
            </button>
          ))}
        </nav>
        <button
          className="flex w-full items-center px-4 py-2 text-left text-red-600 hover:bg-red-100"
          onClick={() => {
            /* Add logout logic here */
          }}
        >
          <LogOut className="mr-2 h-5 w-5" />
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-8">
        <h1 className="mb-6 text-2xl font-bold">{activeTab}</h1>
        {error && (
          <div
            className="relative mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700"
            role="alert"
          >
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        {activeTab === "Dashboard" && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    Active Users:{" "}
                    {users.filter((user) => user.status === "Active").length}
                  </div>
                  <div>
                    Active Breakers:{" "}
                    {
                      breakers.filter((breaker) => breaker.status === "Active")
                        .length
                    }
                  </div>
                  <div>Alerts: 3</div>
                </div>
              </CardContent>
            </Card>
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Breaker Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex h-[200px] items-center justify-center bg-gray-200">
                  [Breaker Status Chart Placeholder]
                </div>
              </CardContent>
            </Card>
            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>10:30 AM</TableCell>
                      <TableCell>John Doe</TableCell>
                      <TableCell>Turned on Breaker XYZ</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>11:15 AM</TableCell>
                      <TableCell>Jane Smith</TableCell>
                      <TableCell>Updated user permissions</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "Organizational Management" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Organizational Hierarchy</CardTitle>
              </CardHeader>
              <CardContent>
                <OrgTree />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Add New User</CardTitle>
              </CardHeader>
              <CardContent>
                <AddUserForm
                  hierarchyLevels={hierarchyLevels}
                  onAddUser={handleAddUser}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Hierarchy Position</TableHead>
                      <TableHead>Permissions</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          {user.firstName} {user.lastName}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.contact}</TableCell>
                        <TableCell>{user.hierarchyPosition}</TableCell>
                        <TableCell>{user.permissions}</TableCell>
                        <TableCell>{user.status}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleUserStatus(user.id)}
                          >
                            {user.status === "Active" ? "Block" : "Unblock"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "Breaker Management" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Create New Breaker</CardTitle>
              </CardHeader>
              <CardContent>
                <CreateBreakerForm
                  operators={users.filter((user) => user.status === "Active")}
                  onCreateBreaker={handleCreateBreaker}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Breaker List</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Breaker ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Assigned User</TableHead>
                      <TableHead>Last Action</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {breakers.map((breaker) => (
                      <TableRow key={breaker.id}>
                        <TableCell>{breaker.breakerId}</TableCell>
                        <TableCell>{breaker.name}</TableCell>
                        <TableCell>{breaker.location}</TableCell>
                        <TableCell>{breaker.status}</TableCell>
                        <TableCell>{breaker.assignedUser}</TableCell>
                        <TableCell>{breaker.lastAction}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleBreakerStatus(breaker.id)}
                          >
                            {breaker.status === "Active"
                              ? "Turn Off"
                              : "Turn On"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "Notifications" && (
          <Card>
            <CardHeader>
              <CardTitle>Notification Feed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-md bg-red-100 p-4">
                  <div className="font-bold">Critical Alert</div>
                  <div>Breaker XYZ has failed</div>
                  <div className="mt-2 space-x-2">
                    <Button size="sm">Resolve</Button>
                    <Button variant="outline" size="sm">
                      Escalate
                    </Button>
                  </div>
                </div>
                <div className="rounded-md bg-yellow-100 p-4">
                  <div className="font-bold">Warning</div>
                  <div>Breaker ABC is nearing capacity</div>
                  <div className="mt-2 space-x-2">
                    <Button size="sm">Resolve</Button>
                    <Button variant="outline" size="sm">
                      Escalate
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "Audit Logs" && (
          <Card>
            <CardHeader>
              <CardTitle>Audit Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex justify-between">
                <div className="space-x-2">
                  <Button variant="outline" size="sm">
                    Filter by User
                  </Button>
                  <Button variant="outline" size="sm">
                    Filter by Action
                  </Button>
                  <Button variant="outline" size="sm">
                    Date Range
                  </Button>
                </div>
                <Button>Export Logs</Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>2023-06-15 14:30:00</TableCell>
                    <TableCell>John Doe</TableCell>
                    <TableCell>Breaker Operation</TableCell>
                    <TableCell>Turned on Breaker XYZ</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>2023-06-15 13:45:00</TableCell>
                    <TableCell>Jane Smith</TableCell>
                    <TableCell>User Management</TableCell>
                    <TableCell>Added new user: Mike Johnson</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
