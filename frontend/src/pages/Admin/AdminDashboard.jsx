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
    subCategories: 0,
    plants: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [sectionsRes, categoriesRes, subCategoriesRes, plantsRes] =
        await Promise.all([
          api.get("/sections"),
          api.get("/categories"),
          api.get("/subcategories"),
          api.get("/plants"),
        ]);

      setStats({
        sections: sectionsRes.data.data?.length || 0,
        categories: categoriesRes.data.data?.length || 0,
        subCategories: subCategoriesRes.data.data?.length || 0,
        plants: plantsRes.data.data?.length || 0,
      });

      // Create recent activity items
      const activities = [];

      if (sectionsRes.data.data?.length > 0) {
        const latest = sectionsRes.data.data.slice(-3);
        latest.forEach((item) => {
          activities.push({
            type: "section",
            action: "created",
            name: item.name,
            time: new Date(item.createdAt).toLocaleString(),
            icon: "📑",
            color: "blue",
          });
        });
      }

      if (categoriesRes.data.data?.length > 0) {
        const latest = categoriesRes.data.data.slice(-3);
        latest.forEach((item) => {
          activities.push({
            type: "category",
            action: "created",
            name: item.name,
            time: new Date(item.createdAt).toLocaleString(),
            icon: "📂",
            color: "green",
          });
        });
      }

      if (subCategoriesRes.data.data?.length > 0) {
        const latest = subCategoriesRes.data.data.slice(-3);
        latest.forEach((item) => {
          activities.push({
            type: "subcategory",
            action: "created",
            name: item.name,
            time: new Date(item.createdAt).toLocaleString(),
            icon: "🔖",
            color: "purple",
          });
        });
      }

      if (plantsRes.data.data?.length > 0) {
        const latest = plantsRes.data.data.slice(-3);
        latest.forEach((item) => {
          activities.push({
            type: "plant",
            action: "created",
            name: item.name,
            time: new Date(item.createdAt).toLocaleString(),
            icon: "🌱",
            color: "green",
          });
        });
      }

      // Sort by date (most recent first) and take top 5
      setRecentActivity(
        activities
          .sort((a, b) => new Date(b.time) - new Date(a.time))
          .slice(0, 5),
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
      color: "bg-blue-500",
      link: "/admin/sections",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      textColor: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "Categories",
      value: stats.categories,
      icon: "📂",
      color: "bg-green-500",
      link: "/admin/categories",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      textColor: "text-green-600 dark:text-green-400",
    },
    {
      label: "Sub-Categories",
      value: stats.subCategories,
      icon: "🔖",
      color: "bg-purple-500",
      link: "/admin/subcategories",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      textColor: "text-purple-600 dark:text-purple-400",
    },
    {
      label: "Plants",
      value: stats.plants,
      icon: "🌱",
      color: "bg-orange-500",
      link: "/admin/plants",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
      textColor: "text-orange-600 dark:text-orange-400",
    },
  ];

  const menuItems = [
    {
      title: "Manage Sections",
      description: "Add, edit, or delete sections",
      icon: "📑",
      link: "/admin/sections",
      color: "from-blue-500 to-blue-600",
      stats: stats.sections,
    },
    {
      title: "Manage Categories",
      description: "Add, edit, or delete categories",
      icon: "📂",
      link: "/admin/categories",
      color: "from-green-500 to-green-600",
      stats: stats.categories,
    },
    {
      title: "Manage Sub-Categories",
      description: "Add, edit, or delete sub-categories",
      icon: "🔖",
      link: "/admin/subcategories",
      color: "from-purple-500 to-purple-600",
      stats: stats.subCategories,
    },
    {
      title: "Manage Plants",
      description: "Add, edit, or delete plants",
      icon: "🌱",
      link: "/admin/plants",
      color: "from-green-600 to-green-700",
      stats: stats.plants,
    },
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case "section":
        return "📑";
      case "category":
        return "📂";
      case "subcategory":
        return "🔖";
      case "plant":
        return "🌱";
      default:
        return "📌";
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case "section":
        return "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400";
      case "category":
        return "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400";
      case "subcategory":
        return "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400";
      case "plant":
        return "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400";
      default:
        return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - HomeGarden</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome back, {user?.name || "Admin"}! 👋
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage your nursery's sections, categories, sub-categories, and
              plants from one central dashboard.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat, index) => (
              <Link
                key={index}
                to={stat.link}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all transform hover:-translate-y-1"
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center text-2xl`}
                  >
                    {stat.icon}
                  </div>
                  {loading ? (
                    <div className="w-12 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  ) : (
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </span>
                  )}
                </div>
                <p className={`text-sm font-medium ${stat.textColor}`}>
                  {stat.label}
                </p>
              </Link>
            ))}
          </div>

          {/* Quick Actions */}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Quick Actions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                to={item.link}
                className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1"
              >
                <div className={`h-2 bg-gradient-to-r ${item.color}`} />
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-4xl">{item.icon}</span>
                    <span className="text-2xl font-bold text-gray-400 dark:text-gray-600">
                      {item.stats}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    {item.description}
                  </p>
                  <div className="flex items-center text-green-600 dark:text-green-400 font-semibold group-hover:translate-x-2 transition-transform">
                    Manage
                    <svg
                      className="w-5 h-5 ml-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Activity
              </h3>
            </div>

            {loading ? (
              <div className="p-8 space-y-4">
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
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-10 h-10 rounded-full ${getActivityColor(activity.type)} flex items-center justify-center text-xl`}
                      >
                        {activity.icon}
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-900 dark:text-white">
                          <span className="font-semibold">{activity.name}</span>{" "}
                          {activity.action}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {activity.time}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${getActivityColor(activity.type)}`}
                      >
                        {activity.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="text-6xl mb-4 opacity-30">📊</div>
                <p className="text-gray-500 dark:text-gray-400">
                  No recent activity to display.
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                  Start by adding sections, categories, or plants
                </p>
              </div>
            )}
          </div>

          {/* Quick Tips */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-6">
              <div className="text-3xl mb-3">💡</div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Pro Tip
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Organize your plants in sections → categories → sub-categories
                for better navigation.
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6">
              <div className="text-3xl mb-3">🚀</div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Quick Start
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Add sections first, then categories, then sub-categories, and
                finally plants.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-6">
              <div className="text-3xl mb-3">📸</div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Images
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Add high-quality images to sections, categories, and plants for
                better engagement.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
