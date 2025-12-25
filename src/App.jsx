import { useState, useEffect } from 'react';
import './App.css';
import { useDebounce } from './hooks/useDebounce';
import { useCategories } from './hooks/useCategories';
import { useImages } from './hooks/useImages';
import { useImageOperations } from './hooks/useImageOperations';
import { Header } from './components/Header';
import { ImageGrid } from './components/ImageGrid';
import { UploadModal } from './components/UploadModal';
import { EditModal } from './components/EditModal';
import { FILTER_MODES, IMAGE_TYPES } from './config';

function App() {
  // 基础状态
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState(FILTER_MODES.ALL);
  const [toast, setToast] = useState(null); // { message, type }

  // Modal 状态
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadName, setUploadName] = useState('');
  const [uploadCategory, setUploadCategory] = useState('');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState(null);

  // Hooks
  const debouncedSearchTerm = useDebounce(searchTerm);
  const { categories } = useCategories();
  const { images, setImages } = useImages(selectedCategory, categories);
  const { upsertImage, deleteImage, uploadImage, uploadToWeChat } = useImageOperations(
    images,
    setImages,
    selectedCategory
  );

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToast(null), 2200);
  };

  // 初始化选中分类
  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory('all');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories]);

  // 筛选图片
  const filteredImages = images.filter((image) => {
    const matchesSearch = image.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
    if (!matchesSearch) return false;
    const icon = image.srcIcon || { local: '', remote: '' };
    if (filterMode === FILTER_MODES.MISSING_LOCAL) return !icon.local;
    if (filterMode === FILTER_MODES.MISSING_REMOTE) return !icon.remote;
    return true;
  });

  // 上传新图片
  const openUploadModal = () => {
    setUploadName('');
    setUploadFile(null);
    // 如果选中的是 'all'，则默认上传到第一个分类
    const defaultCat = (selectedCategory && selectedCategory !== 'all') ? selectedCategory : categories[0];
    setUploadCategory(defaultCat);
    setIsUploadModalOpen(true);
  };

  const handleUpload = async () => {
    if (!uploadFile || !uploadName) {
      alert('请填写名称并选择文件');
      return;
    }

    try {
      const uploadData = await uploadImage(uploadFile, uploadName, uploadCategory, IMAGE_TYPES.ICON);
      const newItem = {
        id: Date.now(),
        title: uploadName,
        category: uploadCategory === '__uncategorized__' ? '未分类' : uploadCategory,
        articles: [],
        introduction: '',
        morphology: [],
        carePoints: [],
        careInfo: {},
        srcIcon: {
          local: uploadData.path,
          remote: ''
        },
        srcList: []
      };
      await upsertImage(newItem);
      setIsUploadModalOpen(false);
      alert('上传成功');
    } catch (err) {
      console.error(err);
      alert('上传失败');
    }
  };

  // 补本地图片
  const handleAttachLocal = async (file, image) => {
    if (!file) return;
    try {
      const uploadData = await uploadImage(file, image.title, image.category, IMAGE_TYPES.ICON);
      const updatedItem = {
        ...image,
        srcIcon: {
          local: uploadData.path,
          remote: image.srcIcon ? image.srcIcon.remote : ''
        },
        srcList: image.srcList || []
      };
      await upsertImage(updatedItem, image.category);
      alert('本地图片已上传并更新');
    } catch (err) {
      console.error(err);
      alert('上传失败');
    }
  };

  // 上传微信
  const handleUploadWeChat = async (image) => {
    if (!image || !image.id) {
      alert('缺少ID，无法上传微信');
      return;
    }
    try {
      const data = await uploadToWeChat(image.id, image.category);
      const remote = data.remote || image.srcIcon?.remote || '';
      const updatedItem = {
        ...image,
        srcIcon: {
          local: image.srcIcon?.local || '',
          remote
        },
        srcList: image.srcList || []
      };
      setImages((prev) => prev.map((i) => (i.id === image.id ? updatedItem : i)));
      showToast('上传微信成功', 'success');
    } catch (err) {
      console.error(err);
      alert(err.message || '上传微信失败');
    }
  };

  // srcList 上传微信
  const handleUploadWeChatSrcList = async (image, srcIndex) => {
    if (!image || image.id === undefined || image.id === null) {
      alert('缺少ID，无法上传微信');
      return;
    }
    try {
      const data = await uploadToWeChat(image.id, image.category, srcIndex);
      const remote = data.remote || '';
      setEditForm((prev) => {
        const next = { ...prev, srcList: Array.isArray(prev.srcList) ? [...prev.srcList] : [] };
        if (next.srcList[srcIndex]) {
          next.srcList[srcIndex] = { ...next.srcList[srcIndex], remote };
        }
        return next;
      });
      const cat = image.category || '未分类';
      const isCurrentCategory = (selectedCategory === '__uncategorized__' ? '未分类' : selectedCategory);
      
      if (selectedCategory === 'all' || cat === isCurrentCategory) {
        setImages((prev) =>
          prev.map((img) => {
            if (img.id !== image.id) return img;
            const nextList = Array.isArray(img.srcList) ? [...img.srcList] : [];
            if (nextList[srcIndex]) nextList[srcIndex] = { ...nextList[srcIndex], remote };
            return { ...img, srcList: nextList };
          })
        );
      }
      showToast('上传微信成功', 'success');
    } catch (err) {
      console.error(err);
      alert(err.message || '上传微信失败');
    }
  };

  // 编辑面板
  const openEditPanel = (item) => {
    setEditForm({
      ...item,
      category: item.category || '未分类',
      introduction: item.introduction || '',
      morphology: item.morphology || [],
      carePoints: item.carePoints || [],
      careInfo: item.careInfo || {
        wateringFrequency: '',
        lightRequirement: '',
        suitableTemperature: '',
        soilRequirement: ''
      },
      articles: item.articles || [],
      srcList: item.srcList || [],
      srcIcon: item.srcIcon || { local: '', remote: '' }
    });
    setIsEditOpen(true);
  };

  const handleEditChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditSave = async (updated) => {
    const prevCategory = images.find((i) => i.id === updated.id)?.category;
    await upsertImage(updated, prevCategory);
    setIsEditOpen(false);
  };

  const handleDetailUpload = async (files) => {
    if (!editForm) return;
    const cat = editForm.category || '未分类';
    const uploads = Array.from(files || []);
    const uploaded = [];
    for (const f of uploads) {
      try {
        const data = await uploadImage(f, editForm.title || f.name, cat, IMAGE_TYPES.DETAIL);
        uploaded.push({ local: data.path, remote: '' });
      } catch (error) {
        console.error(error);
        alert('上传失败');
        return;
      }
    }
    const newSrcList = [...(editForm.srcList || []), ...uploaded];
    const updated = { ...editForm, srcList: newSrcList };
    setEditForm(updated);
    const prevCategory = images.find((i) => i.id === updated.id)?.category;
    await upsertImage(updated, prevCategory);
  };

  return (
    <div className="app">
      {toast && (
        <div className={`toast toast-${toast.type}`} role="status" aria-live="polite">
          {toast.message}
        </div>
      )}
      <Header
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterMode={filterMode}
        onFilterChange={setFilterMode}
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        onAddClick={openUploadModal}
      />

      <ImageGrid
        images={filteredImages}
        onDelete={deleteImage}
        onEdit={openEditPanel}
        onAttachLocal={handleAttachLocal}
        onUploadWeChat={handleUploadWeChat}
      />

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        uploadName={uploadName}
        onNameChange={setUploadName}
        categories={categories}
        uploadCategory={uploadCategory}
        onCategoryChange={setUploadCategory}
        onFileChange={setUploadFile}
        onSubmit={handleUpload}
      />

      <EditModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        editForm={editForm}
        onFormChange={handleEditChange}
        categories={categories}
        onSave={handleEditSave}
        onDetailUpload={handleDetailUpload}
        onUploadWeChatSrcList={handleUploadWeChatSrcList}
      />
    </div>
  );
}

export default App;
