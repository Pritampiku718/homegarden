import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import toast from "react-hot-toast";
import api from "../../services/api";
import { uploadImage, deleteImage, extractPublicIdFromUrl } from "../../services/cloudinary";

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    section: "",
    image: "",
    description: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [oldImagePublicId, setOldImagePublicId] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Filter, search & pagination state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSection, setFilterSection] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let result = [...categories];

    // Filter by section
    if (filterSection !== "all") {
      result = result.filter((cat) => cat.section?._id === filterSection);
    }

    // Apply search
    if (searchTerm) {
      result = result.filter(
        (cat) =>
          cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (cat.description &&
            cat.description.toLowerCase().includes(searchTerm.toLowerCase())),
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === "section") {
        comparison = (a.section?.name || "").localeCompare(
          b.section?.name || "",
        );
      } else if (sortBy === "createdAt") {
        comparison = new Date(a.createdAt) - new Date(b.createdAt);
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    setFilteredCategories(result);
    setCurrentPage(1);
  }, [categories, searchTerm, filterSection, sortBy, sortOrder]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sectionsRes, categoriesRes] = await Promise.all([
        api.get("/sections"),
        api.get("/categories"),
      ]);
      setSections(sectionsRes.data.data || []);
      setCategories(categoriesRes.data.data || []);
    } catch (error) {
      toast.error("Failed to load data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }

      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setFormData((prev) => ({ ...prev, image: "" }));
      setUploadProgress(0);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
    setFormData((prev) => ({ ...prev, image: "" }));
    setUploadProgress(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    if (!formData.section) {
      toast.error("Please select a section");
      return;
    }

    if (formData.name.length < 2) {
      toast.error("Category name must be at least 2 characters");
      return;
    }

    setSubmitting(true);
    try {
      let imageUrl = formData.image;
      let newPublicId = null;

      // Upload new image if selected
      if (imageFile) {
        const uploadResult = await uploadImage(imageFile, (progress) => {
          setUploadProgress(progress);
        });
        imageUrl = uploadResult.url;
        newPublicId = uploadResult.publicId;
      }

      const categoryData = {
        name: formData.name.trim(),
        section: formData.section,
        image: imageUrl || "",
        description: formData.description?.trim() || "",
      };

      if (editingId) {
        // Update existing category
        await api.put(`/categories/${editingId}`, categoryData);

        // Delete old image from Cloudinary if new image was uploaded
        if (oldImagePublicId && imageFile) {
          try {
            await deleteImage(oldImagePublicId);
            console.log("✅ Old image deleted from Cloudinary");
          } catch (deleteErr) {
            console.error("Failed to delete old image:", deleteErr);
            // Don't block the success message for this
          }
        }

        toast.success(`Category "${formData.name}" updated successfully`);
      } else {
        // Create new category
        await api.post("/categories", categoryData);
        toast.success(`Category "${formData.name}" created successfully`);
      }

      resetForm();
      fetchData();
    } catch (error) {
      console.error("Submit error:", error);

      // Handle specific error cases
      if (error.response?.status === 400) {
        toast.error(error.response.data.message || "Invalid data provided");
      } else if (error.response?.status === 409) {
        toast.error("A category with this name already exists in this section");
      } else if (error.response?.status === 500) {
        toast.error("Server error. Please try again later.");
      } else {
        toast.error(error.response?.data?.message || "Operation failed");
      }
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  };

  const handleEdit = (category) => {
    setEditingId(category._id);
    setFormData({
      name: category.name,
      section: category.section?._id || "",
      image: category.image || "",
      description: category.description || "",
    });
    setImagePreview(category.image || "");

    // Store old image public ID for cleanup
    if (category.image) {
      const publicId = extractPublicIdFromUrl(category.image);
      setOldImagePublicId(publicId);
    }

    setImageFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
    toast.success(`Editing "${category.name}"`);
  };

  const handleDelete = async (id, name, imageUrl) => {
    try {
      // Check if category has plants
      let plantCount = 0;
      try {
        const plantsRes = await api.get(`/plants?category=${id}&limit=1`);
        plantCount = plantsRes.data.total || 0;
      } catch (err) {
        console.log('Could not fetch plant count:', err);
      }

      // Custom confirmation message based on plant count
      let confirmMessage = `Are you sure you want to delete "${name}"?`;
      if (plantCount > 0) {
        confirmMessage = `Are you sure you want to delete "${name}"? This category has ${plantCount} plant${plantCount === 1 ? '' : 's'} that will also be deleted. This action cannot be undone.`;
      } else {
        confirmMessage = `Are you sure you want to delete "${name}"? This action cannot be undone.`;
      }

      if (!window.confirm(confirmMessage)) {
        return;
      }

      setDeleteLoading(id);

      // Delete image from Cloudinary first if exists
      if (imageUrl) {
        const publicId = extractPublicIdFromUrl(imageUrl);
        if (publicId) {
          try {
            await deleteImage(publicId);
            console.log("✅ Image deleted from Cloudinary");
          } catch (deleteErr) {
            console.error("Failed to delete image from Cloudinary:", deleteErr);
            // Continue with database deletion even if image delete fails
          }
        }
      }

      // Delete from database
      await api.delete(`/categories/${id}`);
      toast.success(`Category "${name}" deleted successfully`);
      fetchData();

      if (editingId === id) resetForm();
    } catch (error) {
      console.error("Delete error:", error);

      if (error.response?.status === 400) {
        toast.error(error.response.data.message || "Cannot delete this category");
      } else if (error.response?.status === 404) {
        toast.error("Category not found");
      } else {
        toast.error(error.response?.data?.message || "Delete failed");
      }
    } finally {
      setDeleteLoading(null);
    }
  };

  const resetForm = () => {
    setFormData({ name: "", section: "", image: "", description: "" });
    setImageFile(null);
    setImagePreview("");
    setEditingId(null);
    setOldImagePublicId(null);
    setUploadProgress(0);
  };

  const handleCancel = () => {
    if (window.confirm("Are you sure you want to cancel? Unsaved changes will be lost.")) {
      resetForm();
    }
  };

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCategories.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <Helmet>
        <title>Manage Categories - HomeGarden Admin</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-6 md:py-8">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 max-w-7xl">

          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Manage Categories
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
              Create, edit, and manage product categories
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-6 sm:mb-8">
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                {editingId ? `Edit Category: ${formData.name}` : "Add New Category"}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-4">
                  {/* Section Select */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Section <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="section"
                      value={formData.section}
                      onChange={handleInputChange}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                               focus:ring-2 focus:ring-green-500 focus:border-transparent
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      required
                    >
                      <option value="">Select a section</option>
                      {sections.map((section) => (
                        <option key={section._id} value={section._id}>
                          {section.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Category Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Category Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g., Lemon, Rose, Snake Plant"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                               focus:ring-2 focus:ring-green-500 focus:border-transparent
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      required
                      minLength="2"
                      maxLength="50"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formData.name.length}/50 characters
                    </p>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Description (Optional)
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Brief description of this category"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                               focus:ring-2 focus:ring-green-500 focus:border-transparent
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm resize-none"
                      maxLength="200"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formData.description.length}/200 characters
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Category Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm file:mr-3 
                               file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs 
                               file:font-semibold file:bg-green-50 file:text-green-700 
                               hover:file:bg-green-100 dark:file:bg-green-900/30 
                               dark:file:text-green-400 dark:hover:file:bg-green-900/50"
                    />

                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                          <div
                            className="bg-green-600 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Uploading: {uploadProgress}%
                        </p>
                      </div>
                    )}

                    {imagePreview && (
                      <div className="mt-3 relative inline-block group">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-lg border-2 border-green-500 shadow-md"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-1 
                                   hover:bg-red-600 transition-colors shadow-lg opacity-0 group-hover:opacity-100
                                   focus:opacity-100"
                          title="Remove image"
                        >
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Recommended: Square image, at least 300x300px, max 5MB
                    </p>
                  </div>

                  {/* Form Actions */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-green-600 hover:bg-green-700 
                               text-white font-semibold rounded-lg transition-colors disabled:opacity-50 
                               disabled:cursor-not-allowed flex items-center justify-center shadow-md 
                               hover:shadow-lg text-sm sm:text-base"
                    >
                      {submitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          {uploadProgress > 0 ? `${uploadProgress}%` : "Saving..."}
                        </>
                      ) : editingId ? (
                        "Update Category"
                      ) : (
                        "Add Category"
                      )}
                    </button>

                    {editingId && (
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-500 hover:bg-gray-600 
                                 text-white font-semibold rounded-lg transition-colors shadow-md 
                                 hover:shadow-lg text-sm sm:text-base"
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
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Search Categories
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search by name or description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 sm:pl-10 pr-9 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 
                               rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    />
                    <svg
                      className="absolute left-3 top-3 w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 
                                 dark:hover:text-gray-300"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {/* Filter by Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Filter by Section
                  </label>
                  <select
                    value={filterSection}
                    onChange={(e) => setFilterSection(e.target.value)}
                    className="w-full px-3 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 
                             rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                    <option value="all">All Sections</option>
                    {sections.map((section) => (
                      <option key={section._id} value={section._id}>
                        {section.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Sort By
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="flex-1 px-3 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 
                               rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    >
                      <option value="name">Name</option>
                      <option value="section">Section</option>
                      <option value="createdAt">Date Created</option>
                    </select>
                    <button
                      onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                      className="px-3 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 
                               rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 
                               transition-colors text-gray-700 dark:text-gray-300"
                      title={sortOrder === "asc" ? "Ascending" : "Descending"}
                    >
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Results count */}
              <div className="mt-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Showing {currentItems.length} of {filteredCategories.length} categories
                {searchTerm && ` (filtered from ${categories.length} total)`}
              </div>
            </div>
          </div>

          {/* Categories List */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                Categories List
              </h2>
            </div>

            {loading ? (
              <div className="p-8 sm:p-12 text-center">
                <div className="inline-block w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  Loading categories...
                </p>
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="p-8 sm:p-12 text-center">
                <div className="text-5xl sm:text-6xl mb-4">📂</div>
                <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg">
                  {searchTerm
                    ? `No categories match "${searchTerm}"`
                    : "No categories found. Create your first category above."}
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="mt-4 text-sm sm:text-base text-green-600 dark:text-green-400 hover:underline"
                  >
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {currentItems.map((category) => (
                    <div
                      key={category._id}
                      className="p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 
                               transition-colors duration-200"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        {/* Image */}
                        {category.image ? (
                          <img
                            src={category.image}
                            alt={category.name}
                            className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg shadow-md"
                          />
                        ) : (
                          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 dark:bg-gray-700 
                                        rounded-lg flex items-center justify-center">
                            <span className="text-2xl sm:text-3xl">🌿</span>
                          </div>
                        )}

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
                              {category.name}
                            </h3>
                            <span className="self-start sm:self-auto px-2 py-0.5 bg-green-100 
                                         dark:bg-green-900/30 text-green-700 dark:text-green-400 
                                         text-xs rounded-full w-fit">
                              {category.section?.name}
                            </span>
                          </div>

                          {category.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                              {category.description}
                            </p>
                          )}

                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            Slug: {category.slug} • Created:{" "}
                            {new Date(category.createdAt).toLocaleDateString()}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex sm:flex-col lg:flex-row gap-2 self-end sm:self-center">
                          <button
                            onClick={() => handleEdit(category)}
                            className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 
                                     dark:hover:bg-blue-900/30 rounded-lg transition-colors
                                     disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Edit category"
                            disabled={deleteLoading === category._id}
                          >
                            <span className="text-lg">✏️</span>
                          </button>
                          <button
                            onClick={() =>
                              handleDelete(category._id, category.name, category.image)
                            }
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 
                                     dark:hover:bg-red-900/30 rounded-lg transition-colors relative
                                     disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete category"
                            disabled={deleteLoading === category._id}
                          >
                            {deleteLoading === category._id ? (
                              <div className="w-5 h-5 border-2 border-red-600 border-t-transparent 
                                            rounded-full animate-spin" />
                            ) : (
                              <span className="text-lg">🗑️</span>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 order-2 sm:order-1">
                        Page {currentPage} of {totalPages}
                      </div>
                      <div className="flex flex-wrap justify-center gap-2 order-1 sm:order-2">
                        <button
                          onClick={() => paginate(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 
                                   rounded-lg text-xs sm:text-sm text-gray-700 dark:text-gray-300 
                                   hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 
                                   disabled:cursor-not-allowed transition-colors"
                        >
                          Previous
                        </button>

                        <div className="flex gap-1">
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
                                  className={`w-8 sm:w-10 h-8 sm:h-10 rounded-lg text-xs sm:text-sm 
                                           transition-colors ${currentPage === pageNum
                                      ? "bg-green-600 text-white"
                                      : "border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    }`}
                                >
                                  {pageNum}
                                </button>
                              );
                            } else if (
                              pageNum === currentPage - 2 ||
                              pageNum === currentPage + 2
                            ) {
                              return (
                                <span key={i} className="px-1 self-center text-gray-500">
                                  ...
                                </span>
                              );
                            }
                            return null;
                          })}
                        </div>

                        <button
                          onClick={() => paginate(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 
                                   rounded-lg text-xs sm:text-sm text-gray-700 dark:text-gray-300 
                                   hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 
                                   disabled:cursor-not-allowed transition-colors"
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

export default ManageCategories;