import React from "react";
import "./App.css";

// Import our shiny new UI components
import { Card, CardHeader, CardTitle, CardContent } from "./components/ui/Card";
import { Button } from "./components/ui/Button";
import { Badge } from "./components/ui/Badge";
import { Input } from "./components/ui/Input";
import { Select } from "./components/ui/Select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "./components/ui/Table";
import { StatCard } from "./components/ui/StatCard";
import { Users } from "lucide-react";

function App() {
  return (
    <div className="min-h-screen bg-surface-50 p-10 text-surface-900">
      <div className="mx-auto max-w-4xl space-y-8">
        <h1 className="text-3xl font-bold text-primary-900">
          UI Component Sandbox
        </h1>
        <p className="text-surface-600">
          Testing our foundational components before building pages.
        </p>

        {/* 1. TESTING BUTTONS */}
        <Card>
          <CardHeader>
            <CardTitle>Buttons</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="primary" isLoading={true}>
              Loading...
            </Button>
            <Button variant="primary" disabled={true}>
              Disabled
            </Button>
          </CardContent>
        </Card>

        {/* 2. TESTING BADGES */}
        <Card>
          <CardHeader>
            <CardTitle>Badges (Statuses)</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Badge variant="default">DRAFT</Badge>
            <Badge variant="primary">APPLIED</Badge>
            <Badge variant="success">SELECTED</Badge>
            <Badge variant="warning">SHORTLISTED</Badge>
            <Badge variant="danger">FAILED</Badge>
          </CardContent>
        </Card>

        {/* 3. TESTING INPUTS & FORMS */}
        <Card>
          <CardHeader>
            <CardTitle>Form Inputs</CardTitle>
          </CardHeader>
          <CardContent className="max-w-sm space-y-4">
            <Input label="Standard Input" placeholder="e.g. John Doe" />
            <Input
              label="Input with Error"
              placeholder="e.g. invalid@email"
              error="Please enter a valid college email address."
            />
            <Input
              label="Disabled Input"
              value="120A3015 (Locked PRN)"
              disabled={true}
            />
          </CardContent>
        </Card>
        {/* 4. TESTING STAT CARD & SELECT */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            title="Total Students"
            value="1,000"
            description="+12% from last year"
            icon={Users}
          />
          <Card>
            <CardContent className="p-6">
              <Select
                label="Filter by Branch"
                placeholder="Select a branch..."
                options={[
                  { label: "Computer Engineering", value: "cs" },
                  { label: "Information Technology", value: "it" },
                ]}
              />
            </CardContent>
          </Card>
        </div>
        {/* 5. TESTING TABLE */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Google</TableCell>
                  <TableCell>Software Engineer</TableCell>
                  <TableCell>
                    <Badge variant="success">SELECTED</Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Amazon</TableCell>
                  <TableCell>Frontend Developer</TableCell>
                  <TableCell>
                    <Badge variant="primary">APPLIED</Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default App;
