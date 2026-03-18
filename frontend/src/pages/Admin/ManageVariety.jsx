import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import toast from "react-hot-toast";
import api from "../../services/api";
import { uploadImage, deleteImage, extractPublicIdFromUrl } from "../../services/cloudinary";

const ManageVariety = () => {
  const [varieties, setVarieties] = useState([]);
  const [filteredVarieties, setFilteredVarieties] = useState([]);
  const [sections, setSections] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [activeFilterCount, setActiveFilterCount] = useState(0);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    section: "",
    category: "",
    image: "",
    description: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [oldImagePublicId, setOldImagePublicId] = useState(null);

  // Filter, search & pagination state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSection, setFilterSection] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Calculate active filters
  useEffect(() => {
    let count = 0;
    if (filterSection !== "all") count++;
    if (filterCategory !== "all") count++;
    if (searchTerm) count++;
    setActiveFilterCount(count);
  }, [filterSection, filterCategory, searchTerm]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (formData.section) {
      const filtered = categories.filter(
        (cat) => cat.section?._id === formData.section,
      );
      setFilteredCategories(filtered);
      if (!filtered.some((cat) => cat._id === formData.category)) {
        setFormData((prev) => ({ ...prev, category: "" }));
      }
    } else {
      setFilteredCategories([]);
    }
  }, [formData.section, categories]);

  useEffect(() => {
    let result = [...varieties];

    // Filter by section
    if (filterSection !== "all") {
      result = result.filter((variety) => variety.section?._id === filterSection);
    }

    // Filter by category
    if (filterCategory !== "all") {
      result = result.filter((variety) => variety.category?._id === filterCategory);
    }

    // Apply search
    if (searchTerm) {
      result = result.filter(
        (variety) =>
          variety.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (variety.description &&
            variety.description.toLowerCase().includes(searchTerm.toLowerCase())),
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
      } else if (sortBy === "category") {
        comparison = (a.category?.name || "").localeCompare(
          b.category?.name || "",
        );
      } else if (sortBy === "createdAt") {
        comparison = new Date(a.createdAt) - new Date(b.createdAt);
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    setFilteredVarieties(result);
    setCurrentPage(1);
  }, [
    varieties,
    searchTerm,
    filterSection,
    filterCategory,
    sortBy,
    sortOrder,
  ]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sectionsRes, categoriesRes, varietiesRes] = await Promise.all([
        api.get("/sections"),
        api.get("/categories"),
        api.get("/varieties"), // FIXED: changed from /subcategories
      ]);
      setSections(sectionsRes.data.data || []);
      setCategories(categoriesRes.data.data || []);
      setVarieties(varietiesRes.data.data || []);
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

      // Clean up previous preview
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }

      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setFormData((prev) => ({ ...prev, image: "" }));
    }
  };

  const handleRemoveImage = () => {
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setImagePreview("");
    setFormData((prev) => ({ ...prev, image: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.section || !formData.category) {
      toast.error("Please fill all required fields");
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

      const varietyData = {
        name: formData.name,
        section: formData.section,
        category: formData.category,
        image: imageUrl || "",
        description: formData.description || "",
      };

      if (editingId) {
        // Update existing variety
        await api.put(`/varieties/${editingId}`, varietyData); // FIXED

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

        toast.success("Variety updated successfully");
      } else {
        // Create new variety
        await api.post("/varieties", varietyData); // FIXED
        toast.success("Variety created successfully");
      }

      resetForm();
      fetchData();
    } catch (error) {
      console.error("Submit error:", error);
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (variety) => {
    setEditingId(variety._id);
    setFormData({
      name: variety.name,
      section: variety.section?._id || "",
      category: variety.category?._id || "",
      image: variety.image || "",
      description: variety.description || "",
    });
    setImagePreview(variety.image || "");

    // Store old image public ID for cleanup
    if (variety.image) {
      const publicId = extractPublicIdFromUrl(variety.image);
      setOldImagePublicId(publicId);
    }

    setImageFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id, name, imageUrl) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${name}"? This will also delete all plants in this variety.`,
      )
    ) {
      return;
    }

    setDeleteLoading(id);
    try {
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
      await api.delete(`/varieties/${id}`); // FIXED
      toast.success("Variety deleted successfully");
      fetchData();

      if (editingId === id) resetForm();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error.response?.data?.message || "Delete failed");
    } finally {
      setDeleteLoading(null);
    }
  };

  const resetForm = () => {
    // Clean up preview URL
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }

    setFormData({
      name: "",
      section: "",
      category: "",
      image: "",
      description: "",
    });
    setImageFile(null);
    setImagePreview("");
    setEditingId(null);
    setOldImagePublicId(null);
  };

  const handleCancel = () => {
    if (formData.name || formData.description || imageFile ||
      (editingId && (formData.name || formData.description))) {
      if (!window.confirm("You have unsaved changes. Are you sure you want to cancel?")) {
        return;
      }
    }
    resetForm();
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredVarieties.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(filteredVarieties.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <Helmet>
        <title>Manage Varieties - HomeGarden Admin</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Manage Varieties
          </h1>

          {/* Form Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-8">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingId ? "Edit Variety" : "Add New Variety"}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {/* Section Select */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Section *
                    </label>
                    <select
                      name="section"
                      value={formData.section}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                               focus:ring-2 focus:ring-green-500 focus:border-transparent
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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

                  {/* Category Select */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                               focus:ring-2 focus:ring-green-500 focus:border-transparent
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                      disabled={!formData.section}
                    >
                      <option value="">Select a category</option>
                      {filteredCategories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {!formData.section && (
                      <p className="text-xs text-amber-600 mt-1">
                        Please select a section first
                      </p>
                    )}
                  </div>

                  {/* Variety Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Variety Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g., Kagzi Lemon, Thai Lemon, Alphonso Mango"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                               focus:ring-2 focus:ring-green-500 focus:border-transparent
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                      maxLength="50"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formData.name.length}/50 characters
                    </p>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Brief description of this variety"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                               focus:ring-2 focus:ring-green-500 focus:border-transparent
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
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
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Variety Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />

                    {imagePreview && (
                      <div className="mt-4 relative inline-block group">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-32 h-32 object-cover rounded-lg border-2 border-green-500"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 
                                   hover:bg-red-600 transition-colors shadow-lg opacity-0 group-hover:opacity-100"
                          title="Remove image"
                        >
                          <svg
                            className="w-4 h-4"
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
                      ) : editingId ? (
                        "Update Variety"
                      ) : (
                        "Add Variety"
                      )}
                    </button>

                    {editingId && (
                      <button
                        type="button"
                        onClick={handleCancel}
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
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Search & Filter
                  {activeFilterCount > 0 && (
                    <span className="ml-2 bg-green-600 text-white px-2 py-1 rounded-full text-xs">
                      {activeFilterCount} active
                    </span>
                  )}
                </h3>
                {activeFilterCount > 0 && (
                  <button
                    onClick={() => {
                      setFilterSection("all");
                      setFilterCategory("all");
                      setSearchTerm("");
                    }}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Clear all filters
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Search Varieties
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search by name or description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                               focus:ring-2 focus:ring-green-500 focus:border-transparent
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <svg
                      className="absolute left-3 top-3.5 w-5 h-5 text-gray-400"
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
                        onClick={clearSearch}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        title="Clear search"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {/* Filter by Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Filter by Section
                  </label>
                  <select
                    value={filterSection}
                    onChange={(e) => {
                      setFilterSection(e.target.value);
                      setFilterCategory("all");
                    }}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                             focus:ring-2 focus:ring-green-500 focus:border-transparent
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="all">All Sections</option>
                    {sections.map((section) => (
                      <option key={section._id} value={section._id}>
                        {section.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filter by Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Filter by Category
                  </label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                             focus:ring-2 focus:ring-green-500 focus:border-transparent
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    disabled={filterSection === "all"}
                  >
                    <option value="all">All Categories</option>
                    {filterSection !== "all" &&
                      categories
                        .filter((cat) => cat.section?._id === filterSection)
                        .map((category) => (
                          <option key={category._id} value={category._id}>
                            {category.name}
                          </option>
                        ))}
                  </select>
                </div>
              </div>

              {/* Results count */}
              <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                Showing {currentItems.length} of {filteredVarieties.length} varieties
                {searchTerm && ` (filtered from ${varieties.length} total)`}
              </div>
            </div>
          </div>

          {/* Varieties List */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Varieties List
              </h2>
            </div>

            {loading ? (
              <div className="p-12 text-center">
                <div className="inline-block w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                  Loading varieties...
                </p>
              </div>
            ) : filteredVarieties.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-6xl mb-4">🔖</div>
                <p className="text-gray-600 dark:text-gray-400">
                  {searchTerm
                    ? `No varieties match "${searchTerm}"`
                    : "No varieties found. Create your first variety above."}
                </p>
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="mt-4 text-green-600 dark:text-green-400 hover:underline"
                  >
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {currentItems.map((variety) => (
                    <div
                      key={variety._id}
                      className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        {variety.image && (
                          <img
                            src={variety.image}
                            alt={variety.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        )}

                        <div className="flex-1">
                          <div className="flex items-center space-x-2 flex-wrap gap-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {variety.name}
                            </h3>
                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded-full">
                              {variety.section?.name}
                            </span>
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full">
                              {variety.category?.name}
                            </span>
                          </div>
                          {variety.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {variety.description}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            Slug: {variety.slug} • Created:{" "}
                            {new Date(variety.createdAt).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(variety)}
                            className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 
                                     dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                            title="Edit variety"
                            disabled={deleteLoading === variety._id}
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() =>
                              handleDelete(variety._id, variety.name, variety.image)
                            }
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 
                                     dark:hover:bg-red-900/30 rounded-lg transition-colors relative"
                            title="Delete variety"
                            disabled={deleteLoading === variety._id}
                          >
                            {deleteLoading === variety._id ? (
                              <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              "🗑️"
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
                            (pageNum >= currentPage - 1 &&
                              pageNum <= currentPage + 1)
                          ) {
                            return (
                              <button
                                key={i}
                                onClick={() => paginate(pageNum)}
                                className={`px-4 py-2 rounded-lg transition-colors ${currentPage === pageNum
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
                              <span key={i} className="px-2">
                                ...
                              </span>
                            );
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

export default ManageVariety;