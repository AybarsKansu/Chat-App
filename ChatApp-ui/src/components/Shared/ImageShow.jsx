import React, { useEffect } from 'react';
import '../../styles/ImageShow.css';

export default function ImageShow({ src, onClose }) {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  return (
    <div className="image-overlay" onClick={onClose}>
      <img
        src={src}
        alt=""
        className="image-expanded"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
