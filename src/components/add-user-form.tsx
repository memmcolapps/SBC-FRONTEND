import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface AddUserFormProps {
  hierarchyLevels: string[]
  onAddUser: (user: {
    firstName: string
    lastName: string
    email: string
    password: string
    contact: string
    hierarchyPosition: string
    permissions: string
  }) => Promise<void>
}

export function AddUserForm({ hierarchyLevels, onAddUser }: AddUserFormProps) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [contact, setContact] = useState('')
  const [hierarchyPosition, setHierarchyPosition] = useState('')
  const [permissions, setPermissions] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (firstName && lastName && email && password && contact && hierarchyPosition && permissions) {
      try {
        await onAddUser({ firstName, lastName, email, password, contact, hierarchyPosition, permissions })
        setFirstName('')
        setLastName('')
        setEmail('')
        setPassword('')
        setContact('')
        setHierarchyPosition('')
        setPermissions('')
        setError(null)
      } catch (err) {
        console.error('Error adding user:', err)
        setError('Failed to add user. Please try again.')
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="first-name">First Name</Label>
          <Input
            id="first-name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Enter first name"
            required
          />
        </div>
        <div>
          <Label htmlFor="last-name">Last Name</Label>
          <Input
            id="last-name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Enter last name"
            required
          />
        </div>
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email"
          required
        />
      </div>
      <div>
        <Label htmlFor="password">Default Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter default password"
          required
        />
      </div>
      <div>
        <Label htmlFor="contact">Contact</Label>
        <Input
          id="contact"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder="Enter contact number"
          required
        />
      </div>
      <div>
        <Label htmlFor="user-hierarchy-position">Hierarchy Position</Label>
        <Select value={hierarchyPosition} onValueChange={setHierarchyPosition} required>
          <SelectTrigger id="user-hierarchy-position">
            <SelectValue placeholder="Select hierarchy position" />
          </SelectTrigger>
          <SelectContent>
            {hierarchyLevels.map((level) => (
              <SelectItem key={level} value={level}>{level}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="user-permissions">Permissions</Label>
        <Select value={permissions} onValueChange={setPermissions} required>
          <SelectTrigger id="user-permissions">
            <SelectValue placeholder="Select permissions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="level1">Level 1</SelectItem>
            <SelectItem value="level2">Level 2</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit">Add User</Button>
    </form>
  )
}

