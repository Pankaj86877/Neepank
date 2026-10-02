import React, { useState } from 'react';

type UploadOverlayProps = {
  show: boolean;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDropFile?: (file: File) => void;
  onClose?: () => void;
};

export const UploadOverlay: React.FC<UploadOverlayProps> = ({ show, onUpload, onDropFile, onClose }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  if (!show) return null;

  return (
    <label
      className={`shape-upload-overlay ${isDragOver ? 'drag-over' : ''}`}
      onClick={(e) => e.stopPropagation()}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          if (onDropFile) {
            onDropFile(e.dataTransfer.files[0]);
            if (onClose) onClose();
          }
        }
      }}
    >
      <div className="upload-icon-circle">
        <span className="upload-icon-inner">📤</span>
      </div>
      <div className="upload-text-primary">Click to Upload</div>
      <div className="upload-text-secondary">or drag & drop a file here</div>
      <input
        type="file"
        accept="image/png, image/jpeg, image/jpg, image/webp"
        style={{ display: 'none' }}
        onChange={(e) => {
          onUpload(e);
          if (onClose) onClose();
        }}
      />
    </label>
  );
};
