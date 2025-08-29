import { Response } from 'express';
import Note from '../models/Note.js';
import { AuthRequest } from '../middlewares/auth.js';

export const createNote = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, content } = req.body;
    const userId = req.user!._id;

    if (!title || !content) {
      res.status(400).json({ error: 'Title and content are required' });
      return;
    }

    const note = new Note({
      title,
      content,
      userId
    });

    await note.save();

    res.status(201).json({
      message: 'Note created successfully',
      note: {
        id: note._id,
        title: note.title,
        content: note.content,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt
      }
    });
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ error: 'Failed to create note' });
  }
};

export const getNotes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;
    const notes = await Note.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      notes: notes.map(note => ({
        id: note._id,
        title: note.title,
        content: note.content,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt
      }))
    });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
};

export const deleteNote = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!._id;

    const note = await Note.findOneAndDelete({ _id: id, userId });

    if (!note) {
      res.status(404).json({ error: 'Note not found' });
      return;
    }

    res.status(200).json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
};

export const updateNote = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const userId = req.user!._id;

    if (!title || !content) {
      res.status(400).json({ error: 'Title and content are required' });
      return;
    }

    const note = await Note.findOneAndUpdate(
      { _id: id, userId },
      { title, content },
      { new: true }
    );

    if (!note) {
      res.status(404).json({ error: 'Note not found' });
      return;
    }

    res.status(200).json({
      message: 'Note updated successfully',
      note: {
        id: note._id,
        title: note.title,
        content: note.content,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt
      }
    });
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ error: 'Failed to update note' });
  }
};