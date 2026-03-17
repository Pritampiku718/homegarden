import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "../../contexts/useAuth";
import api from "../../services/api";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    sections: 0,
    categories: 0,
    varieties: 0,
    plants: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    fetchStats();
    setGreeting(getGreeting());
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [sectionsRes, categoriesRes, varietiesRes, plantsRes] =
        await Promise.all([
          api.get("/sections"),
          api.get("/categories"),
          api.get("/subcategories"),
          api.get("/plants"),
        ]);

      setStats({
        sections: sectionsRes.data.data?.length || 0,
        categories: categoriesRes.data.data?.length || 0,
        varieties: varietiesRes.data.data?.length || 0,
        plants: plantsRes.data.data?.length || 0,
      });

      // Create recent activity items
      const activities = [];

      if (sectionsRes.data.data?.length > 0) {
        const latest = sectionsRes.data.data.slice(-2);
        latest.forEach((item) => {
          activities.push({
            type: "section",
            action: "created",
            name: item.name,
            time: new Date(item.createdAt).toLocaleString(),
            icon: "📑",
          });
        });
      }

      if (categoriesRes.data.data?.length > 0) {
        const latest = categoriesRes.data.data.slice(-2);
        latest.forEach((item) => {
          activities.push({
            type: "category",
            action: "created",
            name: item.name,
            time: new Date(item.createdAt).toLocaleString(),
            icon: "📂",
          });
        });
      }

      if (varietiesRes.data.data?.length > 0) {
        const latest = varietiesRes.data.data.slice(-2);
        latest.forEach((item) => {
          activities.push({
            type: "variety",
            action: "created",
            name: item.name,
            time: new Date(item.createdAt).toLocaleString(),
            icon: "🔖",
          });
        });
      }

      if (plantsRes.data.data?.length > 0) {
        const latest = plantsRes.data.data.slice(-2);
        latest.forEach((item) => {
          activities.push({
            type: "plant",
            action: "created",
            name: item.name,
            time: new Date(item.createdAt).toLocaleString(),
            icon: "🌱",
          });
        });
      }

      // Sort by date (most recent first) and take top 4
      setRecentActivity(
        activities
          .sort((a, b) => new Date(b.time) - new Date(a.time))
          .slice(0, 4),
      );
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: "Sections",
      value: stats.sections,
      icon: "📑",
      link: "/admin/sections",
      gradient: "from-blue-500 to-blue-600",
      bgLight: "bg-blue-50",
      bgDark: "dark:bg-blue-900/20",
      textLight: "text-blue-600",
      textDark: "dark:text-blue-400",
      description: "Organize your main plant categories",
    },
    {
      label: "Categories",
      value: stats.categories,
      icon: "📂",
      link: "/admin/categories",
      gradient: "from-green-500 to-green-600",
      bgLight: "bg-green-50",
      bgDark: "dark:bg-green-900/20",
      textLight: "text-green-600",
      textDark: "dark:text-green-400",
      description: "Create categories under sections",
    },
    {
      label: "Varieties",
      value: stats.varieties,
      icon: "🔖",
      link: "/admin/varieties",
      gradient: "from-purple-500 to-purple-600",
      bgLight: "bg-purple-50",
      bgDark: "dark:bg-purple-900/20",
      textLight: "text-purple-600",
      textDark: "dark:text-purple-400",
      description: "Add specific varieties to categories",
    },
    {
      label: "Plants",
      value: stats.plants,
      icon: "🌱",
      link: "/admin/plants",
      gradient: "from-orange-500 to-orange-600",
      bgLight: "bg-orange-50",
      bgDark: "dark:bg-orange-900/20",
      textLight: "text-orange-600",
      textDark: "dark:text-orange-400",
      description: "Manage all your plant inventory",
    },
  ];

  const quickActions = [
    {
      title: "Add Section",
      icon: "➕",
      link: "/admin/sections",
      color: "blue",
      description: "Create a new section",
    },
    {
      title: "Add Category",
      icon: "➕",
      link: "/admin/categories",
      color: "green",
      description: "Create a new category",
    },
    {
      title: "Add Variety",
      icon: "➕",
      link: "/admin/varieties",
      color: "purple",
      description: "Create a new variety",
    },
    {
      title: "Add Plant",
      icon: "➕",
      link: "/admin/plants",
      color: "orange",
      description: "Create a new plant",
    },
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case "section": return "📑";
      case "category": return "📂";
      case "variety": return "🔖";
      case "plant": return "🌱";
      default: return "📌";
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case "section": return "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400";
      case "category": return "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400";
      case "variety": return "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400";
      case "plant": return "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400";
      default: return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - HomeGarden</title>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        {/* Decorative Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-800 dark:from-green-800 dark:to-green-900 text-white">
          <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">
                  {greeting}, {user?.name?.split(' ')[0] || "Admin"}! 👋
                </h1>
                <p className="text-green-100 text-sm md:text-base max-w-2xl">
                  Welcome to your dashboard. Here's what's happening with your nursery today.
                </p>
              </div>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl p-4 md:p-5">
                <div className="text-3xl">🌿</div>
                <div>
                  <div className="text-xs opacity-80">Total Plants</div>
                  <div className="text-2xl font-bold">{stats.plants}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 -mt-6 md:-mt-8">
          {/* Stats Cards - Grid layout on all screens (no horizontal scroll) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat, index) => (
              <Link
                key={index}
                to={stat.link}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-5 hover:shadow-2xl transition-all transform hover:-translate-y-1 group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-12 h-12 ${stat.bgLight} ${stat.bgDark} rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}>
                    {stat.icon}
                  </div>
                  {loading ? (
                    <div className="w-10 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  ) : (
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </span>
                  )}
                </div>
                <p className={`text-sm font-medium ${stat.textLight} ${stat.textDark}`}>
                  {stat.label}
                </p>
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Click to manage</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>

          {/* Quick Actions Section */}
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-green-600 rounded-full"></span>
              Quick Actions
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {quickActions.map((action, index) => (
                <Link
                  key={index}
                  to={action.link}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 hover:shadow-xl transition-all transform hover:-translate-y-1 group relative overflow-hidden"
                >
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-br from-${action.color}-500 to-${action.color}-600`} />
                  <div className="relative">
                    <div className={`w-10 h-10 rounded-full bg-${action.color}-100 dark:bg-${action.color}-900/30 flex items-center justify-center text-xl mb-2`}>
                      {action.icon}
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                      {action.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {action.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Management Cards */}
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-green-600 rounded-full"></span>
              Management
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {statCards.map((item, index) => (
                <Link
                  key={index}
                  to={item.link}
                  className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1"
                >
                  <div className={`h-2 bg-gradient-to-r ${item.gradient}`} />
                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-12 h-12 ${item.bgLight} ${item.bgDark} rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}>
                        {item.icon}
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {item.value}
                        </div>
                        <div className={`text-xs font-medium ${item.textLight} ${item.textDark}`}>
                          Total {item.label}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                      {item.description}
                    </p>
                    <div className="flex items-center text-green-600 dark:text-green-400 text-sm font-medium group-hover:translate-x-2 transition-transform">
                      Manage {item.label}
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity and Tips Grid */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activity - Takes 2 columns on large screens */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden h-full">
                <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="w-1 h-5 bg-green-600 rounded-full"></span>
                    Recent Activity
                  </h3>
                </div>

                {loading ? (
                  <div className="p-6 space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse mb-2"></div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recentActivity.length > 0 ? (
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {recentActivity.map((activity, index) => (
                      <div
                        key={index}
                        className="p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl ${getActivityColor(activity.type)} flex items-center justify-center text-lg flex-shrink-0`}
                          >
                            {activity.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-gray-900 dark:text-white font-medium truncate">
                              <span className="font-semibold">{activity.name}</span>{" "}
                              <span className="text-gray-500 dark:text-gray-400 text-sm">was {activity.action}</span>
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {activity.time}
                            </p>
                          </div>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${getActivityColor(activity.type)} hidden sm:block`}
                          >
                            {activity.type}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-10 text-center">
                    <div className="text-6xl mb-4 opacity-30">📊</div>
                    <p className="text-gray-500 dark:text-gray-400">
                      No recent activity
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                      Start by adding items to your nursery
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Tips Column */}
            <div className="space-y-4">
              {/* Quick Tips */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-200 dark:bg-green-800 rounded-xl flex items-center justify-center text-xl">
                    💡
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Pro Tip</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Organize your plants in a hierarchy: Sections → Categories → Varieties for better navigation and customer experience.
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-200 dark:bg-blue-800 rounded-xl flex items-center justify-center text-xl">
                    🚀
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Quick Start</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Start by adding Sections, then Categories, then Varieties, and finally Plants.
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-purple-200 dark:bg-purple-800 rounded-xl flex items-center justify-center text-xl">
                    📸
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Images</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Add high-quality images to all items. First image is primary. You can add up to 3 images per plant.
                </p>
              </div>
            </div>
          </div>

          {/* Footer Stats */}
          <div className="mt-8 mb-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Sections: {stats.sections}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Categories: {stats.categories}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Varieties: {stats.varieties}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Plants: {stats.plants}</span>
                </div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;