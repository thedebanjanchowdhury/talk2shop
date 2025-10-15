export default function CategoriesBar({ categories, onClose }) {
  return (
    <div className="absolute top-16 left-0 w-full bg-stone-800 flex flex-col items-center space-y-4 py-6 md:hidden z-50">
      {categories.map((category) => (
        <button
          key={category.id}
          className="flex items-center gap-2 hover:text-blue-400 transition"
          onClick={onClose}
        >
          {category.icon}
          {category.name}
        </button>
      ))}
    </div>
  );
}
