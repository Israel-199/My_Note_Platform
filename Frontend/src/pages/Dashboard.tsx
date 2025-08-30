import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Edit3, LogOut, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { notesAPI } from '../services/api';
import { Note } from '../types';
import Button from '../components/Button';
import Input from '../components/Input';
import LoadingSpinner from '../components/LoadingSpinner';
import NoteBook from '../assets/book.png';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  
  const [newNote, setNewNote] = useState({
    title: '',
    content: ''
  });

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    setIsLoading(true);
    try {
      const response = await notesAPI.getNotes();
      setNotes(response.data?.notes ?? []); // always array
    } catch (error) {
      console.error('Failed to fetch notes:', error);
      setNotes([]); 
      toast.error('Failed to load notes');
    } finally {
      setIsLoading(false);
    }
  };
  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newNote.title.trim() || !newNote.content.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsCreating(true);
    try {
      const response = await notesAPI.createNote(newNote);
      setNotes(prev => [response.data.note, ...prev]);
      setNewNote({ title: '', content: '' });
      toast.success('Note created successfully!');
    } catch (error) {
      toast.error('Failed to create note');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingNote || !editingNote.title.trim() || !editingNote.content.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const response = await notesAPI.updateNote(editingNote.id, {
        title: editingNote.title,
        content: editingNote.content
      });
      
      setNotes(prev => prev.map(note => 
        note.id === editingNote.id ? response.data.note : note
      ));
      
      setEditingNote(null);
      toast.success('Note updated successfully!');
    } catch (error) {
      toast.error('Failed to update note');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return;
    }

    try {
      await notesAPI.deleteNote(noteId);
      setNotes(prev => prev.filter(note => note.id !== noteId));
      toast.success('Note deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete note');
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout();
      navigate('/signin');
      toast.success('Logged out successfully!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className=" items-center justify-center mr-3">
                 <img src={NoteBook} alt="NoteBook" className="inline-block w-8 h-8 mr-1" />
                 <strong>My Notes</strong>
              <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block text-right">
                {user ? (
             <div>
                <p className="text-sm font-medium text-gray-900">Welcome, {user?.fullName}!</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
                    ) : (
                <p>Loading user...</p>
                 )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section - Mobile */}
        <div className="sm:hidden bg-white rounded-lg p-4 mb-6 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Welcome, {user?.fullName}!</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Create New Note Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Note</h2>
          <form onSubmit={handleCreateNote} className="space-y-4">
            <Input
              placeholder="Note title..."
              value={newNote.title}
              onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
            />
            <textarea
              placeholder="Write your note here..."
              value={newNote.content}
              onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
              rows={4}
              className="block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
            />
            <Button
              type="submit"
              isLoading={isCreating}
              className="flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Note</span>
            </Button>
          </form>
        </div>

        {/* Notes Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Notes</h2>
            <span className="text-sm text-gray-500">{notes.length} notes</span>
          </div>

          {notes.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Edit3 className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notes yet</h3>
              <p className="text-gray-500">Create your first note to get started!</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {notes.map((note) => (
                <div key={note.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                  {editingNote?.id === note.id ? (
                    <form onSubmit={handleUpdateNote} className="space-y-4">
                      <Input
                        value={editingNote.title}
                        onChange={(e) => setEditingNote(prev => prev ? { ...prev, title: e.target.value } : null)}
                      />
                      <textarea
                        value={editingNote.content}
                        onChange={(e) => setEditingNote(prev => prev ? { ...prev, content: e.target.value } : null)}
                        rows={4}
                        className="block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                      />
                      <div className="flex space-x-2">
                        <Button type="submit" size="sm">Save</Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingNote(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                          {note.title}
                        </h3>
                        <div className="flex space-x-1 ml-2">
                          <button
                            onClick={() => setEditingNote(note)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors duration-200"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors duration-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-600 line-clamp-4 mb-4">
                        {note.content}
                      </p>
                      <div className="text-xs text-gray-400">
                        {new Date(note.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;