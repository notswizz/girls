export default function LoadingSpinner({ size = 'md' }) {
  // Size classes
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  };
  
  const spinnerSize = sizeClasses[size] || sizeClasses.md;
  
  return (
    <div className="flex flex-col justify-center items-center gap-3">
      <div className={`${spinnerSize} relative`}>
        <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-b-2 border-transparent border-l-2 border-pink-500 animate-spin"></div>
        <div className="absolute inset-0 rounded-full border-r-2 border-t-2 border-transparent border-b-2 border-purple-500 animate-spin-slow"></div>
        <div className="absolute inset-0 rounded-full border-b-2 border-l-2 border-transparent border-r-2 border-indigo-500 animate-spin-slower"></div>
      </div>
      <div className="text-sm font-medium text-gray-500">Loading</div>
    </div>
  );
} 