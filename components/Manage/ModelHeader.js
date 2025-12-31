import { FaUpload } from 'react-icons/fa';

export default function ModelHeader({ selectedModel, imageCount, onUploadClick }) {
  if (!selectedModel) return null;

  return (
    <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/20">
      <div className="min-w-0 flex-1">
        <h1 className="text-lg font-bold text-white truncate">{selectedModel.name}</h1>
        <p className="text-white/40 text-sm">@{selectedModel.username} · {imageCount} photos</p>
      </div>
      <button
        onClick={onUploadClick}
        className="flex-shrink-0 ml-4 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:shadow-lg hover:shadow-pink-500/25 active:scale-95"
      >
        <FaUpload size={12} />
        <span className="hidden sm:inline">Upload</span>
      </button>
    </div>
  );
}

