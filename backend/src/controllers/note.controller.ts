import { Request, Response } from "express";
import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const createNote = async (req: AuthRequest, res: Response) => {
  try {
    const { title } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const note = await prisma.note.create({
      data: {
        title,
        userId,
      },
      include: {
        blocks: true,
      },
    });

    res.status(201).json(note);
  } catch (error) {
    console.error("Create note error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getNotes = async (req: AuthRequest, res: Response) => {
  try {
    const notes = await prisma.note.findMany({
      where: {
        userId: req.user?.id,
      },
      include: {
        blocks: {
          orderBy: {
            orderIndex: "asc",
          },
        },
      },
    });

    res.json(notes);
  } catch (error) {
    console.error("Get notes error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getNote = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const note = await prisma.note.findFirst({
      where: {
        id,
        userId: req.user?.id,
      },
      include: {
        blocks: {
          orderBy: {
            orderIndex: "asc",
          },
        },
      },
    });

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.json(note);
  } catch (error) {
    console.error("Get note error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateNote = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    const note = await prisma.note.findFirst({
      where: {
        id,
        userId: req.user?.id,
      },
    });

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    const updatedNote = await prisma.note.update({
      where: { id },
      data: { title },
      include: {
        blocks: {
          orderBy: {
            orderIndex: "asc",
          },
        },
      },
    });

    res.json(updatedNote);
  } catch (error) {
    console.error("Update note error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteNote = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const note = await prisma.note.findFirst({
      where: {
        id,
        userId: req.user?.id,
      },
    });

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    await prisma.note.delete({
      where: { id },
    });

    res.json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error("Delete note error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const createBlock = async (req: AuthRequest, res: Response) => {
  try {
    const { noteId } = req.params;
    const { type, content, parentId } = req.body;

    const note = await prisma.note.findFirst({
      where: {
        id: noteId,
        userId: req.user?.id,
      },
    });

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    // Get the highest order index
    const lastBlock = await prisma.block.findFirst({
      where: { noteId },
      orderBy: { orderIndex: "desc" },
    });

    const newOrderIndex = lastBlock ? lastBlock.orderIndex + 1 : 0;

    const block = await prisma.block.create({
      data: {
        type,
        content,
        noteId,
        parentId,
        orderIndex: newOrderIndex,
      },
    });

    res.status(201).json(block);
  } catch (error) {
    console.error("Create block error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateBlock = async (req: AuthRequest, res: Response) => {
  try {
    const { noteId, blockId } = req.params;
    const { content } = req.body;

    const note = await prisma.note.findFirst({
      where: {
        id: noteId,
        userId: req.user?.id,
      },
    });

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    const block = await prisma.block.findFirst({
      where: {
        id: blockId,
        noteId,
      },
    });

    if (!block) {
      return res.status(404).json({ message: "Block not found" });
    }

    const updatedBlock = await prisma.block.update({
      where: { id: blockId },
      data: { content },
    });

    res.json(updatedBlock);
  } catch (error) {
    console.error("Update block error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteBlock = async (req: AuthRequest, res: Response) => {
  try {
    const { noteId, blockId } = req.params;

    const note = await prisma.note.findFirst({
      where: {
        id: noteId,
        userId: req.user?.id,
      },
    });

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    const block = await prisma.block.findFirst({
      where: {
        id: blockId,
        noteId,
      },
    });

    if (!block) {
      return res.status(404).json({ message: "Block not found" });
    }

    await prisma.block.delete({
      where: { id: blockId },
    });

    res.json({ message: "Block deleted successfully" });
  } catch (error) {
    console.error("Delete block error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const reorderBlocks = async (req: AuthRequest, res: Response) => {
  try {
    const { noteId } = req.params;
    const { blocks } = req.body as {
      blocks: { id: string; orderIndex: number }[];
    };

    const note = await prisma.note.findFirst({
      where: {
        id: noteId,
        userId: req.user?.id,
      },
    });

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    // Update all blocks in a transaction
    await prisma.$transaction(
      blocks.map((block) =>
        prisma.block.update({
          where: { id: block.id },
          data: { orderIndex: block.orderIndex },
        })
      )
    );

    const updatedBlocks = await prisma.block.findMany({
      where: { noteId },
      orderBy: { orderIndex: "asc" },
    });

    res.json(updatedBlocks);
  } catch (error) {
    console.error("Reorder blocks error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
