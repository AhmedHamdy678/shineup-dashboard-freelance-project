/**
 * Generic card wrapper with rounded corners, shadow, and optional padding.
 */
export default function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-4 ${className}`}>
      {children}
    </div>
  );
}
