import { Router } from "express";
import { check } from "express-validator";
import { validate } from "../middleware/validation";
import { auth } from "../middleware/auth";
import {
  createNote,
  getNotes,
  getNote,
  updateNote,
  deleteNote,
  createBlock,
  updateBlock,
  deleteBlock,
  reorderBlocks,
} from "../controllers/note.controller";

const router = Router();

// Note routes
router.post(
  "/",
  auth,
  [check("title", "Title is required").not().isEmpty(), validate],
  createNote
);

router.get("/", auth, getNotes);
router.get("/:id", auth, getNote);
router.put(
  "/:id",
  auth,
  [check("title", "Title is required").not().isEmpty(), validate],
  updateNote
);
router.delete("/:id", auth, deleteNote);

// Block routes
router.post(
  "/:noteId/blocks",
  auth,
  [
    check("type", "Block type is required").isIn([
      "TEXT",
      "CHECKLIST",
      "IMAGE",
      "CODE",
    ]),
    check("content", "Content is required").not().isEmpty(),
    validate,
  ],
  createBlock
);

router.put(
  "/:noteId/blocks/:blockId",
  auth,
  [check("content", "Content is required").not().isEmpty(), validate],
  updateBlock
);

router.delete("/:noteId/blocks/:blockId", auth, deleteBlock);

router.put(
  "/:noteId/blocks/reorder",
  auth,
  [
    check("blocks", "Blocks array is required").isArray(),
    check("blocks.*.id", "Block ID is required").not().isEmpty(),
    check("blocks.*.orderIndex", "Order index is required").isInt({ min: 0 }),
    validate,
  ],
  reorderBlocks
);

export default router;
