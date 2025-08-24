import { Request, Response } from "express";
import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

// Add collaborator to a note
export const addCollaborator = async (req: AuthRequest, res: Response) => {
  try {
    const { noteId } = req.params;
    const { email, permission } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Check if the note exists and user is the owner
    const note = await prisma.note.findFirst({
      where: {
        id: noteId,
        userId: userId,
      },
    });

    if (!note) {
      return res
        .status(404)
        .json({ message: "Note not found or access denied" });
    }

    // Find the user to be added as collaborator
    const collaboratorUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!collaboratorUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if already a collaborator
    const existingCollaboration = await prisma.noteCollaborator.findUnique({
      where: {
        noteId_userId: {
          noteId,
          userId: collaboratorUser.id,
        },
      },
    });

    if (existingCollaboration) {
      return res
        .status(400)
        .json({ message: "User is already a collaborator" });
    }

    // Add collaborator
    const collaboration = await prisma.noteCollaborator.create({
      data: {
        noteId,
        userId: collaboratorUser.id,
        permission: permission.toUpperCase(),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    res.json({
      id: collaboration.id,
      email: collaboration.user.email,
      permission: collaboration.permission.toLowerCase(),
      name: collaboration.user.email.split("@")[0],
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
        collaboration.user.email
      )}&background=3b82f6&color=white`,
    });
  } catch (error) {
    console.error("Add collaborator error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Remove collaborator from a note
export const removeCollaborator = async (req: AuthRequest, res: Response) => {
  try {
    const { noteId, collaboratorId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Check if the note exists and user is the owner
    const note = await prisma.note.findFirst({
      where: {
        id: noteId,
        userId: userId,
      },
    });

    if (!note) {
      return res
        .status(404)
        .json({ message: "Note not found or access denied" });
    }

    // Remove collaborator
    await prisma.noteCollaborator.delete({
      where: {
        id: collaboratorId,
      },
    });

    res.json({ message: "Collaborator removed successfully" });
  } catch (error) {
    console.error("Remove collaborator error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update note public status
export const updatePublicStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { noteId } = req.params;
    const { isPublic } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Check if the note exists and user is the owner
    const note = await prisma.note.findFirst({
      where: {
        id: noteId,
        userId: userId,
      },
    });

    if (!note) {
      return res
        .status(404)
        .json({ message: "Note not found or access denied" });
    }

    // Generate public ID if making public
    const publicId = isPublic
      ? `public-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
      : null;

    // Update note
    const updatedNote = await prisma.note.update({
      where: { id: noteId },
      data: {
        isPublic,
        publicId,
      },
    });

    res.json({
      isPublic: updatedNote.isPublic,
      publicId: updatedNote.publicId,
      publicLink: updatedNote.publicId
        ? `${process.env.FRONTEND_URL}/public/${updatedNote.publicId}`
        : null,
    });
  } catch (error) {
    console.error("Update public status error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get public note by public ID
export const getPublicNote = async (req: Request, res: Response) => {
  try {
    const { publicId } = req.params;

    const note = await prisma.note.findFirst({
      where: {
        publicId,
        isPublic: true,
      },
      include: {
        blocks: {
          orderBy: { orderIndex: "asc" },
        },
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    if (!note) {
      return res.status(404).json({ message: "Public note not found" });
    }

    res.json({
      id: note.id,
      title: note.title,
      blocks: note.blocks,
      owner: note.user.email,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    });
  } catch (error) {
    console.error("Get public note error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get collaborations for current user
export const getMyCollaborations = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const collaborations = await prisma.noteCollaborator.findMany({
      where: {
        userId,
      },
      include: {
        note: {
          include: {
            user: {
              select: {
                email: true,
              },
            },
            blocks: {
              orderBy: { orderIndex: "asc" },
            },
          },
        },
      },
    });

    const notes = collaborations.map((collab) => ({
      id: collab.note.id,
      title: collab.note.title,
      blocks: collab.note.blocks,
      owner: collab.note.user.email,
      permission: collab.permission.toLowerCase(),
      createdAt: collab.note.createdAt,
      updatedAt: collab.note.updatedAt,
    }));

    res.json(notes);
  } catch (error) {
    console.error("Get collaborations error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
