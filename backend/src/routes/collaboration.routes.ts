import { Router } from "express";
import { auth } from "../middleware/auth";
import {
  addCollaborator,
  removeCollaborator,
  updatePublicStatus,
  getPublicNote,
  getMyCollaborations,
} from "../controllers/collaboration.controller";

const router = Router();

// Protected routes (require authentication)
router.post("/notes/:noteId/collaborators", auth, addCollaborator);
router.delete(
  "/notes/:noteId/collaborators/:collaboratorId",
  auth,
  removeCollaborator
);
router.patch("/notes/:noteId/public", auth, updatePublicStatus);
router.get("/my-collaborations", auth, getMyCollaborations);

// Public routes (no authentication required)
router.get("/public/:publicId", getPublicNote);

export default router;
