import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import toast from "react-hot-toast";
import api from "../../services/api";
import { uploadImage, deleteImage, extractPublicIdFromUrl } from "../../services/cloudinary";

const ManagePlants = () => {
  const [plants, setPlants] = useState([]);
  const [filteredPlants, setFilteredPlants] = useState([]);
  const [sections, setSections] = useState([]);
  const [categories, setCategories] = useState([]);
  const [varieties, setVarieties] = useState([]); // Renamed from subCategories
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [filteredVarieties, setFilteredVarieties] = useState([]); // Renamed from filteredSubCategories
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    section: "",
    category: "",
    variety: "", // Renamed from subCategory
    images: [], // Changed from single image to array
    inStock: true,
  });
  const [editingId, setEditingId] = useState(null);
  const [imageFiles, setImageFiles] = useState([]); // Changed from single file to array
  const [imagePreviews, setImagePreviews] = useState([]); // Changed from single preview to array
  const [oldImagePublicIds, setOldImagePublicIds] = useState([]); // Store old image public IDs for cleanup

  // Filter, search & pagination state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSection, setFilterSection] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterVariety, setFilterVariety] = useState("all"); // Renamed from filterSubCategory
  const [filterPriceMin, setFilterPriceMin] = useState("");
  const [filterPriceMax, setFilterPriceMax] = useState("");
  const [filterInStock, setFilterInStock] = useState(false);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchData();
  }, []);

  // Update categories when section changes
  useEffect(() => {
    if (formData.section) {
      const filtered = categories.filter(
        (c) => c.section?._id === formData.section,
      );
      setFilteredCategories(filtered);

      // Reset category if current selection not in filtered
      if (!filtered.some((c) => c._id === formData.category)) {
        setFormData((prev) => ({ ...prev, category: "", variety: "" }));
      }
    } else {
      setFilteredCategories([]);
      setFormData((prev) => ({ ...prev, category: "", variety: "" }));
    }
  }, [formData.section, categories]);

  // Update varieties when category changes
  useEffect(() => {
    if (formData.category) {
      const filtered = varieties.filter(
        (v) => v.category?._id === formData.category,
      );
      setFilteredVarieties(filtered);

      // Reset variety if current selection not in filtered
      if (!filtered.some((v) => v._id === formData.variety)) {
        setFormData((prev) => ({ ...prev, variety: "" }));
      }
    } else {
      setFilteredVarieties([]);
      setFormData((prev) => ({ ...prev, variety: "" }));
    }
  }, [formData.category, varieties]);

  // Filter and sort plants
  useEffect(() => {
    let result = [...plants];

    // Filter by section
    if (filterSection !== "all") {
      result = result.filter((plant) => plant.section?._id === filterSection);
    }

    // Filter by category
    if (filterCategory !== "all") {
      result = result.filter((plant) => plant.category?._id === filterCategory);
    }

    // Filter by variety
    if (filterVariety !== "all") {
      result = result.filter(
        (plant) => plant.variety?._id === filterVariety, // Changed from subCategory to variety
      );
    }

    // Filter by price range
    if (filterPriceMin) {
      result = result.filter(
        (plant) => plant.price >= parseFloat(filterPriceMin),
      );
    }
    if (filterPriceMax) {
      result = result.filter(
        (plant) => plant.price <= parseFloat(filterPriceMax),
      );
    }

    // Filter by stock
    if (filterInStock) {
      result = result.filter((plant) => plant.inStock === true);
    }

    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (plant) =>
          plant.name.toLowerCase().includes(term) ||
          (plant.description && plant.description.toLowerCase().includes(term)),
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === "price") {
        comparison = a.price - b.price;
      } else if (sortBy === "section") {
        comparison = (a.section?.name || "").localeCompare(
          b.section?.name || "",
        );
      } else if (sortBy === "category") {
        comparison = (a.category?.name || "").localeCompare(
          b.category?.name || "",
        );
      } else if (sortBy === "variety") { // Changed from subCategory to variety
        comparison = (a.variety?.name || "").localeCompare(
          b.variety?.name || "",
        );
      } else if (sortBy === "createdAt") {
        comparison = new Date(a.createdAt) - new Date(b.createdAt);
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    setFilteredPlants(result);
    setCurrentPage(1);
  }, [
    plants,
    searchTerm,
    filterSection,
    filterCategory,
    filterVariety,
    filterPriceMin,
    filterPriceMax,
    filterInStock,
    sortBy,
    sortOrder,
  ]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sectionsRes, categoriesRes, varietiesRes, plantsRes] =
        await Promise.all([
          api.get("/sections"),
          api.get("/categories"),
          api.get("/subcategories"), // API endpoint remains /subcategories
          api.get("/plants"),
        ]);
      setSections(sectionsRes.data.data || []);
      setCategories(categoriesRes.data.data || []);
      setVarieties(varietiesRes.data.data || []);
      setPlants(plantsRes.data.data || []);
    } catch (error) {
      toast.error("Failed to load data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      // Limit to 3 images
      const newFiles = [...imageFiles, ...files].slice(0, 3);
      setImageFiles(newFiles);

      // Create previews
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setImagePreviews(newPreviews);

      // Clear any existing image URLs in form data
      setFormData((prev) => ({ ...prev, images: [] }));
    }
  };

  const handleRemoveImage = (index) => {
    const newFiles = imageFiles.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);

    setImageFiles(newFiles);
    setImagePreviews(newPreviews);

    // Revoke object URL to avoid memory leaks
    URL.revokeObjectURL(imagePreviews[index]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.price ||
      !formData.description ||
      !formData.section ||
      !formData.category ||
      !formData.variety // Variety is now required
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    setSubmitting(true);
    try {
      let imageUrls = [...(formData.images || [])];

      // Upload new images if selected
      if (imageFiles.length > 0) {
        const uploadPromises = imageFiles.map(file => uploadImage(file));
        const uploadResults = await Promise.all(uploadPromises);

        // Extract URLs from upload results
        const newUrls = uploadResults.map(result => result.url);
        imageUrls = [...imageUrls, ...newUrls];

        // Store old image public IDs for deletion if editing
        if (editingId && oldImagePublicIds.length > 0) {
          try {
            await Promise.all(oldImagePublicIds.map(id => deleteImage(id)));
            console.log("✅ Old images deleted from Cloudinary");
          } catch (deleteErr) {
            console.error("Failed to delete old images:", deleteErr);
          }
        }
      }

      const plantData = {
        name: formData.name,
        price: parseFloat(formData.price),
        description: formData.description,
        section: formData.section,
        category: formData.category,
        variety: formData.variety, // Changed from subCategory to variety
        images: imageUrls, // Changed from single image to array
        inStock: formData.inStock,
      };

      if (editingId) {
        await api.put(`/plants/${editingId}`, plantData);
        toast.success("Plant updated successfully");
      } else {
        await api.post("/plants", plantData);
        toast.success("Plant created successfully");
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

  const handleEdit = (plant) => {
    setEditingId(plant._id);
    setFormData({
      name: plant.name,
      price: plant.price,
      description: plant.description,
      section: plant.section?._id || "",
      category: plant.category?._id || "",
      variety: plant.variety?._id || "", // Changed from subCategory to variety
      images: plant.images || [],
      inStock: plant.inStock !== false,
    });

    // Set image previews from existing images
    setImagePreviews(plant.images || []);

    // Store old image public IDs for cleanup
    if (plant.images && plant.images.length > 0) {
      const publicIds = plant.images
        .map(img => extractPublicIdFromUrl(img))
        .filter(id => id);
      setOldImagePublicIds(publicIds);
    }

    setImageFiles([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id, name, images) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    setDeleteLoading(id);
    try {
      // Delete images from Cloudinary first if they exist
      if (images && images.length > 0) {
        const publicIds = images
          .map(img => extractPublicIdFromUrl(img))
          .filter(id => id);

        if (publicIds.length > 0) {
          try {
            await Promise.all(publicIds.map(id => deleteImage(id)));
            console.log("✅ Images deleted from Cloudinary");
          } catch (deleteErr) {
            console.error("Failed to delete images from Cloudinary:", deleteErr);
          }
        }
      }

      // Delete from database
      await api.delete(`/plants/${id}`);
      toast.success("Plant deleted successfully");
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
    setFormData({
      name: "",
      price: "",
      description: "",
      section: "",
      category: "",
      variety: "",
      images: [],
      inStock: true,
    });
    setImageFiles([]);
    setImagePreviews([]);
    setEditingId(null);
    setOldImagePublicIds([]);
  };

  const handleCancel = () => {
    resetForm();
  };

  const clearAllFilters = () => {
    setFilterSection("all");
    setFilterCategory("all");
    setFilterVariety("all");
    setFilterPriceMin("");
    setFilterPriceMax("");
    setFilterInStock(false);
    setSearchTerm("");
    setSortBy("name");
    setSortOrder("asc");
  };

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPlants.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPlants.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <Helmet>
        <title>Manage Plants - HomeGarden Admin</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Manage Plants
          </h1>

          {/* Form Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-8">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingId ? "Edit Plant" : "Add New Plant"}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {/* Plant Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Plant Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                               focus:ring-2 focus:ring-green-500 focus:border-transparent
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Price (₹) *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                               focus:ring-2 focus:ring-green-500 focus:border-transparent
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>

                  {/* Section */}
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

                  {/* Category */}
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

                  {/* Variety - Now Required */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Variety *
                    </label>
                    <select
                      name="variety"
                      value={formData.variety}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                               focus:ring-2 focus:ring-green-500 focus:border-transparent
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                      disabled={!formData.category}
                    >
                      <option value="">Select a variety</option>
                      {filteredVarieties.map((variety) => (
                        <option key={variety._id} value={variety._id}>
                          {variety.name}
                        </option>
                      ))}
                    </select>
                    {!formData.category && formData.section && (
                      <p className="text-xs text-amber-600 mt-1">
                        Please select a category first
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                               focus:ring-2 focus:ring-green-500 focus:border-transparent
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                      required
                    />
                  </div>

                  {/* In Stock Checkbox */}
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="inStock"
                      id="inStock"
                      checked={formData.inStock}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <label
                      htmlFor="inStock"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      In Stock (Available for purchase)
                    </label>
                  </div>

                  {/* Multiple Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Plant Images * (Max 3 photos)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      multiple
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required={!editingId && imagePreviews.length === 0}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      You can select up to 3 images. First image will be used as primary.
                    </p>

                    {/* Image Previews */}
                    {imagePreviews.length > 0 && (
                      <div className="mt-4 grid grid-cols-3 gap-2">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border-2 border-green-500"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
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
                            {index === 0 && (
                              <span className="absolute bottom-1 left-1 bg-green-600 text-white text-xs px-1 rounded">
                                Primary
                              </span>
                            )}
                          </div>
                        ))}
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
                        "Update Plant"
                      ) : (
                        "Add Plant"
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

          {/* Advanced Search and Filter Bar */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-6">
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {/* Search */}
                <div className="lg:col-span-2 xl:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Search Plants
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
                    Section
                  </label>
                  <select
                    value={filterSection}
                    onChange={(e) => {
                      setFilterSection(e.target.value);
                      setFilterCategory("all");
                      setFilterVariety("all");
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
                    Category
                  </label>
                  <select
                    value={filterCategory}
                    onChange={(e) => {
                      setFilterCategory(e.target.value);
                      setFilterVariety("all");
                    }}
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

                {/* Filter by Variety */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Variety
                  </label>
                  <select
                    value={filterVariety}
                    onChange={(e) => setFilterVariety(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                             focus:ring-2 focus:ring-green-500 focus:border-transparent
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    disabled={filterCategory === "all"}
                  >
                    <option value="all">All Varieties</option>
                    {filterCategory !== "all" &&
                      varieties
                        .filter((v) => v.category?._id === filterCategory)
                        .map((variety) => (
                          <option key={variety._id} value={variety._id}>
                            {variety.name}
                          </option>
                        ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Price Range (₹)
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filterPriceMin}
                      onChange={(e) => setFilterPriceMin(e.target.value)}
                      className="w-1/2 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                               focus:ring-2 focus:ring-green-500 focus:border-transparent
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      min="0"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filterPriceMax}
                      onChange={(e) => setFilterPriceMax(e.target.value)}
                      className="w-1/2 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                               focus:ring-2 focus:ring-green-500 focus:border-transparent
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      min="0"
                    />
                  </div>
                </div>

                {/* In Stock Filter */}
                <div className="flex items-center space-x-3 pt-8">
                  <input
                    type="checkbox"
                    id="filterInStock"
                    checked={filterInStock}
                    onChange={(e) => setFilterInStock(e.target.checked)}
                    className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <label
                    htmlFor="filterInStock"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    In Stock Only
                  </label>
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
                    <option value="price">Price</option>
                    <option value="section">Section</option>
                    <option value="category">Category</option>
                    <option value="variety">Variety</option>
                    <option value="createdAt">Date Added</option>
                  </select>
                </div>

                {/* Sort Order */}
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

              {/* Active Filters and Results */}
              <div className="mt-4 flex flex-wrap items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {currentItems.length} of {filteredPlants.length}{" "}
                  plants
                  {searchTerm && ` (filtered from ${plants.length} total)`}
                </div>

                {(filterSection !== "all" ||
                  filterCategory !== "all" ||
                  filterVariety !== "all" ||
                  filterPriceMin ||
                  filterPriceMax ||
                  filterInStock) && (
                    <button
                      onClick={clearAllFilters}
                      className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      Clear All Filters
                    </button>
                  )}
              </div>
            </div>
          </div>

          {/* Plants List */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Plants List ({filteredPlants.length})
              </h2>
            </div>

            {loading ? (
              <div className="p-12 text-center">
                <div className="inline-block w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                  Loading plants...
                </p>
              </div>
            ) : filteredPlants.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-6xl mb-4">🌱</div>
                <p className="text-gray-600 dark:text-gray-400">
                  {searchTerm
                    ? "No plants match your search"
                    : "No plants found. Create your first plant above."}
                </p>
              </div>
            ) : (
              <>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {currentItems.map((plant) => (
                    <div
                      key={plant._id}
                      className="p-6 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        {/* Show first image as thumbnail */}
                        <img
                          src={plant.images?.[0] || plant.image}
                          alt={plant.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />

                        <div className="flex-1">
                          <div className="flex items-center space-x-2 flex-wrap gap-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {plant.name}
                            </h3>
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full">
                              {plant.section?.name}
                            </span>
                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded-full">
                              {plant.category?.name}
                            </span>
                            {plant.variety && (
                              <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs rounded-full">
                                {plant.variety.name}
                              </span>
                            )}
                            {!plant.inStock && (
                              <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs rounded-full">
                                Out of Stock
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                            {plant.description}
                          </p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-lg font-bold text-green-600 dark:text-green-400">
                              ₹{plant.price}
                            </span>
                            {plant.images && (
                              <span className="text-xs text-gray-500 dark:text-gray-500">
                                {plant.images.length} {plant.images.length === 1 ? 'photo' : 'photos'}
                              </span>
                            )}
                            <span className="text-xs text-gray-500 dark:text-gray-500">
                              Added: {new Date(plant.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(plant)}
                            className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 
                                     dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                            title="Edit plant"
                            disabled={deleteLoading === plant._id}
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(plant._id, plant.name, plant.images)}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 
                                     dark:hover:bg-red-900/30 rounded-lg transition-colors relative"
                            title="Delete plant"
                            disabled={deleteLoading === plant._id}
                          >
                            {deleteLoading === plant._id ? (
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

export default ManagePlants;