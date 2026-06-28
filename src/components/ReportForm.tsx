import React, { useState, useRef } from "react";
import { MapPin, FileText, Image as ImageIcon, Upload, X, Send, Loader2 } from "lucide-react";

interface ReportFormProps {
  onSubmit: (data: { location: string; description: string; imageUrl?: string }) => void;
  isLoading: boolean;
}

export default function ReportForm({ onSubmit, isLoading }: ReportFormProps) {
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImage(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    setImage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim() || !description.trim()) return;
    
    onSubmit({
      location,
      description,
      imageUrl: image || undefined,
    });
  };

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm relative" id="report-form-container">
      <div className="absolute top-0 right-0 bg-[#4a3b32] text-stone-100 text-[9px] font-mono uppercase px-3 py-1 rounded-bl-xl rounded-tr-xl">
        INPUT TERMINAL
      </div>

      <h2 className="text-base font-serif font-bold text-stone-900 mb-4 flex items-center gap-2">
        <Send className="w-4 h-4 text-[#4a3b32]" />
        Log Active Community Hazard
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Location Input */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-sans font-bold text-stone-600 uppercase tracking-wider">
            Location Coordinate / Street Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
              <MapPin className="w-4 h-4" />
            </div>
            <input
              type="text"
              required
              disabled={isLoading}
              className="w-full border border-stone-200 rounded-xl bg-stone-50/50 pl-10 pr-4 py-2 text-sm text-stone-900 font-sans font-medium placeholder-stone-400 focus:outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-400 focus:bg-white transition-all"
              placeholder="e.g., Intersection of 4th Ave & Elm St"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              id="input-location"
            />
          </div>
        </div>

        {/* Issue Description */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-sans font-bold text-stone-600 uppercase tracking-wider">
            Hazard Description & Evidence Details
          </label>
          <div className="relative">
            <div className="absolute top-3 left-0 pl-3 pointer-events-none text-stone-400">
              <FileText className="w-4 h-4" />
            </div>
            <textarea
              required
              rows={3}
              disabled={isLoading}
              className="w-full border border-stone-200 rounded-xl bg-stone-50/50 pl-10 pr-4 py-2 text-sm text-stone-900 font-sans font-medium placeholder-stone-400 focus:outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-400 focus:bg-white transition-all resize-none"
              placeholder="Provide clean, factual details on the hazard. Include potential risk vectors..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              id="input-description"
            />
          </div>
        </div>

        {/* Clean Drag-and-Drop Image Area */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-sans font-bold text-stone-600 uppercase tracking-wider">
            Photographic Verification
          </label>
          
          {image ? (
            <div className="border border-stone-200 rounded-xl bg-stone-50/50 p-3 relative flex items-center gap-4">
              <img 
                src={image} 
                alt="Uploaded proof preview" 
                className="w-16 h-16 object-cover rounded-lg border border-stone-200 bg-white"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-mono font-bold text-stone-900 truncate">IMAGE_ATTACHED.PNG</p>
                <p className="text-[10px] text-stone-500 font-sans">Ready for official AI analysis</p>
              </div>
              <button
                type="button"
                onClick={removeImage}
                disabled={isLoading}
                className="p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-100 transition-colors"
                id="btn-remove-image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              className={`border border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                dragActive 
                  ? "border-amber-600 bg-amber-50/30 text-amber-800" 
                  : "border-stone-300 hover:border-stone-400 bg-stone-50/50 hover:bg-stone-50 text-stone-500"
              }`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={triggerFileInput}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isLoading}
              />
              <div className="flex flex-col items-center gap-1.5">
                <div className="p-2 rounded-xl bg-white border border-stone-200 text-stone-700 shadow-sm inline-block">
                  <Upload className="w-4 h-4 text-[#4a3b32]" />
                </div>
                <p className="text-xs font-sans font-bold text-stone-800">
                  Drop image here or click to upload
                </p>
                <p className="text-[10px] text-stone-400 font-mono">
                  MIME: JPEG, PNG, WEBP (MAX 10MB)
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !location.trim() || !description.trim()}
          className={`w-full rounded-xl py-3 font-sans font-bold text-xs uppercase tracking-widest transition-all ${
            isLoading || !location.trim() || !description.trim()
              ? "bg-stone-100 text-stone-400 cursor-not-allowed border-stone-200"
              : "bg-[#4a3b32] text-stone-100 hover:bg-[#5c493e] shadow-sm cursor-pointer"
          }`}
          id="btn-submit-report"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Running Neural Parser...
            </span>
          ) : (
            "Analyze & Predict Severity"
          )}
        </button>
      </form>
    </div>
  );
}
