import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import api from "../services/api";
import PlantCard from "../components/PlantCard";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";

// Helper to normalize plant data
const normalizePlant = (plant) => ({
  ...plant,
  inStock: plant.inStock !== false,
  price: plant.price || 0,
  description: plant.description || "No description available",
  image:
    plant.image ||
    "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=400",
});

const CategoryPage = () => {
  const { slug } = useParams();
  const [section, setSection] = useState(null);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [allPlants, setAllPlants] = useState([]);
  const [filteredPlants, setFilteredPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSubCategory, setSelectedSubCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [showInStockOnly, setShowInStockOnly] = useState(false);

  // UI states
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [activeFilterCount, setActiveFilterCount] = useState(0);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

  useEffect(() => {
    fetchData();
  }, [slug]);

  useEffect(() => {
    if (allPlants.length > 0) {
      applyFilters();
    }
  }, [
    allPlants,
    selectedCategory,
    selectedSubCategory,
    searchTerm,
    priceRange,
    sortBy,
    sortOrder,
    showInStockOnly,
  ]);

  useEffect(() => {
    // Calculate active filter count
    let count = 0;
    if (selectedCategory !== "all") count++;
    if (selectedSubCategory !== "all") count++;
    if (searchTerm) count++;
    if (priceRange.min || priceRange.max) count++;
    if (showInStockOnly) count++;
    setActiveFilterCount(count);
  }, [
    selectedCategory,
    selectedSubCategory,
    searchTerm,
    priceRange,
    showInStockOnly,
  ]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get section by slug
      const sectionRes = await api.get(`/sections/slug/${slug}`);
      const sectionData =
        sectionRes.data.data?.section ||
        sectionRes.data.data ||
        sectionRes.data;
      setSection(sectionData);

      // Get categories for this section
      const categoriesRes = await api.get(
        `/categories/section/${sectionData._id}`,
      );
      setCategories(categoriesRes.data.data || []);

      // Get subcategories for this section
      const subCategoriesRes = await api.get(`/subcategories`);
      const filteredSubs = (subCategoriesRes.data.data || []).filter(
        (sub) => sub.section?._id === sectionData._id,
      );
      setSubCategories(filteredSubs);

      // Get plants for this section
      const plantsRes = await api.get(`/plants?section=${sectionData._id}`);
      const plantsData = (plantsRes.data.data || []).map(normalizePlant);
      setAllPlants(plantsData);
      setFilteredPlants(plantsData);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.response?.data?.message || "Failed to load section");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...allPlants];

    // Filter by category
    if (selectedCategory !== "all") {
      result = result.filter(
        (plant) =>
          plant.category?._id === selectedCategory ||
          plant.category === selectedCategory,
      );
    }

    // Filter by subCategory
    if (selectedSubCategory !== "all") {
      result = result.filter(
        (plant) =>
          plant.subCategory?._id === selectedSubCategory ||
          plant.subCategory === selectedSubCategory,
      );
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(
        (plant) =>
          plant.name.toLowerCase().includes(term) ||
          (plant.description && plant.description.toLowerCase().includes(term)),
      );
    }

    // Filter by price range
    if (priceRange.min) {
      result = result.filter(
        (plant) => plant.price >= parseFloat(priceRange.min),
      );
    }
    if (priceRange.max) {
      result = result.filter(
        (plant) => plant.price <= parseFloat(priceRange.max),
      );
    }

    // Filter by stock
    if (showInStockOnly) {
      result = result.filter((plant) => plant.inStock === true);
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === "price") {
        comparison = a.price - b.price;
      } else if (sortBy === "category") {
        comparison = (a.category?.name || "").localeCompare(
          b.category?.name || "",
        );
      } else if (sortBy === "subCategory") {
        comparison = (a.subCategory?.name || "").localeCompare(
          b.subCategory?.name || "",
        );
      } else if (sortBy === "newest") {
        comparison = new Date(b.createdAt) - new Date(a.createdAt);
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    setFilteredPlants(result);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSelectedCategory("all");
    setSelectedSubCategory("all");
    setSearchTerm("");
    setPriceRange({ min: "", max: "" });
    setSortBy("name");
    setSortOrder("asc");
    setShowInStockOnly(false);
    setShowMobileFilters(false);
  };

  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    setPriceRange((prev) => ({ ...prev, [name]: value }));
  };

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPlants.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPlants.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Get filtered subcategories based on selected category
  const getFilteredSubCategories = () => {
    if (selectedCategory === "all") {
      return subCategories;
    }
    return subCategories.filter(
      (sub) => sub.category?._id === selectedCategory,
    );
  };

  const filteredSubs = getFilteredSubCategories();

  // Calculate category counts
  const categoryCounts = categories.reduce((acc, cat) => {
    acc[cat._id] = allPlants.filter(
      (p) => p.category?._id === cat._id || p.category === cat._id,
    ).length;
    return acc;
  }, {});

  // Calculate subcategory counts
  const subCategoryCounts = subCategories.reduce((acc, sub) => {
    acc[sub._id] = allPlants.filter(
      (p) => p.subCategory?._id === sub._id || p.subCategory === sub._id,
    ).length;
    return acc;
  }, {});

  const hasActiveFilters =
    selectedCategory !== "all" ||
    selectedSubCategory !== "all" ||
    searchTerm ||
    priceRange.min ||
    priceRange.max ||
    showInStockOnly;

  if (loading) return <LoadingSpinner fullPage />;

  if (error)
    return (
      <div className="container mx-auto px-4 py-16">
        <ErrorMessage message={error} retry={fetchData} />
      </div>
    );

  if (!section)
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Section Not Found
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          The section you're looking for doesn't exist.
        </p>
        <Link
          to="/"
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
        >
          Go Home
        </Link>
      </div>
    );

  return (
    <>
      <Helmet>
        <title>{section.name} - HomeGarden</title>
        <meta
          name="description"
          content={
            section.description ||
            `Explore our collection of ${section.name} at HomeGarden.`
          }
        />
      </Helmet>

      {/* Premium Section Header with Image */}
      <div className="relative h-[30vh] md:h-[40vh] lg:h-[50vh] overflow-hidden">
        {section.image ? (
          <img
            src={section.image}
            alt={section.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-green-700 to-green-900" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 container mx-auto px-4 py-6 md:py-8 lg:py-12">
          <div className="max-w-4xl">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-2 md:mb-3 drop-shadow-lg">
              {section.name}
            </h1>
            {section.description && (
              <p className="text-sm md:text-lg lg:text-xl text-gray-200 mb-3 md:mb-4 max-w-2xl drop-shadow line-clamp-2">
                {section.description}
              </p>
            )}
            <div className="flex flex-wrap gap-2 md:gap-3">
              <div className="bg-white/20 backdrop-blur-md px-3 md:px-4 py-1.5 md:py-2 rounded-full text-white text-xs md:text-sm font-medium border border-white/30">
                📁 {categories.length} Categories
              </div>
              <div className="bg-white/20 backdrop-blur-md px-3 md:px-4 py-1.5 md:py-2 rounded-full text-white text-xs md:text-sm font-medium border border-white/30">
                📑 {subCategories.length} Sub-Categories
              </div>
              <div className="bg-white/20 backdrop-blur-md px-3 md:px-4 py-1.5 md:py-2 rounded-full text-white text-xs md:text-sm font-medium border border-white/30">
                🌱 {allPlants.length} Plants
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filter Bar - Sticky at top */}
      <div className="lg:hidden sticky top-16 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-2">
          {/* Row 1: Filter Button and Quick Filters */}
          <div className="flex items-center gap-2 mb-2">
            {/* Filter Button */}
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-700 dark:text-gray-300 font-medium text-sm"
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
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-green-600 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Category Quick Select */}
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setSelectedSubCategory("all");
              }}
              className="flex-1 px-3 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-700 dark:text-gray-300 text-sm font-medium border-0 focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Categories ({allPlants.length})</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name} ({categoryCounts[cat._id] || 0})
                </option>
              ))}
            </select>
          </div>

          {/* Row 2: SubCategory Quick Select (if categories selected) */}
          {selectedCategory !== "all" && filteredSubs.length > 0 && (
            <div className="mb-2">
              <select
                value={selectedSubCategory}
                onChange={(e) => setSelectedSubCategory(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-700 dark:text-gray-300 text-sm font-medium border-0 focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Sub-Categories</option>
                {filteredSubs.map((sub) => (
                  <option key={sub._id} value={sub._id}>
                    {sub.name} ({subCategoryCounts[sub._id] || 0})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Row 3: Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search plants by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-900 dark:text-white text-sm placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:outline-none"
            />
            <svg
              className="absolute left-3 top-3 w-4 h-4 text-gray-500"
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
                className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
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
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {showMobileFilters && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
          <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-3xl max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-900 p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                All Filters
              </h3>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
              >
                <svg
                  className="w-6 h-6"
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

            <div className="p-4 space-y-6">
              {/* Categories Section */}
              {categories.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      setSelectedSubCategory("all");
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name} ({categoryCounts[cat._id] || 0})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* SubCategories Section */}
              {selectedCategory !== "all" && filteredSubs.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sub-Category
                  </label>
                  <select
                    value={selectedSubCategory}
                    onChange={(e) => setSelectedSubCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                  >
                    <option value="all">All Sub-Categories</option>
                    {filteredSubs.map((sub) => (
                      <option key={sub._id} value={sub._id}>
                        {sub.name} ({subCategoryCounts[sub._id] || 0})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Price Range (₹)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) =>
                      setPriceRange((prev) => ({
                        ...prev,
                        min: e.target.value,
                      }))
                    }
                    className="w-1/2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) =>
                      setPriceRange((prev) => ({
                        ...prev,
                        max: e.target.value,
                      }))
                    }
                    className="w-1/2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                  />
                </div>
              </div>

              {/* In Stock Only */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showInStockOnly}
                  onChange={(e) => setShowInStockOnly(e.target.checked)}
                  className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Show in stock only
                </span>
              </label>

              {/* Sort Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg mb-2"
                >
                  <option value="name">Name</option>
                  <option value="price">Price</option>
                  <option value="category">Category</option>
                  <option value="subCategory">Sub-Category</option>
                  <option value="newest">Newest</option>
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSortOrder("asc")}
                    className={`flex-1 px-3 py-2 rounded-lg border ${
                      sortOrder === "asc"
                        ? "bg-green-600 text-white border-green-600"
                        : "border-gray-300"
                    }`}
                  >
                    ↑ Asc
                  </button>
                  <button
                    onClick={() => setSortOrder("desc")}
                    className={`flex-1 px-3 py-2 rounded-lg border ${
                      sortOrder === "desc"
                        ? "bg-green-600 text-white border-green-600"
                        : "border-gray-300"
                    }`}
                  >
                    ↓ Desc
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={clearFilters}
                  className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-xl"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="flex-1 px-4 py-3 bg-green-600 text-white font-medium rounded-xl"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Filters - Hidden on mobile */}
      <div className="hidden lg:block container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Desktop Sidebar Filters */}
          <div className="w-1/4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sticky top-24 border border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Filters
              </h2>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Search Plants
                </label>
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl"
                />
              </div>

              {/* Categories */}
              {categories.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Categories
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    <button
                      onClick={() => {
                        setSelectedCategory("all");
                        setSelectedSubCategory("all");
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg transition ${
                        selectedCategory === "all"
                          ? "bg-green-600 text-white"
                          : "hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                    >
                      <span className="flex justify-between">
                        <span>All Categories</span>
                        <span
                          className={
                            selectedCategory === "all"
                              ? "text-white"
                              : "text-gray-500"
                          }
                        >
                          {allPlants.length}
                        </span>
                      </span>
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat._id}
                        onClick={() => {
                          setSelectedCategory(cat._id);
                          setSelectedSubCategory("all");
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition ${
                          selectedCategory === cat._id
                            ? "bg-green-600 text-white"
                            : "hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                      >
                        <span className="flex justify-between">
                          <span>{cat.name}</span>
                          <span
                            className={
                              selectedCategory === cat._id
                                ? "text-white"
                                : "text-gray-500"
                            }
                          >
                            {categoryCounts[cat._id] || 0}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* SubCategories */}
              {selectedCategory !== "all" && filteredSubs.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Sub-Categories
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    <button
                      onClick={() => setSelectedSubCategory("all")}
                      className={`w-full text-left px-3 py-2 rounded-lg transition ${
                        selectedSubCategory === "all"
                          ? "bg-green-600 text-white"
                          : "hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                    >
                      <span className="flex justify-between">
                        <span>All Sub-Categories</span>
                        <span
                          className={
                            selectedSubCategory === "all"
                              ? "text-white"
                              : "text-gray-500"
                          }
                        >
                          {
                            allPlants.filter(
                              (p) => p.category?._id === selectedCategory,
                            ).length
                          }
                        </span>
                      </span>
                    </button>
                    {filteredSubs.map((sub) => (
                      <button
                        key={sub._id}
                        onClick={() => setSelectedSubCategory(sub._id)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition ${
                          selectedSubCategory === sub._id
                            ? "bg-green-600 text-white"
                            : "hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                      >
                        <span className="flex justify-between">
                          <span>{sub.name}</span>
                          <span
                            className={
                              selectedSubCategory === sub._id
                                ? "text-white"
                                : "text-gray-500"
                            }
                          >
                            {subCategoryCounts[sub._id] || 0}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Price Range (₹)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) =>
                      setPriceRange((prev) => ({
                        ...prev,
                        min: e.target.value,
                      }))
                    }
                    className="w-1/2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) =>
                      setPriceRange((prev) => ({
                        ...prev,
                        max: e.target.value,
                      }))
                    }
                    className="w-1/2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                  />
                </div>
              </div>

              {/* In Stock Only */}
              <label className="flex items-center gap-3 cursor-pointer mb-6">
                <input
                  type="checkbox"
                  checked={showInStockOnly}
                  onChange={(e) => setShowInStockOnly(e.target.checked)}
                  className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Show in stock only
                </span>
              </label>

              {/* Sort Options */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg mb-2"
                >
                  <option value="name">Name</option>
                  <option value="price">Price</option>
                  <option value="category">Category</option>
                  <option value="subCategory">Sub-Category</option>
                  <option value="newest">Newest</option>
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSortOrder("asc")}
                    className={`flex-1 px-3 py-2 rounded-lg border ${
                      sortOrder === "asc"
                        ? "bg-green-600 text-white border-green-600"
                        : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    ↑ Asc
                  </button>
                  <button
                    onClick={() => setSortOrder("desc")}
                    className={`flex-1 px-3 py-2 rounded-lg border ${
                      sortOrder === "desc"
                        ? "bg-green-600 text-white border-green-600"
                        : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    ↓ Desc
                  </button>
                </div>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition"
                >
                  Clear All Filters ({activeFilterCount})
                </button>
              )}
            </div>
          </div>

          {/* Desktop Main Content */}
          <div className="w-3/4">
            {/* Results Header */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4 mb-6 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {filteredPlants.length}
                  </span>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">
                    {filteredPlants.length === 1 ? "Plant" : "Plants"}
                  </span>
                  {selectedCategory !== "all" && (
                    <span className="ml-4 text-sm text-gray-500">
                      in{" "}
                      <span className="font-medium">
                        {
                          categories.find((c) => c._id === selectedCategory)
                            ?.name
                        }
                      </span>
                    </span>
                  )}
                  {selectedSubCategory !== "all" && (
                    <span className="ml-2 text-sm text-gray-500">
                      /{" "}
                      <span className="font-medium">
                        {
                          subCategories.find(
                            (s) => s._id === selectedSubCategory,
                          )?.name
                        }
                      </span>
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Page {currentPage} of {totalPages}
                </div>
              </div>

              {/* Active Filter Tags */}
              {hasActiveFilters && (
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  {selectedCategory !== "all" && (
                    <span className="inline-flex items-center px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm rounded-full">
                      Category:{" "}
                      {categories.find((c) => c._id === selectedCategory)?.name}
                      <button
                        onClick={() => {
                          setSelectedCategory("all");
                          setSelectedSubCategory("all");
                        }}
                        className="ml-2 text-green-700 dark:text-green-400 hover:text-green-900"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {selectedSubCategory !== "all" && (
                    <span className="inline-flex items-center px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-sm rounded-full">
                      Sub:{" "}
                      {
                        subCategories.find((s) => s._id === selectedSubCategory)
                          ?.name
                      }
                      <button
                        onClick={() => setSelectedSubCategory("all")}
                        className="ml-2 text-purple-700 dark:text-purple-400 hover:text-purple-900"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {searchTerm && (
                    <span className="inline-flex items-center px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm rounded-full">
                      "{searchTerm}"
                      <button
                        onClick={() => setSearchTerm("")}
                        className="ml-2 text-blue-700 dark:text-blue-400 hover:text-blue-900"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {(priceRange.min || priceRange.max) && (
                    <span className="inline-flex items-center px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-sm rounded-full">
                      ₹{priceRange.min || "0"} - ₹{priceRange.max || "∞"}
                      <button
                        onClick={() => setPriceRange({ min: "", max: "" })}
                        className="ml-2 text-amber-700 dark:text-amber-400 hover:text-amber-900"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {showInStockOnly && (
                    <span className="inline-flex items-center px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm rounded-full">
                      In Stock Only
                      <button
                        onClick={() => setShowInStockOnly(false)}
                        className="ml-2 text-green-700 dark:text-green-400 hover:text-green-900"
                      >
                        ×
                      </button>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Plants Grid */}
            {currentItems.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-16 text-center border border-gray-100 dark:border-gray-700">
                <div className="text-8xl mb-6 opacity-30">🌱</div>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                  No Plants Found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Try adjusting your filters or search term
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="mt-6 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {currentItems.map((plant) => (
                    <PlantCard key={plant._id} plant={plant} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-between">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Showing {indexOfFirstItem + 1} -{" "}
                      {Math.min(indexOfLastItem, filteredPlants.length)} of{" "}
                      {filteredPlants.length}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl 
                                 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 
                                 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        Previous
                      </button>
                      <div className="flex gap-1">
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
                                className={`w-10 h-10 rounded-xl transition ${
                                  currentPage === pageNum
                                    ? "bg-green-600 text-white"
                                    : "border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          } else if (pageNum === currentPage - 2) {
                            return (
                              <span
                                key={i}
                                className="w-10 h-10 flex items-center justify-center"
                              >
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
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl 
                                 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 
                                 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Results (shown below filter bar) */}
      <div className="lg:hidden container mx-auto px-4 py-4">
        {/* Results Count */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              {filteredPlants.length}
            </span>
            <span className="ml-2 text-gray-600 dark:text-gray-400">
              {filteredPlants.length === 1 ? "Plant" : "Plants"}
            </span>
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-red-600 font-medium"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Active Filter Summary */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedCategory !== "all" && (
              <span className="inline-flex items-center px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full">
                {categories.find((c) => c._id === selectedCategory)?.name}
              </span>
            )}
            {selectedSubCategory !== "all" && (
              <span className="inline-flex items-center px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs rounded-full">
                {subCategories.find((s) => s._id === selectedSubCategory)?.name}
              </span>
            )}
            {searchTerm && (
              <span className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded-full">
                "{searchTerm}"
              </span>
            )}
          </div>
        )}

        {/* Plants Grid */}
        {currentItems.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">No plants found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              {currentItems.map((plant) => (
                <PlantCard key={plant._id} plant={plant} />
              ))}
            </div>

            {/* Mobile Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border rounded-lg text-sm disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border rounded-lg text-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default CategoryPage;
