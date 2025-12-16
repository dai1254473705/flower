import { API_BASE, IMAGE_TYPES } from '../config';

export const useImageOperations = (images, setImages, selectedCategory) => {
  // 单条更新/插入
  const upsertImage = async (item, prevCategory = null) => {
    const cat = item.category || selectedCategory || '未分类';
    const catName = cat === '__uncategorized__' ? '未分类' : cat;
    try {
      const res = await fetch(`${API_BASE}/data/${encodeURIComponent(catName)}/item`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      if (!res.ok) throw new Error('Upsert failed');
      const data = await res.json();
      // 如果分类变了，从当前列表移除
      if (prevCategory && prevCategory !== cat) {
        setImages(prev => prev.filter(i => i.id !== item.id));
      } else {
        setImages(prev => {
          const idx = prev.findIndex(i => i.id === item.id);
          if (idx >= 0) {
            const updated = [...prev];
            updated[idx] = item;
            return updated;
          }
          return [...prev, item];
        });
      }
      return data;
    } catch (error) {
      console.error('Failed to upsert:', error);
      throw error;
    }
  };

  // 删除
  const deleteImage = async (id, category) => {
    if (!window.confirm('确定要删除吗？')) return;
    const catName = category === '__uncategorized__' ? '未分类' : category;
    try {
      const res = await fetch(`${API_BASE}/data/${encodeURIComponent(catName)}/item/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Delete failed');
      setImages(prev => prev.filter(i => i.id !== id));
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('删除失败');
    }
  };

  // 上传图片
  const uploadImage = async (file, name, category, type = IMAGE_TYPES.ICON) => {
    if (!file) throw new Error('No file provided');
    const formData = new FormData();
    formData.append('file', file);
    const cat = category === '__uncategorized__' ? '未分类' : category;
    const res = await fetch(
      `${API_BASE}/upload?name=${encodeURIComponent(name)}&type=${type}&category=${encodeURIComponent(cat)}`,
      {
        method: 'POST',
        body: formData
      }
    );
    if (!res.ok) throw new Error('Upload failed');
    return await res.json();
  };

  // 上传微信
  const uploadToWeChat = async (id, category, srcIndex = null) => {
    const cat = category || '未分类';
    const body = { id, category: cat };
    if (srcIndex !== null) {
      body.srcIndex = srcIndex;
    }
    const res = await fetch(`${API_BASE}/wechat/upload-icon`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || '上传失败');
    }
    return data;
  };

  return {
    upsertImage,
    deleteImage,
    uploadImage,
    uploadToWeChat
  };
};

