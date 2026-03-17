import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { uploadImage, deleteImage, extractPublicIdFromUrl } from '../../services/cloudinary';

const ManageSections = () => {
  const [sections, setSections] = useState([]);
  const [filteredSections, setFilteredSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    image: '',
    description: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [oldImagePublicId, setOldImagePublicId] = useState(null);

  // Filter, search & pagination state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchSections();
  }, []);

  useEffect(() => {
    let result = [...sections];

    if (searchTerm) {
      result = result.filter(section =>
        section.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (section.description && section.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'createdAt') {
        comparison = new Date(a.createdAt) - new Date(b.createdAt);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredSections(result);
    setCurrentPage(1);
  }, [sections, searchTerm, sortBy, sortOrder]);

  const fetchSections = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/sections');
      setSections(data.data || []);
    } catch (error) {
      toast.error('Failed to load sections');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setFormData(prev => ({ ...prev, image: '' }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Section name is required');
      return;
    }

    setSubmitting(true);
    try {
      let imageUrl = formData.image;
      let newPublicId = null;

      // Upload new image if selected
      if (imageFile) {
        const uploadResult = await uploadImage(imageFile);
        imageUrl = uploadResult.url;
        newPublicId = uploadResult.publicId;
      }

      const sectionData = {
        name: formData.name,
        image: imageUrl || '',
        description: formData.description || ''
      };

      if (editingId) {
        // Update existing section
        await api.put(`/sections/${editingId}`, sectionData);

        // Delete old image from Cloudinary if new image was uploaded
        if (oldImagePublicId && imageFile) {
          try {
            await deleteImage(oldImagePublicId);
          } catch (deleteErr) {
            console.error('Failed to delete old image:', deleteErr);
            // Don't block the success message for this
          }
        }

        toast.success('Section updated successfully');
      } else {
        // Create new section
        await api.post('/sections', sectionData);
        toast.success('Section created successfully');
      }

      resetForm();
      fetchSections();
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (section) => {
    setEditingId(section._id);
    setFormData({
      name: section.name,
      image: section.image || '',
      description: section.description || ''
    });
    setImagePreview(section.image || '');
    // Store the old image's public ID for cleanup
    if (section.image) {
      const publicId = extractPublicIdFromUrl(section.image);
      setOldImagePublicId(publicId);
    }
    setImageFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id, name, imageUrl) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This will also delete all categories and plants in this section.`)) {
      return;
    }

    setDeleteLoading(id);
    try {
      // First delete from database
      await api.delete(`/sections/${id}`);

      // Then delete image from Cloudinary if exists
      if (imageUrl) {
        const publicId = extractPublicIdFromUrl(imageUrl);
        if (publicId) {
          try {
            await deleteImage(publicId);
          } catch (deleteErr) {
            console.error('Failed to delete image from Cloudinary:', deleteErr);
            // Don't block the success message for this
          }
        }
      }

      toast.success('Section deleted successfully');
      fetchSections();

      if (editingId === id) {
        resetForm();
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.response?.data?.message || 'Delete failed');
    } finally {
      setDeleteLoading(null);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', image: '', description: '' });
    setImageFile(null);
    setImagePreview('');
    setEditingId(null);
    setOldImagePublicId(null);
  };

  const handleCancelEdit = () => {
    resetForm();
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData(prev => ({ ...prev, image: '' }));
  };

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSections.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSections.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <Helmet>
        <title>Manage Sections - HomeGarden Admin</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Manage Sections
          </h1>

          {/* Form Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-8">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingId ? 'Edit Section' : 'Add New Section'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Section Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g., Fruits, Flowers, Indoor Plants"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                               focus:ring-2 focus:ring-green-500 focus:border-transparent
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Brief description of this section"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                               focus:ring-2 focus:ring-green-500 focus:border-transparent
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Section Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />

                    {imagePreview && (
                      <div className="mt-4 relative inline-block">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-32 h-32 object-cover rounded-lg border-2 border-green-500"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 
                                   hover:bg-red-600 transition-colors shadow-lg"
                          title="Remove image"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Recommended: Square image, at least 300x300px
                    </p>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold 
                               rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                               flex items-center"
                    >
                      {submitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Saving...
                        </>
                      ) : (
                        editingId ? 'Update Section' : 'Add Section'
                      )}
                    </button>

                    {editingId && (
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-semibold 
                                 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-6">
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Search Sections
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search by name or description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                               focus:ring-2 focus:ring-green-500 focus:border-transparent
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <svg className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                             focus:ring-2 focus:ring-green-500 focus:border-transparent
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="name">Name</option>
                    <option value="createdAt">Date Created</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Order
                  </label>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                             focus:ring-2 focus:ring-green-500 focus:border-transparent
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                Showing {currentItems.length} of {filteredSections.length} sections
                {searchTerm && ` (filtered from ${sections.length} total)`}
              </div>
            </div>
          </div>

          {/* Sections List */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Sections List
              </h2>
            </div>

            {loading ? (
              <div className="p-12 text-center">
                <div className="inline-block w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Loading sections...</p>
              </div>
            ) : filteredSections.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-6xl mb-4">📑</div>
                <p className="text-gray-600 dark:text-gray-400">
                  {searchTerm ? 'No sections match your search' : 'No sections found. Create your first section above.'}
                </p>
              </div>
            ) : (
              <>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {currentItems.map((section) => (
                    <div key={section._id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                      <div className="flex items-center space-x-4">
                        {section.image && (
                          <img
                            src={section.image}
                            alt={section.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        )}

                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {section.name}
                          </h3>
                          {section.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {section.description}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            Slug: {section.slug} • Created: {new Date(section.createdAt).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(section)}
                            className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 
                                     dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                            title="Edit section"
                            disabled={deleteLoading === section._id}
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(section._id, section.name, section.image)}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 
                                     dark:hover:bg-red-900/30 rounded-lg transition-colors relative"
                            title="Delete section"
                            disabled={deleteLoading === section._id}
                          >
                            {deleteLoading === section._id ? (
                              <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              '🗑️'
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Page {currentPage} of {totalPages}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => paginate(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                   text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 
                                   disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Previous
                        </button>

                        {[...Array(totalPages)].map((_, i) => {
                          const pageNum = i + 1;
                          if (
                            pageNum === 1 ||
                            pageNum === totalPages ||
                            (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                          ) {
                            return (
                              <button
                                key={i}
                                onClick={() => paginate(pageNum)}
                                className={`px-4 py-2 rounded-lg transition-colors ${currentPage === pageNum
                                    ? 'bg-green-600 text-white'
                                    : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                  }`}
                              >
                                {pageNum}
                              </button>
                            );
                          } else if (
                            pageNum === currentPage - 2 ||
                            pageNum === currentPage + 2
                          ) {
                            return <span key={i} className="px-2">...</span>;
                          }
                          return null;
                        })}

                        <button
                          onClick={() => paginate(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                   text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 
                                   disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ManageSections;