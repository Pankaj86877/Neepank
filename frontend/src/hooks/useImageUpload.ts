import { useState } from 'react';

export const useImageUpload = (onUploadSuccess: (img: HTMLImageElement, filename: string) => void) => {
  const [error, setError] = useState<string | null>(null);

  const processFile = (file: File) => {
    setError(null);
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert("Unsupported file format. Please upload PNG, JPG, or WebP.");
      setError("Unsupported format");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert("File is too large. Maximum size is 10MB.");
      setError("File too large");
      return;
    }
    const filename = file.name;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        onUploadSuccess(img, filename);
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  return { handleImageUpload, processFile, error };
};
