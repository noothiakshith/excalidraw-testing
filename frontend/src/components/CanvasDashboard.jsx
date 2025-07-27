import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaShare, FaEye, FaSignOutAlt } from 'react-icons/fa';
import api from '../utils/api';
import AuthModal from './AuthModal';

function CanvasDashboard() {
    const [canvases, setCanvases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();

    const token = localStorage.getItem("token");

    useEffect(() => {
        if (token) {
            setIsAuthenticated(true);
            fetchCanvases();
        } else {
            setLoading(false);
            setShowAuthModal(true);
        }
    }, [token]);

    const fetchCanvases = async () => {
        try {
            setLoading(true);
            console.log('Fetching canvases...');
            const response = await api.get('/api/canvas');
            console.log('Canvas response:', response.data);
            setCanvases(response.data.canvases || []);
        } catch (error) {
            console.error('Error fetching canvases:', error);
            if (error.response?.status === 401) {
                // Token is invalid, show auth modal
                setIsAuthenticated(false);
                setShowAuthModal(true);
            }
        } finally {
            setLoading(false);
        }
    };

    const createNewCanvas = async () => {
        try {
            const response = await api.post('/api/create');

            if (response.data.canvas) {
                // Navigate to the new canvas
                navigate(`/canvas/${response.data.canvas.id}`);
            }
        } catch (error) {
            console.error('Error creating canvas:', error);
            alert('Failed to create canvas');
        }
    };

    const deleteCanvas = async (canvasId) => {
        if (!window.confirm('Are you sure you want to delete this canvas?')) {
            return;
        }

        try {
            await api.delete(`/api/canvas/delete/${canvasId}`);

            // Refresh the canvas list
            fetchCanvases();
        } catch (error) {
            console.error('Error deleting canvas:', error);
            alert('Failed to delete canvas');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setCanvases([]);
        setShowAuthModal(true);
    };

    const handleAuthSuccess = () => {
        setIsAuthenticated(true);
        fetchCanvases();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading your canvases...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center max-w-md mx-4">
                    <div className="w-20 h-20 mx-auto bg-blue-600 rounded-full flex items-center justify-center mb-6">
                        <FaEdit className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Whiteboard</h1>
                    <p className="text-gray-600 mb-8">Create, collaborate, and share your ideas with our powerful drawing canvas.</p>
                    <button
                        onClick={() => setShowAuthModal(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium text-lg transition-colors"
                    >
                        Get Started
                    </button>
                </div>

                <AuthModal
                    isOpen={showAuthModal}
                    onClose={() => setShowAuthModal(false)}
                    onSuccess={handleAuthSuccess}
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">My Canvases</h1>
                            <p className="text-gray-600 mt-1">Create and manage your drawing canvases</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={createNewCanvas}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-medium transition-colors"
                            >
                                <FaPlus className="w-4 h-4" />
                                New Canvas
                            </button>

                            <button
                                onClick={handleLogout}
                                className="text-gray-600 hover:text-gray-800 p-2 rounded-lg transition-colors"
                                title="Logout"
                            >
                                <FaSignOutAlt className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Canvas Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {canvases.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-24 h-24 mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-4">
                            <FaEdit className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-medium text-gray-900 mb-2">No canvases yet</h3>
                        <p className="text-gray-600 mb-6">Create your first canvas to start drawing</p>
                        <button
                            onClick={createNewCanvas}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg inline-flex items-center gap-2 font-medium transition-colors"
                        >
                            <FaPlus className="w-4 h-4" />
                            Create Canvas
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {canvases.map((canvas) => (
                            <div key={canvas.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                                {/* Canvas Preview */}
                                <div className="aspect-video bg-gray-100 rounded-t-lg relative overflow-hidden">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <FaEdit className="w-8 h-8 text-gray-400" />
                                    </div>
                                    {/* You can add canvas preview here later */}
                                </div>

                                {/* Canvas Info */}
                                <div className="p-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="font-medium text-gray-900 truncate">
                                            Canvas {canvas.id.slice(-8)}
                                        </h3>
                                    </div>

                                    <p className="text-sm text-gray-600 mb-3">
                                        Created {formatDate(canvas.createdAt)}
                                    </p>

                                    <p className="text-xs text-gray-500 mb-4">
                                        {canvas.elements?.length || 0} elements
                                    </p>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => navigate(`/canvas/${canvas.id}`)}
                                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center gap-1"
                                        >
                                            <FaEye className="w-3 h-3" />
                                            Open
                                        </button>

                                        <button
                                            onClick={() => deleteCanvas(canvas.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                                            title="Delete canvas"
                                        >
                                            <FaTrash className="w-3 h-3" />
                                        </button>

                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(`${window.location.origin}/canvas/${canvas.id}`);
                                                alert('Canvas link copied to clipboard!');
                                            }}
                                            className="p-2 text-gray-600 hover:bg-gray-50 rounded transition-colors"
                                            title="Share canvas"
                                        >
                                            <FaShare className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Auth Modal */}
            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                onSuccess={handleAuthSuccess}
            />
        </div>
    );
}

export default CanvasDashboard;