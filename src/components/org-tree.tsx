import React, { useState } from 'react'
import { ChevronRight, ChevronDown, Plus, Trash } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface TreeNode {
  id: string
  name: string
  children: TreeNode[]
}

interface TreeNodeProps {
  node: TreeNode
  onAddChild: (parentId: string) => void
  onDelete: (id: string) => void
  onRename: (id: string, newName: string) => void
}

const TreeNode: React.FC<TreeNodeProps> = ({ node, onAddChild, onDelete, onRename }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [newName, setNewName] = useState(node.name)

  const handleToggle = () => setIsExpanded(!isExpanded)

  const handleRename = () => {
    onRename(node.id, newName)
    setIsEditing(false)
  }

  return (
    <div className="ml-4">
      <div className="flex items-center space-x-2">
        {node.children.length > 0 ? (
          <Button variant="ghost" size="sm" onClick={handleToggle}>
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        ) : (
          <span className="w-8" />
        )}
        {isEditing ? (
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={handleRename}
            onKeyPress={(e) => e.key === 'Enter' && handleRename()}
            className="w-40"
          />
        ) : (
          <span onClick={() => setIsEditing(true)}>{node.name}</span>
        )}
        <Button variant="ghost" size="sm" onClick={() => onAddChild(node.id)}>
          <Plus className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onDelete(node.id)}>
          <Trash className="h-4 w-4" />
        </Button>
      </div>
      {isExpanded && (
        <div className="ml-4">
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              onAddChild={onAddChild}
              onDelete={onDelete}
              onRename={onRename}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export const OrgTree: React.FC = () => {
  const [tree, setTree] = useState<TreeNode>({
    id: '1',
    name: 'Root User',
    children: [],
  })

  const generateId = () => Math.random().toString(36).substr(2, 9)

  const addChild = (parentId: string) => {
    const newNode: TreeNode = { id: generateId(), name: 'New User', children: [] }
    
    const addChildToNode = (node: TreeNode): TreeNode => {
      if (node.id === parentId) {
        return { ...node, children: [...node.children, newNode] }
      }
      return {
        ...node,
        children: node.children.map(addChildToNode),
      }
    }

    setTree(addChildToNode(tree))
  }

  const deleteNode = (id: string) => {
    const deleteFromNode = (node: TreeNode): TreeNode | null => {
      if (node.id === id) {
        return null
      }
      return {
        ...node,
        children: node.children.map(deleteFromNode).filter(Boolean) as TreeNode[],
      }
    }

    setTree(deleteFromNode(tree) || tree)
  }

  const renameNode = (id: string, newName: string) => {
    const renameInNode = (node: TreeNode): TreeNode => {
      if (node.id === id) {
        return { ...node, name: newName }
      }
      return {
        ...node,
        children: node.children.map(renameInNode),
      }
    }

    setTree(renameInNode(tree))
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Organizational Hierarchy</h2>
      <TreeNode
        node={tree}
        onAddChild={addChild}
        onDelete={deleteNode}
        onRename={renameNode}
      />
    </div>
  )
}

