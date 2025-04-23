// src/components/organization/org-tree.tsx
"use client";

import { useState, useEffect } from "react";
import { ChevronRight, ChevronDown, Plus, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth-context";
import {
  fetchOrganizationTree,
  saveOrganizationTree,
  deleteOrganizationNode,
  createSingleNode,
  updateSingleNode,
} from "@/services/organization-service";
import type { OrganizationNode } from "@/types";

interface TreeNode {
  id: number;
  name: string;
  parent_id: number | null;
  children: TreeNode[];
}

interface TreeNodeProps {
  node: TreeNode;
  onAddChild: (parentId: number) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onRename: (id: number, newName: string) => Promise<void>;
}

const TreeNode: React.FC<TreeNodeProps> = ({
  node,
  onAddChild,
  onDelete,
  onRename,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(node.name);

  const handleToggle = () => setIsExpanded(!isExpanded);

  const handleRename = async () => {
    try {
      await onRename(node.id, newName);
      setIsEditing(false);
    } catch (error) {
      console.error("Error renaming node:", error);
      setNewName(node.name);
    }
  };

  return (
    <div className="ml-4">
      <div className="flex items-center space-x-2 text-lg">
        {node.children.length > 0 ? (
          <Button variant="ghost" size="sm" onClick={handleToggle}>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" size={10} />
            ) : (
              <ChevronRight className="h-4 w-4" size={10} />
            )}
          </Button>
        ) : (
          <span className="w-8" />
        )}
        {isEditing ? (
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => e.key === "Enter" && handleRename()}
            className="w-40"
            autoFocus
          />
        ) : (
          <span
            onClick={() => setIsEditing(true)}
            className="cursor-pointer rounded px-2 py-1 hover:bg-gray-100"
          >
            {node.name}
          </span>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddChild(node.id)}
          disabled={isEditing}
          aria-label="Add child node"
        >
          <Plus className="h-4 w-4" size={10} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(node.id)}
          disabled={isEditing}
          aria-label="Delete node"
        >
          <Trash className="h-4 w-4" size={10} />
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
  );
};

export const OrgTree: React.FC = () => {
  const { getAccessToken } = useAuth();
  const [tree, setTree] = useState<TreeNode>({
    id: 1,
    name: "Root User",
    parent_id: null,
    children: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper functions for tree manipulation
  const addChildToTree = (
    node: TreeNode,
    parentId: number,
    newNode: TreeNode,
  ): TreeNode => {
    if (node.id === parentId) {
      return { ...node, children: [...node.children, newNode] };
    }
    return {
      ...node,
      children: node.children.map((child) =>
        addChildToTree(child, parentId, newNode),
      ),
    };
  };

  const deleteFromTree = (node: TreeNode, id: number): TreeNode | null => {
    if (node.id === id) {
      return null;
    }
    return {
      ...node,
      children: node.children
        .map((child) => deleteFromTree(child, id))
        .filter(Boolean) as TreeNode[],
    };
  };

  const renameInTree = (
    node: TreeNode,
    id: number,
    newName: string,
  ): TreeNode => {
    if (node.id === id) {
      return { ...node, name: newName };
    }
    return {
      ...node,
      children: node.children.map((child) => renameInTree(child, id, newName)),
    };
  };

  const updateNodeIdInTree = (
    node: TreeNode,
    oldId: number,
    newId: number,
  ): TreeNode => {
    if (node.id === oldId) {
      return { ...node, id: newId };
    }
    return {
      ...node,
      children: node.children.map((child) =>
        updateNodeIdInTree(child, oldId, newId),
      ),
    };
  };

  const convertApiTreeToComponentTree = (
    apiNodes: OrganizationNode[],
  ): TreeNode[] => {
    return apiNodes.map((node) => ({
      id: node.id,
      name: node.name,
      parent_id: node.parent_id,
      children: node.nodes ? convertApiTreeToComponentTree(node.nodes) : [],
    }));
  };

  const convertComponentTreeToApiTree = (node: TreeNode): OrganizationNode => {
    return {
      id: node.id,
      name: node.name,
      parent_id: node.parent_id,
      nodes:
        node.children.length > 0
          ? node.children.map(convertComponentTreeToApiTree)
          : [],
    };
  };

  const saveTree = async (updatedTree: TreeNode) => {
    const token = getAccessToken();
    if (!token) {
      window.location.href = "/login";
      return;
    }

    try {
      const apiTree = convertComponentTreeToApiTree(updatedTree);
      await saveOrganizationTree(apiTree, token);
    } catch (error) {
      console.error("Failed to save organization tree:", error);
      throw error;
    }
  };

  const addChild = async (parentId: number) => {
    const token = getAccessToken();
    if (!token) {
      window.location.href = "/login";
      return;
    }

    try {
      // Generate unique name using timestamp
      const timestamp = Date.now();
      const newNodePayload = {
        name: `New Node ${timestamp}`,
        parent_id: parentId,
      };

      // Create new node
      const success = await createSingleNode(newNodePayload, token);

      if (success) {
        // Fetch the updated tree
        const updatedTreeData = await fetchOrganizationTree(token);
        if (updatedTreeData) {
          const convertedNodes = convertApiTreeToComponentTree(updatedTreeData);
          let rootNode = convertedNodes.find((node) => node.parent_id === null);
          if (!rootNode) {
            rootNode = {
              id: 1,
              name: "Root User",
              parent_id: null,
              children: convertedNodes,
            };
          }
          setTree(rootNode);
        }
      }
    } catch (error) {
      console.error("Failed to add node:", error);
      throw error instanceof Error ? error : new Error("Failed to add node");
    }
  };

  const deleteNode = async (id: number) => {
    const token = getAccessToken();
    if (!token) {
      window.location.href = "/login";
      return;
    }

    try {
      // Optimistic update
      const updatedTree = deleteFromTree(tree, id);
      if (updatedTree) {
        setTree(updatedTree);
        await deleteOrganizationNode(id, token);
      }
    } catch (error) {
      console.error("Failed to delete node:", error);
      setTree(tree);
      throw error;
    }
  };

  const renameNode = async (id: number, newName: string) => {
    const token = getAccessToken();
    if (!token) {
      window.location.href = "/login";
      return;
    }

    try {
      // Optimistic update
      const updatedTree = renameInTree(tree, id, newName);
      setTree(updatedTree);

      // Find the node to update
      const nodeToUpdate = findNodeInTree(updatedTree, id);
      if (!nodeToUpdate) {
        throw new Error("Node not found in tree");
      }

      // Update node on server
      await updateSingleNode(
        {
          id: nodeToUpdate.id,
          name: newName,
          parent_id: nodeToUpdate.parent_id,
        },
        token,
      );
    } catch (error) {
      console.error("Failed to rename node:", error);
      setTree(tree);
      throw error;
    }
  };

  // Helper function to find a node in the tree
  const findNodeInTree = (node: TreeNode, id: number): TreeNode | null => {
    if (node.id === id) {
      return node;
    }
    for (const child of node.children) {
      const found = findNodeInTree(child, id);
      if (found) {
        return found;
      }
    }
    return null;
  };

  useEffect(() => {
    const fetchTree = async () => {
      const token = getAccessToken();
      try {
        if (!token) {
          window.location.href = "/login";
          return;
        }

        const response = await fetchOrganizationTree(token);

        if (!response || !Array.isArray(response)) {
          throw new Error("Invalid organization tree structure");
        }

        const convertedNodes = convertApiTreeToComponentTree(response);

        // Find or create root node
        let rootNode = convertedNodes.find((node) => node.parent_id === null);
        if (!rootNode) {
          rootNode = {
            id: 1,
            name: "Root User",
            parent_id: null,
            children: convertedNodes,
          };
        }

        setTree(rootNode);
        setError(null);
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to load organization tree";
        setError(errorMessage);

        // Set a default empty tree structure
        setTree({
          id: 1,
          name: "Root User",
          parent_id: null,
          children: [],
        });
      } finally {
        setIsLoading(false);
      }
    };

    void fetchTree();
  }, [getAccessToken]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
        <span className="ml-2">Loading organization tree...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4">
        <h3 className="font-medium text-red-800">
          Error loading organization tree
        </h3>
        <p className="mt-1 text-red-600">{error}</p>
        <Button
          variant="outline"
          className="mt-2"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Organization Hierarchy</h2>
        <p className="text-sm text-gray-500">
          Manage your organization structure
        </p>
      </div>
      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <TreeNode
          node={tree}
          onAddChild={addChild}
          onDelete={deleteNode}
          onRename={renameNode}
        />
      </div>
    </div>
  );
};
