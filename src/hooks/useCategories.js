import { useState, useEffect } from 'react';
import { API_BASE } from '../config';

export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch(`${API_BASE}/categories`);
        const data = await response.json();
        const categoryList = data.map(c => c.name || c);
        setCategories(categoryList);
      } catch (error) {
        console.error('加载分类配置失败:', error);
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, []);

  return { categories, loading };
};

