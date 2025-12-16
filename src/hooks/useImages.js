import { useState, useEffect } from 'react';
import { API_BASE } from '../config';
import { normalizeImageItem } from '../utils/dataUtils';

export const useImages = (selectedCategory) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedCategory) {
      setImages([]);
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        const catName = selectedCategory === '__uncategorized__' ? '未分类' : selectedCategory;
        const response = await fetch(`${API_BASE}/data/${encodeURIComponent(catName)}`);
        if (!response.ok) {
          if (response.status === 404) {
            setImages([]);
            return;
          }
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        const normalizedData = data.map(normalizeImageItem);
        setImages(normalizedData);
      } catch (error) {
        console.error(`Error loading data for ${selectedCategory}:`, error);
        setImages([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedCategory]);

  return { images, setImages, loading };
};

