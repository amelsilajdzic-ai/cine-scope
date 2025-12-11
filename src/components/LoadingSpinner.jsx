export default function LoadingSpinner({ size = 'medium' }) {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16'
  };

  return (
    <div className="flex justify-center items-center min-h-[200px]">
      <div className={`${sizeClasses[size]} border-4 border-yellow-400 border-t-transparent rounded-full animate-spin`}></div>
    </div>
  );
}
