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
  const [varieties, setVarieties] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [filteredVarieties, setFilteredVarieties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Add state for total plants count
  const [totalPlants, setTotalPlants] = useState(0);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    section: "",
    category: "",
    variety: "",
    images: [],
    inStock: true,
  });
  const [editingId, setEditingId] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [oldImagePublicIds, setOldImagePublicIds] = useState([]);

  // Filter, search & pagination state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSection, setFilterSection] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterVariety, setFilterVariety] = useState("all");
  const [filterPriceMin, setFilterPriceMin] = useState("");
  const [filterPriceMax, setFilterPriceMax] = useState("");
  const [filterInStock, setFilterInStock] = useState(false);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // UI state for mobile
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilterCount, setActiveFilterCount] = useState(0);

  useEffect(() => {
    fetchData();

    // Cleanup object URLs on unmount
    return () => {
      imagePreviews.forEach(preview => URL.revokeObjectURL(preview));
    };
  }, []);

  // Calculate active filter count
  useEffect(() => {
    let count = 0;
    if (filterSection !== "all") count++;
    if (filterCategory !== "all") count++;
    if (filterVariety !== "all") count++;
    if (filterPriceMin || filterPriceMax) count++;
    if (filterInStock) count++;
    setActiveFilterCount(count);
  }, [filterSection, filterCategory, filterVariety, filterPriceMin, filterPriceMax, filterInStock]);

  // Update categories when section changes
  useEffect(() => {
    if (formData.section) {
      const filtered = categories.filter(
        (c) => c.section?._id === formData.section,
      );
      setFilteredCategories(filtered);

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

    if (filterSection !== "all") {
      result = result.filter((plant) => plant.section?._id === filterSection);
    }

    if (filterCategory !== "all") {
      result = result.filter((plant) => plant.category?._id === filterCategory);
    }

    if (filterVariety !== "all") {
      result = result.filter(
        (plant) => plant.variety?._id === filterVariety,
      );
    }

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

    if (filterInStock) {
      result = result.filter((plant) => plant.inStock === true);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (plant) =>
          plant.name.toLowerCase().includes(term) ||
          (plant.description && plant.description.toLowerCase().includes(term)),
      );
    }

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
      } else if (sortBy === "variety") {
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
          api.get("/varieties"),
          api.get("/plants", { params: { limit: 100 } }), // Increased limit to get all plants
        ]);

      setSections(sectionsRes.data.data || []);
      setCategories(categoriesRes.data.data || []);
      setVarieties(varietiesRes.data.data || []);
      setPlants(plantsRes.data.data || []);

      // Store total count from API response
      setTotalPlants(plantsRes.data.total || plantsRes.data.data?.length || 0);

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
      // Check total images will not exceed 3
      if (imageFiles.length + files.length > 3) {
        toast.error(`You can only upload up to 3 images. You have ${imageFiles.length} already.`);
        return;
      }

      // Validate each file
      for (const file of files) {
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`Image ${file.name} is too large. Max 5MB`);
          return;
        }
        if (!file.type.startsWith('image/')) {
          toast.error(`File ${file.name} is not an image`);
          return;
        }
      }

      const newFiles = [...imageFiles, ...files].slice(0, 3);
      setImageFiles(newFiles);
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setImagePreviews(newPreviews);
      setFormData((prev) => ({ ...prev, images: [] }));
    }
  };

  const handleRemoveImage = (index) => {
    const newFiles = imageFiles.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);

    // Revoke the removed object URL
    URL.revokeObjectURL(imagePreviews[index]);

    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (
      !formData.name.trim() ||
      !formData.price ||
      !formData.description ||
      !formData.section ||
      !formData.category ||
      !formData.variety
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    // Check if we have images (either existing or new)
    if (imageFiles.length === 0 && formData.images?.length === 0) {
      toast.error("Please upload at least 1 image");
      return;
    }

    setSubmitting(true);
    try {
      // Start with existing images (convert to proper format)
      let processedImages = [];

      // Process existing images (from formData.images)
      if (formData.images && formData.images.length > 0) {
        processedImages = formData.images.map((img, index) => {
          // If img is already an object with url property
          if (typeof img === 'object' && img.url) {
            return {
              url: img.url,
              publicId: img.publicId || extractPublicIdFromUrl(img.url),
              isMain: img.isMain || (index === 0 && imageFiles.length === 0)
            };
          }
          // If img is a string (URL)
          return {
            url: img,
            publicId: extractPublicIdFromUrl(img),
            isMain: index === 0 && imageFiles.length === 0
          };
        });
      }

      // Upload new images if selected
      if (imageFiles.length > 0) {
        const uploadPromises = imageFiles.map(file => uploadImage(file));
        const uploadResults = await Promise.all(uploadPromises);

        // Add new images to the array
        const newImages = uploadResults.map((result, index) => ({
          url: result.url,
          publicId: result.publicId,
          isMain: processedImages.length === 0 && index === 0 // First image is main if no existing images
        }));

        processedImages = [...processedImages, ...newImages];

        // Delete old images if editing
        if (editingId && oldImagePublicIds.length > 0) {
          try {
            await Promise.all(oldImagePublicIds.map(id => deleteImage(id)));
            console.log("✅ Old images deleted from Cloudinary");
          } catch (deleteErr) {
            console.error("Failed to delete old images:", deleteErr);
          }
        }
      }

      // Ensure we have at least one image
      if (processedImages.length === 0) {
        toast.error("No images to save");
        setSubmitting(false);
        return;
      }

      // Make sure first image is marked as main
      if (!processedImages.some(img => img.isMain)) {
        processedImages[0].isMain = true;
      }

      const plantData = {
        name: formData.name.trim(),
        price: parseFloat(formData.price),
        description: formData.description.trim(),
        section: formData.section,
        category: formData.category,
        variety: formData.variety,
        images: processedImages,
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
      setShowForm(false);
    } catch (error) {
      console.error("Submit error:", error);
      console.error("Error response:", error.response?.data);
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
      variety: plant.variety?._id || "",
      images: plant.images || [],
      inStock: plant.inStock !== false,
    });

    // Set image previews from existing images
    if (plant.images && plant.images.length > 0) {
      const previews = plant.images.map(img => img.url);
      setImagePreviews(previews);

      // Extract public IDs for cleanup
      const publicIds = plant.images
        .map(img => img.publicId || extractPublicIdFromUrl(img.url))
        .filter(id => id);
      setOldImagePublicIds(publicIds);
    }

    setImageFiles([]);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id, name, images) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    setDeleteLoading(id);
    try {
      if (images && images.length > 0) {
        const publicIds = images
          .map(img => {
            if (typeof img === 'string') {
              return extractPublicIdFromUrl(img);
            }
            return img.publicId || extractPublicIdFromUrl(img.url);
          })
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
    // Cleanup preview URLs
    imagePreviews.forEach(preview => URL.revokeObjectURL(preview));

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
    if (editingId || formData.name || formData.price || imageFiles.length > 0) {
      if (!window.confirm("You have unsaved changes. Are you sure you want to cancel?")) {
        return;
      }
    }
    resetForm();
    setShowForm(false);
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
    setShowFilters(false);
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

      {/* Add animation styles */}
      <style>
        {`
          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-slide-down {
            animation: slideDown 0.2s ease-out;
          }
        `}
      </style>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Sticky Header with Search and Filter */}
        <div className="sticky top-16 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-2">
              {/* Search Bar - 70% width */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="🔍 Search plants..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-gray-700 border-0 rounded-xl text-gray-900 dark:text-white text-sm placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
                <svg
                  className="absolute left-3 top-3.5 w-4 h-4 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Filter Button - 30% width */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all ${showFilters
                  ? 'bg-green-600 text-white'
                  : activeFilterCount > 0
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-2 border-green-500'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                <span className="font-medium text-sm">Filters</span>
                {activeFilterCount > 0 && (
                  <span className="bg-green-600 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Collapsible Filters Panel */}
        {showFilters && (
          <div className="container mx-auto px-4 py-4 animate-slide-down">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-5 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Advanced Filters</h3>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-red-600 font-medium px-3 py-1.5 bg-red-50 dark:bg-red-900/20 rounded-lg"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {/* Section Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                    Section
                  </label>
                  <select
                    value={filterSection}
                    onChange={(e) => {
                      setFilterSection(e.target.value);
                      setFilterCategory("all");
                      setFilterVariety("all");
                    }}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="all">All Sections</option>
                    {sections.map((section) => (
                      <option key={section._id} value={section._id}>
                        {section.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                    Category
                  </label>
                  <select
                    value={filterCategory}
                    onChange={(e) => {
                      setFilterCategory(e.target.value);
                      setFilterVariety("all");
                    }}
                    disabled={filterSection === "all"}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
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

                {/* Variety Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                    Variety
                  </label>
                  <select
                    value={filterVariety}
                    onChange={(e) => setFilterVariety(e.target.value)}
                    disabled={filterCategory === "all"}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
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

                {/* Price Range - Side by side on mobile */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                    Price Range (₹)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filterPriceMin}
                      onChange={(e) => setFilterPriceMin(e.target.value)}
                      className="w-1/2 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      min="0"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filterPriceMax}
                      onChange={(e) => setFilterPriceMax(e.target.value)}
                      className="w-1/2 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      min="0"
                    />
                  </div>
                </div>

                {/* In Stock Toggle */}
                <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl cursor-pointer">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Show in stock only
                  </span>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={filterInStock}
                      onChange={(e) => setFilterInStock(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </div>
                </label>

                {/* Sort Options */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                      Sort By
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="name">Name</option>
                      <option value="price">Price</option>
                      <option value="section">Section</option>
                      <option value="category">Category</option>
                      <option value="variety">Variety</option>
                      <option value="createdAt">Date Added</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                      Order
                    </label>
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="asc">Ascending</option>
                      <option value="desc">Descending</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="container mx-auto px-4 py-6">
          {/* Header with Add Button - CLEAN VERSION */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Manage Plants
            </h1>
            {!showForm && !editingId && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg hover:bg-green-700 transition-all flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Add New Plant</span>
              </button>
            )}
          </div>

          {/* Stats Summary - CLEAN SINGLE LINE */}
          <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            <span className="font-semibold text-green-600 dark:text-green-400">{totalPlants}</span> total plants •{' '}
            {plants.reduce((total, plant) => total + (plant.images?.length || 1), 0)} total images
          </div>

          {/* Form Card - Always visible when showForm is true or editing */}
          {(showForm || editingId) && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 mb-6 overflow-hidden">
              <div className="p-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  {editingId ? "✏️ Edit Plant" : "➕ Add New Plant"}
                </h2>
                <button
                  onClick={handleCancel}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                {/* Plant Name */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                    Plant Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., Alphonso Mango"
                    required
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="399"
                    required
                  />
                </div>

                {/* Section, Category, Variety in vertical layout for mobile */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                      Section *
                    </label>
                    <select
                      name="section"
                      value={formData.section}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select section</option>
                      {sections.map((section) => (
                        <option key={section._id} value={section._id}>
                          {section.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                      disabled={!formData.section}
                    >
                      <option value="">Select category</option>
                      {filteredCategories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                      Variety *
                    </label>
                    <select
                      name="variety"
                      value={formData.variety}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                      disabled={!formData.category}
                    >
                      <option value="">Select variety</option>
                      {filteredVarieties.length === 0 ? (
                        <option value="" disabled className="text-gray-400">
                          No varieties available for this category
                        </option>
                      ) : (
                        filteredVarieties.map((variety) => (
                          <option key={variety._id} value={variety._id}>
                            {variety.name}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    placeholder="Plant description..."
                    required
                  />
                </div>

                {/* In Stock Toggle */}
                <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl cursor-pointer">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    In Stock
                  </span>
                  <div className="relative">
                    <input
                      type="checkbox"
                      name="inStock"
                      checked={formData.inStock}
                      onChange={handleInputChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </div>
                </label>

                {/* Image Upload */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                    Plant Images * (Max 3)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      multiple
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer inline-flex items-center gap-2 text-green-600 dark:text-green-400"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Click to upload images</span>
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {imageFiles.length}/3 images selected
                    </p>
                  </div>

                  {/* Image Previews */}
                  {imagePreviews.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative aspect-square">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover rounded-xl border-2 border-green-500"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                          {index === 0 && (
                            <span className="absolute bottom-1 left-1 bg-green-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                              Primary
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-4 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : editingId ? (
                      'Update Plant'
                    ) : (
                      'Add Plant'
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold py-4 rounded-xl transition-all text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Results Summary - CLEAN VERSION */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing <span className="font-bold text-gray-900 dark:text-white">{filteredPlants.length}</span> plants
            </div>
          </div>

          {/* Plants List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredPlants.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-700">
              <div className="text-6xl mb-4 opacity-30">🌱</div>
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">No plants found</p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                {searchTerm ? 'Try adjusting your search' : 'Create your first plant above'}
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {currentItems.map((plant) => (
                  <div
                    key={plant._id}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all"
                  >
                    <div className="flex items-center p-4">
                      {/* Plant Image */}
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                        <img
                          src={plant.images?.[0]?.url || plant.images?.[0] || plant.image}
                          alt={plant.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Plant Info */}
                      <div className="flex-1 ml-4">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                          {plant.name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                          {plant.section && (
                            <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full">
                              {plant.section.name}
                            </span>
                          )}
                          {plant.category && (
                            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded-full">
                              {plant.category.name}
                            </span>
                          )}
                          {plant.variety && (
                            <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs rounded-full">
                              {typeof plant.variety === 'object' ? plant.variety.name : 'Variety'}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold text-green-600 dark:text-green-400">
                            ₹{plant.price}
                          </span>
                          {plant.images && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              📸 {plant.images.length}
                            </span>
                          )}
                          {!plant.inStock && (
                            <span className="text-xs text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded-full">
                              Out of Stock
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 ml-2">
                        <button
                          onClick={() => handleEdit(plant)}
                          className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(plant._id, plant.name, plant.images)}
                          className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/50 transition-all relative"
                          title="Delete"
                          disabled={deleteLoading === plant._id}
                        >
                          {deleteLoading === plant._id ? (
                            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
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
                <div className="mt-6 flex items-center justify-between">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ManagePlants;