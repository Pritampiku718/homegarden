const LoadingSpinner = ({ size = 'md', fullPage = false }) => {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const spinner = (
    <div className="flex justify-center items-center">
      <div
        className={`${sizeClasses[size]} border-4 border-green-200 border-t-green-600 rounded-full animate-spin`}
        role="status"
        aria-label="Loading"
      />
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;