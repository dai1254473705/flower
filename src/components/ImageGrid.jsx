import React from 'react';
import { ImageCard } from './ImageCard';

export const ImageGrid = ({
  images,
  onDelete,
  onEdit,
  onAttachLocal,
  onUploadWeChat
}) => {
  if (images.length === 0) {
    return <div className="no-data">暂无数据</div>;
  }

  return (
    <main className="image-grid">
      {images.map((image, index) => (
        <ImageCard
          key={image.id || index}
          image={image}
          onDelete={onDelete}
          onEdit={onEdit}
          onAttachLocal={onAttachLocal}
          onUploadWeChat={onUploadWeChat}
        />
      ))}
    </main>
  );
};

