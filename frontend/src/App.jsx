import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Layout from "./components/Layout";
import LoadingSpinner from "./components/LoadingSpinner";
import AdminRoute from "./components/AdminRoute";

// Public Pages
const Home = lazy(() => import("./pages/Home"));
const Categories = lazy(() => import("./pages/Categories"));
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const PlantDetail = lazy(() => import("./pages/PlantDetail"));
const Gallery = lazy(() => import("./pages/Gallery"));
const Contact = lazy(() => import("./pages/Contact"));
const AllPlants = lazy(() => import("./pages/AllPlants"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Admin Pages
const AdminLogin = lazy(() => import("./pages/Admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/Admin/AdminDashboard"));
const ManageSections = lazy(() => import("./pages/Admin/ManageSections"));
const ManageCategories = lazy(() => import("./pages/Admin/ManageCategories"));
const ManageSubCategories = lazy(
  () => import("./pages/Admin/ManageSubCategories"),
);
const ManagePlants = lazy(() => import("./pages/Admin/ManagePlants"));

// Loading fallback
const PageLoader = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-3 h-3 bg-green-500 rounded-full animate-ping" />
      </div>
    </div>
    <p className="mt-4 text-gray-600 dark:text-gray-400 animate-pulse">
      Loading amazing plants...
    </p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Helmet>
        <html lang="en" />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#22c55e" />
        <meta name="robots" content="index, follow" />

        {/* Default Meta Tags */}
        <title>HomeGarden - Premium Plants for Your Home & Garden</title>
        <meta
          name="description"
          content="Discover luxury plants for your home and garden. Premium quality fruits, flowers, indoor and outdoor plants with expert care support."
        />
        <meta
          name="keywords"
          content="plants, nursery, garden, indoor plants, outdoor plants, flowers, fruits, premium plants"
        />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://homegarden.com" />
        <meta
          property="og:title"
          content="HomeGarden - Premium Plants for Your Home & Garden"
        />
        <meta
          property="og:description"
          content="Discover luxury plants for your home and garden. Premium quality plants with expert care support."
        />
        <meta
          property="og:image"
          content="https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=1200"
        />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="HomeGarden - Premium Plants for Your Home & Garden"
        />
        <meta
          name="twitter:description"
          content="Discover luxury plants for your home and garden. Premium quality plants with expert care support."
        />
        <meta
          name="twitter:image"
          content="https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=1200"
        />

        {/* Canonical URL */}
        <link rel="canonical" href="https://homegarden.com" />

        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="preconnect" href="https://images.unsplash.com" />
      </Helmet>

      <Layout>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/category/:slug" element={<CategoryPage />} />
            <Route path="/plants/:slug" element={<PlantDetail />} />
            <Route path="/plants" element={<AllPlants />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/contact" element={<Contact />} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/sections"
              element={
                <AdminRoute>
                  <ManageSections />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/categories"
              element={
                <AdminRoute>
                  <ManageCategories />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/subcategories"
              element={
                <AdminRoute>
                  <ManageSubCategories />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/plants"
              element={
                <AdminRoute>
                  <ManagePlants />
                </AdminRoute>
              }
            />

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
