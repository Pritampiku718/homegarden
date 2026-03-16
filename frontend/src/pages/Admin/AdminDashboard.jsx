import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../contexts/useAuth';

const AdminDashboard = () => {
  const { user } = useAuth();

  const stats = [
    { label: 'Sections', value: '4', icon: '📑', color: 'bg-blue-500' },
    { label: 'Categories', value: '15', icon: '📂', color: 'bg-green-500' },
    { label: 'Plants', value: '16', icon: '🌱', color: 'bg-purple-500' },
    { label: 'Orders', value: '0', icon: '📦', color: 'bg-orange-500' }
  ];

  const menuItems = [
    {
      title: 'Manage Sections',
      description: 'Add, edit, or delete sections',
      icon: '📑',
      link: '/admin/sections',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Manage Categories',
      description: 'Add, edit, or delete categories',
      icon: '📂',
      link: '/admin/categories',
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Manage Plants',
      description: 'Add, edit, or delete plants',
      icon: '🌱',
      link: '/admin/plants',
      color: 'from-purple-500 to-purple-600'
    }
  ];

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
              Welcome back, {user?.name || 'Admin'}! 👋
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage your nursery's sections, categories, and plants from one central dashboard.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-2xl`}>
                    {stat.icon}
                  </div>
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</span>
                </div>
                <p className="text-gray-600 dark:text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                to={item.link}
                className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1"
              >
                <div className={`h-2 bg-gradient-to-r ${item.color}`} />
                <div className="p-6">
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {item.description}
                  </p>
                  <div className="flex items-center text-green-600 dark:text-green-400 font-semibold group-hover:translate-x-2 transition-transform">
                    Go to {item.title.split(' ')[1]}
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Recent Activity (Placeholder) */}
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recent Activity
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-center py-8">
              No recent activity to display.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;