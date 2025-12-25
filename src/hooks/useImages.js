import { useState, useEffect } from 'react';
import { API_BASE } from '../config';
import { normalizeImageItem } from '../utils/dataUtils';

export const useImages = (selectedCategory, categories = []) => {
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
        if (selectedCategory === 'all') {
          // 如果没有分类数据，暂时不加载（或者加载空）
          // 注意：categories 可能是空数组（初始状态），所以要小心
          if (!categories || categories.length === 0) {
            // 这里不置空 images，因为可能是正在加载 categories
            // 但是如果 categories 真的加载完了是空的呢？
            // useCategories 有 loading 状态，但我们这里没传进来。
            // 假设 categories 会更新。
            setLoading(false);
            return;
          }

          const promises = categories.map((cat) =>
            fetch(`${API_BASE}/data/${encodeURIComponent(cat)}`)
              .then((res) => {
                if (!res.ok) return [];
                return res.json();
              })
              .catch((err) => {
                console.error(`Error loading data for ${cat}:`, err);
                return [];
              })
          );

          // 同时也获取未分类的数据
          const uncategorizedPromise = fetch(`${API_BASE}/data/未分类`)
            .then((res) => (res.ok ? res.json() : []))
            .catch(() => []);

          const allPromises = [...promises, uncategorizedPromise];

          const results = await Promise.all(allPromises);
          // 合并所有结果并扁平化
          const allImages = results.flat().map(normalizeImageItem);
          
          // 可选：按 id 倒序排列（新发布的在前）
          allImages.sort((a, b) => b.id - a.id);

          setImages(allImages);
        } else {
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
        }
      } catch (error) {
        console.error(`Error loading data for ${selectedCategory}:`, error);
        setImages([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedCategory, categories]);

  return { images, setImages, loading };
};
