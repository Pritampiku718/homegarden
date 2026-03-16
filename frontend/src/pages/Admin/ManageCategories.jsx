import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import toast from "react-hot-toast";
import api from "../../services/api";
import { uploadImage } from "../../services/cloudinary";

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
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setFormData((prev) => ({ ...prev, image: "" }));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
    setFormData((prev) => ({ ...prev, image: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.section) {
      toast.error("Please fill all required fields");
      return;
    }

    setSubmitting(true);
    try {
      let imageUrl = formData.image;

      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const categoryData = {
        name: formData.name,
        section: formData.section,
        image: imageUrl || "",
        description: formData.description || "",
      };

      if (editingId) {
        await api.put(`/categories/${editingId}`, categoryData);
        toast.success("Category updated successfully");
      } else {
        await api.post("/categories", categoryData);
        toast.success("Category created successfully");
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

  const handleEdit = (category) => {
    setEditingId(category._id);
    setFormData({
      name: category.name,
      section: category.section?._id || "",
      image: category.image || "",
      description: category.description || "",
    });
    setImagePreview(category.image || "");
    setImageFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id, name) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${name}"? This will also delete all plants in this category.`,
      )
    ) {
      return;
    }

    setDeleteLoading(id);
    try {
      await api.delete(`/categories/${id}`);
      toast.success("Category deleted successfully");
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
    setFormData({ name: "", section: "", image: "", description: "" });
    setImageFile(null);
    setImagePreview("");
    setEditingId(null);
  };

  const handleCancel = () => {
    resetForm();
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

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Manage Categories
          </h1>

          {/* Form Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-8">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingId ? "Edit Category" : "Add New Category"}
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

                  {/* Category Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g., Lemon, Rose, Snake Plant"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                               focus:ring-2 focus:ring-green-500 focus:border-transparent
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
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
                      placeholder="Brief description of this category"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                               focus:ring-2 focus:ring-green-500 focus:border-transparent
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category Image
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
                        "Update Category"
                      ) : (
                        "Add Category"
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Search Categories
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
                  </div>
                </div>

                {/* Filter by Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Filter by Section
                  </label>
                  <select
                    value={filterSection}
                    onChange={(e) => setFilterSection(e.target.value)}
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

                {/* Sort By */}
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
                    <option value="section">Section</option>
                    <option value="createdAt">Date Created</option>
                  </select>
                </div>
              </div>

              {/* Results count */}
              <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                Showing {currentItems.length} of {filteredCategories.length}{" "}
                categories
                {searchTerm && ` (filtered from ${categories.length} total)`}
              </div>
            </div>
          </div>

          {/* Categories List */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Categories List
              </h2>
            </div>

            {loading ? (
              <div className="p-12 text-center">
                <div className="inline-block w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                  Loading categories...
                </p>
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-6xl mb-4">📂</div>
                <p className="text-gray-600 dark:text-gray-400">
                  {searchTerm
                    ? "No categories match your search"
                    : "No categories found. Create your first category above."}
                </p>
              </div>
            ) : (
              <>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {currentItems.map((category) => (
                    <div
                      key={category._id}
                      className="p-6 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        {category.image && (
                          <img
                            src={category.image}
                            alt={category.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        )}

                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {category.name}
                            </h3>
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full">
                              {category.section?.name}
                            </span>
                          </div>
                          {category.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {category.description}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            Slug: {category.slug} • Created:{" "}
                            {new Date(category.createdAt).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(category)}
                            className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 
                                     dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                            title="Edit category"
                            disabled={deleteLoading === category._id}
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() =>
                              handleDelete(category._id, category.name)
                            }
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 
                                     dark:hover:bg-red-900/30 rounded-lg transition-colors relative"
                            title="Delete category"
                            disabled={deleteLoading === category._id}
                          >
                            {deleteLoading === category._id ? (
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
                                className={`px-4 py-2 rounded-lg transition-colors ${
                                  currentPage === pageNum
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

export default ManageCategories;
