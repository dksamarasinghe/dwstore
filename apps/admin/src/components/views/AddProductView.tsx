import React, { useState, useEffect, useMemo } from 'react';
import { getStorefrontUrl } from '../../config';
import {
  Package,
  ArrowLeft,
  Check,
  X,
  RefreshCw,
  Truck,
  ShieldCheck,
  Info,
  DollarSign,
  Boxes,
  FileText,
  ListFilter,
  Tag,
  Zap,
  Eye,
  Code,
  Search,
  ChevronDown,
  Plus,
  Layers,
  Tags,
  Image as ImageIcon,
  CornerDownRight,
  Upload,
  Trash2,
  Star,
  CheckCircle2
} from 'lucide-react';
import { AttributeItem, BrandItem, CategoryItem, ProductItem, ProductVariationItem, ShippingDetails, TabType } from '../../types';

interface AddProductViewProps {
  initialProduct?: ProductItem | null;
  onAddProduct: (newProduct: ProductItem) => void;
  onUpdateProduct?: (updatedProduct: ProductItem) => void;
  categories?: CategoryItem[];
  onAddCategory?: (cat: CategoryItem) => void;
  brands?: BrandItem[];
  onAddBrand?: (brand: BrandItem) => void;
  setActiveTab: (tab: TabType) => void;
  showNotification: (msg: string) => void;
}

interface WorkingAttribute {
  id: string;
  name: string;
  currentInput: string;
  values: string[];
}

export const AddProductView: React.FC<AddProductViewProps> = ({
  initialProduct,
  onAddProduct,
  onUpdateProduct,
  categories = [],
  onAddCategory,
  brands = [],
  onAddBrand,
  setActiveTab,
  showNotification,
}) => {
  const isEditing = Boolean(initialProduct);

  // 1. Product Type: 'simple' | 'variable'
  const [productType, setProductType] = useState<'simple' | 'variable'>(
    initialProduct?.productType || 'simple'
  );

  // 2. Basic Information (Completely blank if adding new!)
  const [productName, setProductName] = useState(initialProduct?.name || '');
  const [sku, setSku] = useState(initialProduct?.sku || '');
  const [brand, setBrand] = useState(initialProduct?.brand || '');
  const [selectedCategory, setSelectedCategory] = useState(
    initialProduct?.category || (categories[0]?.name || '')
  );

  // Category dropdown & search state
  const [catSearch, setCatSearch] = useState('');
  const [catDropdownOpen, setCatDropdownOpen] = useState(false);

  // Category quick creation state
  const [newCatModalOpen, setNewCatModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');
  const [newCatParentId, setNewCatParentId] = useState('');

  // Brand dropdown & search state
  const [brandSearch, setBrandSearch] = useState('');
  const [brandDropdownOpen, setBrandDropdownOpen] = useState(false);

  // Brand quick creation state
  const [newBrandModalOpen, setNewBrandModalOpen] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [newBrandSlug, setNewBrandSlug] = useState('');
  const [newBrandLogo, setNewBrandLogo] = useState('');
  const [newBrandTag, setNewBrandTag] = useState('');
  const [isUploadingBrandLogo, setIsUploadingBrandLogo] = useState(false);

  // 3. Product Media & Gallery States (VPS Self-hosted /media/products/)
  const [mainImage, setMainImage] = useState<string>(
    initialProduct?.image || initialProduct?.displayImage || ''
  );
  const [galleryImages, setGalleryImages] = useState<string[]>(
    initialProduct?.galleryImages && initialProduct.galleryImages.length > 0
      ? initialProduct.galleryImages
      : initialProduct?.imageUrls && initialProduct.imageUrls.length > 0
      ? initialProduct.imageUrls
      : []
  );
  const [manualImageUrl, setManualImageUrl] = useState('');
  const [isUploadingMain, setIsUploadingMain] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [variationImageModal, setVariationImageModal] = useState<{
    open: boolean;
    variationId: string;
    variationTitle?: string;
  } | null>(null);

  // VPS Media Upload Helper
  const uploadMediaFile = async (file: File, folder: string = 'products'): Promise<string | null> => {
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', folder);
      const res = await fetch(`${getStorefrontUrl()}/api/upload`, {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();
      if (data.success && data.url) {
        return data.url;
      } else {
        showNotification(data.error || 'Upload failed');
        return null;
      }
    } catch (err: any) {
      showNotification('Failed to upload image to VPS media: ' + err.message);
      return null;
    }
  };

  const handleMainImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingMain(true);
    const url = await uploadMediaFile(file, 'products');
    if (url) {
      setMainImage(url);
      if (!galleryImages.includes(url)) {
        setGalleryImages((prev) => [url, ...prev]);
      }
      showNotification('Main product image uploaded to VPS media successfully!');
    }
    setIsUploadingMain(false);
    e.target.value = '';
  };

  const handleGalleryImagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploadingGallery(true);
    const uploadedUrls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const url = await uploadMediaFile(files[i], 'products');
      if (url) uploadedUrls.push(url);
    }
    if (uploadedUrls.length > 0) {
      setGalleryImages((prev) => [...prev, ...uploadedUrls]);
      if (!mainImage && uploadedUrls[0]) {
        setMainImage(uploadedUrls[0]);
      }
      showNotification(`${uploadedUrls.length} gallery image(s) uploaded to VPS media!`);
    }
    setIsUploadingGallery(false);
    e.target.value = '';
  };

  const handleAddManualImage = () => {
    const url = manualImageUrl.trim();
    if (!url) return;
    if (!galleryImages.includes(url)) {
      setGalleryImages((prev) => [...prev, url]);
    }
    if (!mainImage) setMainImage(url);
    setManualImageUrl('');
    showNotification('Image added to gallery.');
  };

  const handleRemoveGalleryImage = (urlToRemove: string) => {
    setGalleryImages((prev) => prev.filter((img) => img !== urlToRemove));
    if (mainImage === urlToRemove) {
      const remaining = galleryImages.filter((img) => img !== urlToRemove);
      setMainImage(remaining[0] || '');
    }
    showNotification('Image removed from gallery.');
  };

  const handleSetMainImage = (url: string) => {
    setMainImage(url);
    showNotification('Set as main featured image.');
  };

  // Hierarchical category tree
  const treeCategories = useMemo(() => {
    const byIdOrSlug = new Map<string, CategoryItem>();
    categories.forEach((c) => {
      byIdOrSlug.set(c.id, c);
      byIdOrSlug.set(c.slug, c);
    });

    const childrenMap = new Map<string, CategoryItem[]>();
    categories.forEach((c) => {
      const p = c.parentId && c.parentId.trim() !== '' ? c.parentId : 'ROOT';
      if (!childrenMap.has(p)) {
        childrenMap.set(p, []);
      }
      childrenMap.get(p)!.push(c);
    });

    const result: { item: CategoryItem; depth: number; path: string }[] = [];
    const visited = new Set<string>();

    const traverse = (parentKey: string, depth: number, currentPath: string) => {
      const direct = childrenMap.get(parentKey) || [];
      const parentObj = byIdOrSlug.get(parentKey);
      const bySlug = parentObj && parentObj.slug !== parentKey ? childrenMap.get(parentObj.slug) || [] : [];
      const allChildren = [...direct, ...bySlug.filter((c) => !direct.some((d) => d.id === c.id))];
      allChildren.sort((a, b) => a.name.localeCompare(b.name));

      for (const child of allChildren) {
        if (visited.has(child.id)) continue;
        visited.add(child.id);
        const newPath = currentPath ? `${currentPath} > ${child.name}` : child.name;
        result.push({ item: child, depth, path: newPath });
        traverse(child.id, depth + 1, newPath);
      }
    };

    traverse('ROOT', 0, '');

    categories.forEach((c) => {
      if (!visited.has(c.id)) {
        visited.add(c.id);
        result.push({ item: c, depth: c.parentId ? 1 : 0, path: c.name });
      }
    });

    return result;
  }, [categories]);

  const filteredCategories = useMemo(() => {
    if (!catSearch.trim()) return treeCategories;
    const s = catSearch.toLowerCase();
    return treeCategories.filter(
      (node) => node.item.name.toLowerCase().includes(s) || node.path.toLowerCase().includes(s)
    );
  }, [treeCategories, catSearch]);

  const filteredBrands = useMemo(() => {
    if (!brandSearch.trim()) return brands;
    const s = brandSearch.toLowerCase();
    return brands.filter(
      (b) => b.name.toLowerCase().includes(s) || b.slug.toLowerCase().includes(s)
    );
  }, [brands, brandSearch]);

  // 3. Pricing (Completely blank if adding new!)
  const [regularPrice, setRegularPrice] = useState(
    initialProduct?.regularPrice ? String(initialProduct.regularPrice) : ''
  );
  const [salePrice, setSalePrice] = useState(
    initialProduct?.salePrice ? String(initialProduct.salePrice) : ''
  );
  const [costPrice, setCostPrice] = useState(
    initialProduct?.costPrice ? String(initialProduct.costPrice) : ''
  );

  // 4. Inventory (Completely blank if adding new!)
  const [openingStock, setOpeningStock] = useState(
    initialProduct?.stock !== undefined ? String(initialProduct.stock) : ''
  );
  const [stockAlertLevel, setStockAlertLevel] = useState(
    initialProduct?.stockAlertLevel !== undefined ? String(initialProduct.stockAlertLevel) : ''
  );
  const [stockStatus, setStockStatus] = useState<'Active' | 'Low stock' | 'Out of stock'>(
    initialProduct?.status && initialProduct.status !== 'Draft' ? initialProduct.status : 'Active'
  );

  // 5. Descriptions (Completely blank if adding new!)
  const [shortDesc, setShortDesc] = useState(initialProduct?.shortDesc || '');
  const [shortDescMode, setShortDescMode] = useState<'visual' | 'html'>('visual');

  const [fullDesc, setFullDesc] = useState(initialProduct?.description || '');
  const [fullDescMode, setFullDescMode] = useState<'visual' | 'html'>('visual');

  // 6. Shipping & Dimensions (Completely blank if adding new!)
  const [weightKg, setWeightKg] = useState(
    initialProduct?.shipping?.weight ? String(initialProduct.shipping.weight) : ''
  );
  const [dimLength, setDimLength] = useState(
    initialProduct?.shipping?.length ? String(initialProduct.shipping.length) : ''
  );
  const [dimWidth, setDimWidth] = useState(
    initialProduct?.shipping?.width ? String(initialProduct.shipping.width) : ''
  );
  const [dimHeight, setDimHeight] = useState(
    initialProduct?.shipping?.height ? String(initialProduct.shipping.height) : ''
  );
  const [shippingClass, setShippingClass] = useState(
    initialProduct?.shipping?.shippingClass || 'Standard Islandwide Delivery (Rs. 450)'
  );
  const [productShippingFee, setProductShippingFee] = useState(
    initialProduct?.shipping?.shippingFee !== undefined
      ? String(initialProduct.shipping.shippingFee)
      : (initialProduct as any)?.shippingFee !== undefined
      ? String((initialProduct as any).shippingFee)
      : ''
  );

  // Custom Shipping Classes state
  const [shippingClasses, setShippingClasses] = useState<{ id: string; name: string; rate?: number }[]>(() => {
    try {
      const saved = localStorage.getItem('dwstore_shipping_classes');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      { id: 'sc-1', name: 'No shipping class (Standard Islandwide Rs. 350)', rate: 350 },
      { id: 'sc-2', name: 'Free Delivery Islandwide (Promo)', rate: 0 },
      { id: 'sc-3', name: 'Heavy / Bulky Gadgets (Rs. 600)', rate: 600 },
      { id: 'sc-4', name: 'Express Colombo Same-Day Delivery (Rs. 500)', rate: 500 }
    ];
  });
  const [newShippingClassModalOpen, setNewShippingClassModalOpen] = useState(false);
  const [newShippingClassName, setNewShippingClassName] = useState('');
  const [newShippingClassRate, setNewShippingClassRate] = useState('');

  // 7. Warranty Period (Completely blank if adding new!)
  const [warrantyPeriod, setWarrantyPeriod] = useState(initialProduct?.warrantyPeriod || '');

  // 8. Variable Product Attributes & Variations
  const [newAttrName, setNewAttrName] = useState('');
  const [workingAttributes, setWorkingAttributes] = useState<WorkingAttribute[]>(() => {
    if (initialProduct?.attributes && initialProduct.attributes.length > 0) {
      return initialProduct.attributes
        .filter((a) => a.name !== 'Warranty')
        .map((a, idx) => ({
          id: `attr-${idx}`,
          name: a.name.toLowerCase(),
          currentInput: '',
          values: a.values ? a.values.split(',').map((v) => v.trim()).filter(Boolean) : []
        }));
    }
    return [];
  });

  const [variations, setVariations] = useState<ProductVariationItem[]>(
    initialProduct?.variations || []
  );

  // When initialProduct changes, update state
  useEffect(() => {
    if (initialProduct) {
      setProductType(initialProduct.productType || 'simple');
      setProductName(initialProduct.name || '');
      setSku(initialProduct.sku || '');
      setBrand(initialProduct.brand || '');
      setSelectedCategory(initialProduct.category || categories[0]?.name || '');
      setRegularPrice(initialProduct.regularPrice ? String(initialProduct.regularPrice) : '');
      setSalePrice(initialProduct.salePrice ? String(initialProduct.salePrice) : '');
      setCostPrice(initialProduct.costPrice ? String(initialProduct.costPrice) : '');
      setOpeningStock(initialProduct.stock !== undefined ? String(initialProduct.stock) : '');
      setStockAlertLevel(initialProduct.stockAlertLevel !== undefined ? String(initialProduct.stockAlertLevel) : '');
      setStockStatus(initialProduct.status && initialProduct.status !== 'Draft' ? initialProduct.status : 'Active');
      setShortDesc(initialProduct.shortDesc || '');
      setFullDesc(initialProduct.description || '');
      setWeightKg(initialProduct.shipping?.weight ? String(initialProduct.shipping.weight) : '');
      setDimLength(initialProduct.shipping?.length ? String(initialProduct.shipping.length) : '');
      setDimWidth(initialProduct.shipping?.width ? String(initialProduct.shipping.width) : '');
      setDimHeight(initialProduct.shipping?.height ? String(initialProduct.shipping.height) : '');
      setShippingClass(initialProduct.shipping?.shippingClass || 'Standard Islandwide Delivery (Rs. 350)');
      setWarrantyPeriod(initialProduct.warrantyPeriod || '');
      if (initialProduct.attributes && initialProduct.attributes.length > 0) {
        setWorkingAttributes(
          initialProduct.attributes
            .filter((a) => a.name !== 'Warranty')
            .map((a, idx) => ({
              id: `attr-${idx}`,
              name: a.name.toLowerCase(),
              currentInput: '',
              values: a.values ? a.values.split(',').map((v) => v.trim()).filter(Boolean) : []
            }))
        );
      }
      setVariations(initialProduct.variations || []);
    }
  }, [initialProduct]);

  // Calculate live Profit Preview
  const profitData = useMemo(() => {
    const reg = parseFloat(regularPrice) || 0;
    const sale = parseFloat(salePrice) || 0;
    let selling = sale > 0 ? sale : reg;
    let cost = parseFloat(costPrice) || 0;

    if (productType === 'variable' && variations.length > 0) {
      const totalSelling = variations.reduce(
        (sum, v) => sum + (v.salePrice > 0 ? v.salePrice : v.regularPrice || 0),
        0
      );
      const totalCost = variations.reduce((sum, v) => sum + (v.costPrice || 0), 0);
      selling = totalSelling / variations.length;
      cost = totalCost / variations.length;
    }

    const grossProfit = selling - cost;
    const margin = selling > 0 ? (grossProfit / selling) * 100 : 0;

    return {
      selling,
      cost,
      grossProfit,
      margin: Math.max(0, margin)
    };
  }, [regularPrice, salePrice, costPrice, productType, variations]);

  // Clean description string
  const cleanDescriptionInput = (text: string) => {
    return text
      .replace(/\\r\\n/g, '\n')
      .replace(/\\n/g, '\n')
      .replace(/\/n/g, '\n')
      .replace(/\\r/g, '\n');
  };

  // Add attribute section
  const handleAddAttribute = () => {
    if (!newAttrName.trim()) return;
    const exists = workingAttributes.some(
      (a) => a.name.toLowerCase() === newAttrName.trim().toLowerCase()
    );
    if (exists) {
      showNotification('Attribute name already exists.');
      return;
    }
    setWorkingAttributes([
      ...workingAttributes,
      {
        id: `attr-${Date.now()}`,
        name: newAttrName.trim().toLowerCase(),
        currentInput: '',
        values: []
      }
    ]);
    setNewAttrName('');
  };

  const handleRemoveAttribute = (attrId: string) => {
    setWorkingAttributes(workingAttributes.filter((a) => a.id !== attrId));
  };

  const handleAddAttributeValue = (attrId: string) => {
    setWorkingAttributes(
      workingAttributes.map((attr) => {
        if (attr.id === attrId && attr.currentInput.trim()) {
          const val = attr.currentInput.trim();
          if (!attr.values.includes(val)) {
            return {
              ...attr,
              values: [...attr.values, val],
              currentInput: ''
            };
          }
          return { ...attr, currentInput: '' };
        }
        return attr;
      })
    );
  };

  const handleRemoveAttributeValue = (attrId: string, valToRemove: string) => {
    setWorkingAttributes(
      workingAttributes.map((attr) => {
        if (attr.id === attrId) {
          return {
            ...attr,
            values: attr.values.filter((v) => v !== valToRemove)
          };
        }
        return attr;
      })
    );
  };

  // Generate Cartesian Product of all Attribute values
  const handleGenerateVariations = () => {
    const validAttrs = workingAttributes.filter(
      (a) => a.name.trim() && a.values.length > 0
    );

    if (validAttrs.length === 0) {
      showNotification('Please add at least one attribute with values first.');
      return;
    }

    let combinations: Record<string, string>[] = [{}];

    for (const attr of validAttrs) {
      const nextCombos: Record<string, string>[] = [];
      for (const curr of combinations) {
        for (const val of attr.values) {
          nextCombos.push({ ...curr, [attr.name]: val });
        }
      }
      combinations = nextCombos;
    }

    const defaultReg = parseFloat(regularPrice) || 0;
    const defaultSale = parseFloat(salePrice) || 0;
    const defaultCost = parseFloat(costPrice) || 0;
    const defaultStock = parseInt(openingStock, 10) || 0;
    const baseSkuClean = sku.trim().toUpperCase() || 'DWS';

    const newVars: ProductVariationItem[] = combinations.map((comb, idx) => {
      const slug = Object.values(comb)
        .map((v) => v.slice(0, 3).toUpperCase())
        .join('-');
      return {
        id: `var-${Date.now()}-${idx}`,
        attributes: comb,
        sku: `${baseSkuClean}-${slug}`,
        regularPrice: defaultReg,
        salePrice: defaultSale,
        costPrice: defaultCost,
        stock: defaultStock
      };
    });

    setVariations(newVars);
    showNotification(`Generated ${newVars.length} product variations!`);
  };

  const handleRemoveVariation = (id: string) => {
    setVariations(variations.filter((v) => v.id !== id));
  };

  const handleUpdateVariation = (id: string, field: keyof ProductVariationItem, value: any) => {
    setVariations(
      variations.map((v) => (v.id === id ? { ...v, [field]: value } : v))
    );
  };

  const handleBulkSetVariationsRegularPrice = () => {
    const p = parseFloat(regularPrice) || 0;
    if (p <= 0) return;
    setVariations(variations.map((v) => ({ ...v, regularPrice: p })));
    showNotification(`Applied Regular Price Rs. ${p.toLocaleString()} to all variations.`);
  };

  const handleBulkSetVariationsSalePrice = () => {
    const p = parseFloat(salePrice) || 0;
    setVariations(variations.map((v) => ({ ...v, salePrice: p })));
    showNotification(`Applied Sale Price Rs. ${p.toLocaleString()} to all variations.`);
  };

  const handleBulkSetVariationsStock = () => {
    const s = parseInt(openingStock, 10) || 0;
    setVariations(variations.map((v) => ({ ...v, stock: s })));
    showNotification(`Set stock to ${s} units for all variations.`);
  };

  // Custom Shipping Class creation
  const handleCreateShippingClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShippingClassName.trim()) return;
    const rateVal = parseFloat(newShippingClassRate) || 0;
    const fullName = `${newShippingClassName.trim()}${rateVal > 0 ? ` (Rs. ${rateVal})` : ''}`;
    const newClass = {
      id: `sc-${Date.now()}`,
      name: fullName,
      rate: rateVal
    };
    const updated = [...shippingClasses, newClass];
    setShippingClasses(updated);
    try {
      localStorage.setItem('dwstore_shipping_classes', JSON.stringify(updated));
    } catch (err) {}
    setShippingClass(newClass.name);
    setNewShippingClassName('');
    setNewShippingClassRate('');
    setNewShippingClassModalOpen(false);
    showNotification(`Shipping Class "${newShippingClassName.trim()}" added!`);
  };

  // Category quick creation
  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const slug = newCatSlug.trim() || newCatName.trim().toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
    const newCat: CategoryItem = {
      id: slug,
      name: newCatName.trim(),
      slug,
      parentId: newCatParentId.trim() ? newCatParentId.trim() : null,
      productCount: 0,
      icon: 'layers',
      status: 'Active',
      featured: !newCatParentId,
      description: '',
    };
    if (onAddCategory) {
      onAddCategory(newCat);
    }
    setSelectedCategory(newCat.name);
    setNewCatName('');
    setNewCatSlug('');
    setNewCatParentId('');
    setNewCatModalOpen(false);
    setCatDropdownOpen(false);
    showNotification(`Category "${newCat.name}" added and selected!`);
  };

  // Brand quick creation
  const handleCreateBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandName.trim()) return;
    const slug = newBrandSlug.trim() || newBrandName.trim().toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
    const newBrand: BrandItem = {
      id: slug,
      name: newBrandName.trim(),
      slug,
      logo: newBrandLogo.trim(),
      description: newBrandTag.trim(),
      productCount: 0,
      featured: true,
      status: 'Active',
    };
    if (onAddBrand) {
      onAddBrand(newBrand);
    }
    setBrand(newBrand.name);
    setNewBrandName('');
    setNewBrandSlug('');
    setNewBrandLogo('');
    setNewBrandTag('');
    setNewBrandModalOpen(false);
    setBrandDropdownOpen(false);
    showNotification(`Brand "${newBrand.name}" added and selected!`);
  };

  // Submit and Save or Update Product
  const handleSaveProduct = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!productName.trim()) {
      showNotification('Please enter the Product Name.');
      return;
    }

    const regP = parseFloat(regularPrice) || 0;
    if (productType === 'simple' && regP <= 0) {
      showNotification('Regular Price is required. Please enter standard selling price.');
      return;
    }

    if (productType === 'variable') {
      if (variations.length === 0) {
        showNotification('Please generate at least one variation.');
        return;
      }
      const missingReg = variations.some((v) => !v.regularPrice || v.regularPrice <= 0);
      if (missingReg) {
        showNotification('Please enter Regular Price for all variations.');
        return;
      }
    }

    // SKU is optional!
    const finalSku = sku.trim()
      ? sku.trim().toUpperCase()
      : initialProduct?.sku || `DWS-${Date.now().toString().slice(-6)}`;

    // If sale price is entered (> 0), customer gets discount; otherwise customer pays regular price
    const enteredSaleP = parseFloat(salePrice) || 0;
    const saleP = enteredSaleP > 0 ? enteredSaleP : regP;
    const costP = parseFloat(costPrice) || 0;
    const stockQty =
      productType === 'variable' && variations.length > 0
        ? variations.reduce((sum, v) => sum + (v.stock || 0), 0)
        : parseInt(openingStock, 10) || 0;

    const stockAlert = parseInt(stockAlertLevel, 10) || 10;

    const shippingInfo: ShippingDetails = {
      weight: parseFloat(weightKg) || 0,
      length: parseFloat(dimLength) || 0,
      width: parseFloat(dimWidth) || 0,
      height: parseFloat(dimHeight) || 0,
      shippingClass,
      shippingFee: productShippingFee !== '' ? parseFloat(productShippingFee) || 0 : undefined,
    };

    // Formatted attributes list
    const finalAttributes: AttributeItem[] = workingAttributes
      .filter((a) => a.name.trim() && a.values.length > 0)
      .map((a) => ({
        name: a.name.charAt(0).toUpperCase() + a.name.slice(1),
        values: a.values.join(', ')
      }));

    if (warrantyPeriod.trim()) {
      finalAttributes.push({
        name: 'Warranty',
        values: warrantyPeriod.trim()
      });
    }

    const primaryImg = mainImage || galleryImages[0] || initialProduct?.image || '/dwstore_logo.png';
    const allImages = Array.from(new Set([primaryImg, ...galleryImages].filter(Boolean)));

    const formattedVariations = productType === 'variable'
      ? variations.map((v) => ({
          ...v,
          image: v.image || primaryImg,
          displayImage: v.displayImage || v.image || primaryImg,
        }))
      : undefined;

    const productPayload: ProductItem = {
      id: initialProduct?.id || `prod-${Date.now()}`,
      name: productName.trim(),
      sku: finalSku,
      brand: brand.trim() || 'DWstore',
      category: selectedCategory.trim() || 'SmartWatches',
      productType,
      regularPrice: regP,
      salePrice: saleP,
      costPrice: costP,
      stock: stockQty,
      stockAlertLevel: stockAlert,
      status: stockQty === 0 ? 'Out of stock' : stockQty <= stockAlert ? 'Low stock' : 'Active',
      salesCount: initialProduct?.salesCount || 0,
      rating: initialProduct?.rating || 5.0,
      image: primaryImg,
      displayImage: primaryImg,
      galleryImages: allImages,
      imageUrls: allImages,
      shortDesc: cleanDescriptionInput(shortDesc),
      description: cleanDescriptionInput(fullDesc),
      warrantyPeriod: warrantyPeriod.trim(),
      shipping: shippingInfo,
      attributes: finalAttributes,
      variations: formattedVariations
    };

    if (isEditing && onUpdateProduct) {
      onUpdateProduct(productPayload);
      showNotification(`Product "${productPayload.name.slice(0, 24)}..." updated successfully!`);
    } else {
      onAddProduct(productPayload);
      showNotification(`Product "${productPayload.name.slice(0, 24)}..." saved to catalog!`);
    }

    setActiveTab('products');
  };

  return (
    <div className="content">
      {/* Top Header */}
      <div className="page-head d-flex justify-content-between align-items-center mb-4">
        <div>
          <button
            type="button"
            className="btn-soft mb-2 d-inline-flex align-items-center gap-1"
            onClick={() => setActiveTab('products')}
            style={{ height: '32px', fontSize: '13px' }}
          >
            <ArrowLeft size={14} /> Back to Products
          </button>
          <h1 className="m-0 fw-bold">
            {isEditing ? `Edit Product: ${productName || 'Gadget'}` : 'Add New Gadget to Catalog'}
          </h1>
          <p className="text-muted m-0" style={{ fontSize: '13px' }}>
            {isEditing
              ? 'Modify all product fields, variations, pricing, warranty, and storefront descriptions.'
              : 'Configure product type, pricing, variations, stock, shipping and technical details.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSaveProduct}>
        <div className="row g-4">
          {/* Main Left Columns */}
          <div className="col-12 col-xl-8">
            {/* 1. Product Type Card (Black Border & Dark Theme) */}
            <div className="card-x mb-4 shadow-sm">
              <div className="card-head pb-3 mb-3 border-bottom" style={{ borderColor: 'var(--border)' }}>
                <h5 className="m-0 fw-bold">Product Type</h5>
              </div>

              <div className="row g-3">
                {/* Simple Product Option */}
                <div className="col-12 col-md-6">
                  <div
                    onClick={() => setProductType('simple')}
                    className="p-3 rounded-3 cursor-pointer d-flex align-items-center gap-3"
                    style={{
                      border:
                        productType === 'simple'
                          ? '2px solid var(--text, #0f172a)'
                          : '1px solid var(--border)',
                      background:
                        productType === 'simple'
                          ? 'var(--hover)'
                          : 'var(--bg)',
                      boxShadow: productType === 'simple' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer'
                    }}
                  >
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center"
                      style={{
                        width: '20px',
                        height: '20px',
                        border:
                          productType === 'simple'
                            ? '6px solid var(--text, #0f172a)'
                            : '2px solid var(--muted)',
                        background: 'var(--card)'
                      }}
                    />
                    <div>
                      <b className="d-block" style={{ fontSize: '15px' }}>
                        Simple Product
                      </b>
                      <small className="text-muted">Single price & stock</small>
                    </div>
                  </div>
                </div>

                {/* Variable Product Option */}
                <div className="col-12 col-md-6">
                  <div
                    onClick={() => setProductType('variable')}
                    className="p-3 rounded-3 cursor-pointer d-flex align-items-center gap-3"
                    style={{
                      border:
                        productType === 'variable'
                          ? '2px solid var(--text, #0f172a)'
                          : '1px solid var(--border)',
                      background:
                        productType === 'variable'
                          ? 'var(--hover)'
                          : 'var(--bg)',
                      boxShadow: productType === 'variable' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer'
                    }}
                  >
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center"
                      style={{
                        width: '20px',
                        height: '20px',
                        border:
                          productType === 'variable'
                            ? '6px solid var(--text, #0f172a)'
                            : '2px solid var(--muted)',
                        background: 'var(--card)'
                      }}
                    />
                    <div>
                      <b className="d-block" style={{ fontSize: '15px' }}>
                        Variable Product
                      </b>
                      <small className="text-muted">Multiple variations (Colors, Sizes, etc.)</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Basic Information Card */}
            <div className="card-x mb-4 shadow-sm" style={{ overflow: 'visible', position: 'relative', zIndex: 30 }}>
              <div className="card-head pb-3 mb-3 border-bottom" style={{ borderColor: 'var(--border)' }}>
                <h5 className="m-0 fw-bold">Basic Information</h5>
              </div>

              {/* Product Name */}
              <div className="mb-3">
                <label className="d-block mb-1 text-muted" style={{ fontSize: '13px', fontWeight: 600 }}>
                  Product Name *
                </label>
                <input
                  type="text"
                  className="w-100 p-2 rounded-2"
                  style={{
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                  placeholder="Enter product name"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  required
                />
              </div>

              {/* SKU, Categories & Brand */}
              <div className="row g-3">
                <div className="col-12 col-md-3">
                  <label className="d-block mb-1 text-muted" style={{ fontSize: '13px', fontWeight: 600 }}>
                    SKU (Optional)
                  </label>
                  <input
                    type="text"
                    className="w-100 p-2 rounded-2"
                    style={{
                      background: 'var(--bg)',
                      border: '1px solid var(--border)',
                      color: 'var(--text)',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                    placeholder="e.g. PRD-001"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                  />
                  <small className="text-muted d-block mt-1" style={{ fontSize: '11px' }}>
                    Auto-generated if left empty
                  </small>
                </div>

                {/* Searchable Hierarchical Category Selector */}
                <div className="col-12 col-md-5 position-relative" style={{ zIndex: 35 }}>
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label className="text-muted m-0" style={{ fontSize: '13px', fontWeight: 600 }}>
                      Categories (Hierarchical)
                    </label>
                    <button
                      type="button"
                      className="btn btn-link p-0 text-decoration-none"
                      style={{ fontSize: '12px', color: 'var(--primary, #2563eb)', fontWeight: 600 }}
                      onClick={() => setNewCatModalOpen(true)}
                    >
                      + New Category
                    </button>
                  </div>

                  <div
                    onClick={() => {
                      setCatDropdownOpen(!catDropdownOpen);
                      setBrandDropdownOpen(false);
                    }}
                    className="w-100 p-2 rounded-2 d-flex align-items-center justify-content-between"
                    style={{
                      background: 'var(--bg)',
                      border: '1px solid var(--border)',
                      color: selectedCategory ? 'var(--text)' : 'var(--text-muted, #94a3b8)',
                      fontSize: '14px',
                      minHeight: '42px',
                      cursor: 'pointer',
                    }}
                  >
                    <div className="d-flex align-items-center gap-2 text-truncate">
                      <Layers size={16} className="text-primary flex-shrink-0" />
                      <span className="text-truncate fw-medium">
                        {selectedCategory || 'Search and select category...'}
                      </span>
                    </div>
                    <ChevronDown size={16} className="text-muted flex-shrink-0" />
                  </div>

                  {/* Dropdown Popup */}
                  {catDropdownOpen && (
                    <div
                      className="position-absolute shadow-lg rounded-3 p-2"
                      style={{
                        top: '100%',
                        left: '12px',
                        right: '12px',
                        zIndex: 9999,
                        background: 'var(--card, #ffffff)',
                        border: '1px solid var(--border)',
                        color: 'var(--text)',
                        maxHeight: '320px',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      <div className="search mb-2 p-1 border rounded d-flex align-items-center gap-2" style={{ background: 'var(--bg)' }}>
                        <Search size={14} className="text-muted ms-1" />
                        <input
                          type="text"
                          className="w-100 border-0 bg-transparent text-xs"
                          style={{ color: 'var(--text)', outline: 'none' }}
                          placeholder="Search category or subcategory..."
                          value={catSearch}
                          onChange={(e) => setCatSearch(e.target.value)}
                          autoFocus
                        />
                        {catSearch && (
                          <button
                            type="button"
                            className="btn btn-link p-0 text-muted"
                            onClick={() => setCatSearch('')}
                          >
                            <X size={12} />
                          </button>
                        )}
                      </div>

                      <div className="overflow-auto flex-grow-1" style={{ maxHeight: '220px' }}>
                        {filteredCategories.length === 0 ? (
                          <div className="p-3 text-center text-muted text-xs">
                            No categories found.
                            <button
                              type="button"
                              className="btn btn-sm btn-link d-block mx-auto mt-1"
                              onClick={() => {
                                setNewCatName(catSearch);
                                setNewCatModalOpen(true);
                              }}
                            >
                              + Add "{catSearch}" as new category
                            </button>
                          </div>
                        ) : (
                          filteredCategories.map(({ item, depth, path }) => {
                            const isSelected = selectedCategory === item.name;
                            return (
                              <div
                                key={item.id}
                                onClick={() => {
                                  setSelectedCategory(item.name);
                                  setCatDropdownOpen(false);
                                }}
                                className="p-2 rounded-2 d-flex align-items-center justify-content-between"
                                style={{
                                  backgroundColor: isSelected ? 'rgba(37, 99, 235, 0.15)' : 'transparent',
                                  color: isSelected ? 'var(--primary, #38bdf8)' : 'var(--text)',
                                  fontSize: '13px',
                                  paddingLeft: `${depth * 16 + 8}px`,
                                  cursor: 'pointer',
                                }}
                                onMouseEnter={(e) => {
                                  if (!isSelected) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                                }}
                                onMouseLeave={(e) => {
                                  if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                              >
                                <div className="d-flex align-items-center gap-2 text-truncate">
                                  {depth > 0 ? (
                                    <CornerDownRight size={13} className="text-muted flex-shrink-0" />
                                  ) : (
                                    <Layers size={13} className="text-primary flex-shrink-0" />
                                  )}
                                  <span className={depth === 0 ? 'fw-bold' : 'fw-normal'}>
                                    {item.name}
                                  </span>
                                  {depth > 0 && (
                                    <small className="text-muted text-xs opacity-75">
                                      ({path.split(' > ')[0]})
                                    </small>
                                  )}
                                </div>
                                {isSelected && <Check size={14} className="text-primary flex-shrink-0" />}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Searchable Brand Selector */}
                <div className="col-12 col-md-4 position-relative" style={{ zIndex: 34 }}>
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label className="text-muted m-0" style={{ fontSize: '13px', fontWeight: 600 }}>
                      Brand Name
                    </label>
                    <button
                      type="button"
                      className="btn btn-link p-0 text-decoration-none"
                      style={{ fontSize: '12px', color: 'var(--primary, #2563eb)', fontWeight: 600 }}
                      onClick={() => setNewBrandModalOpen(true)}
                    >
                      + New Brand
                    </button>
                  </div>

                  <div
                    onClick={() => {
                      setBrandDropdownOpen(!brandDropdownOpen);
                      setCatDropdownOpen(false);
                    }}
                    className="w-100 p-2 rounded-2 d-flex align-items-center justify-content-between"
                    style={{
                      background: 'var(--bg)',
                      border: '1px solid var(--border)',
                      color: brand ? 'var(--text)' : 'var(--text-muted, #94a3b8)',
                      fontSize: '14px',
                      minHeight: '42px',
                      cursor: 'pointer',
                    }}
                  >
                    <div className="d-flex align-items-center gap-2 text-truncate">
                      <Tags size={16} className="text-primary flex-shrink-0" />
                      <span className="text-truncate fw-medium">
                        {brand || 'Search and select brand...'}
                      </span>
                    </div>
                    <ChevronDown size={16} className="text-muted flex-shrink-0" />
                  </div>

                  {/* Brand Dropdown Popup */}
                  {brandDropdownOpen && (
                    <div
                      className="position-absolute shadow-lg rounded-3 p-2"
                      style={{
                        top: '100%',
                        left: '12px',
                        right: '12px',
                        zIndex: 9999,
                        background: 'var(--card, #ffffff)',
                        border: '1px solid var(--border)',
                        color: 'var(--text)',
                        maxHeight: '320px',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      <div className="search mb-2 p-1 border rounded d-flex align-items-center gap-2" style={{ background: 'var(--bg)' }}>
                        <Search size={14} className="text-muted ms-1" />
                        <input
                          type="text"
                          className="w-100 border-0 bg-transparent text-xs"
                          style={{ color: 'var(--text)', outline: 'none' }}
                          placeholder="Search brand (e.g. DWstore, Aspor)..."
                          value={brandSearch}
                          onChange={(e) => setBrandSearch(e.target.value)}
                          autoFocus
                        />
                        {brandSearch && (
                          <button
                            type="button"
                            className="btn btn-link p-0 text-muted"
                            onClick={() => setBrandSearch('')}
                          >
                            <X size={12} />
                          </button>
                        )}
                      </div>

                      <div className="overflow-auto flex-grow-1" style={{ maxHeight: '220px' }}>
                        {filteredBrands.length === 0 ? (
                          <div className="p-3 text-center text-muted text-xs">
                            No matching brands found.
                            <button
                              type="button"
                              className="btn btn-sm btn-link d-block mx-auto mt-1"
                              onClick={() => {
                                setNewBrandName(brandSearch);
                                setNewBrandModalOpen(true);
                              }}
                            >
                              + Add "{brandSearch}" as new brand
                            </button>
                          </div>
                        ) : (
                          filteredBrands.map((b) => {
                            const isSelected = brand.toLowerCase() === b.name.toLowerCase();
                            return (
                              <div
                                key={b.id}
                                onClick={() => {
                                  setBrand(b.name);
                                  setBrandDropdownOpen(false);
                                }}
                                className="p-2 rounded-2 d-flex align-items-center justify-content-between"
                                style={{
                                  backgroundColor: isSelected ? 'rgba(37, 99, 235, 0.15)' : 'transparent',
                                  color: isSelected ? 'var(--primary, #38bdf8)' : 'var(--text)',
                                  fontSize: '13px',
                                  cursor: 'pointer',
                                }}
                                onMouseEnter={(e) => {
                                  if (!isSelected) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                                }}
                                onMouseLeave={(e) => {
                                  if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                              >
                                <div className="d-flex align-items-center gap-2 text-truncate">
                                  <div
                                    style={{
                                      width: '24px',
                                      height: '24px',
                                      borderRadius: '4px',
                                      backgroundColor: '#ffffff',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      overflow: 'hidden',
                                      flexShrink: 0,
                                    }}
                                  >
                                    {b.logo ? (
                                      <img
                                        src={b.logo}
                                        alt={b.name}
                                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                        onError={(e) => {
                                          (e.target as HTMLElement).style.display = 'none';
                                        }}
                                      />
                                    ) : (
                                      <span style={{ fontSize: '9px', fontWeight: 700, color: '#0f172a' }}>
                                        {b.name.slice(0, 2).toUpperCase()}
                                      </span>
                                    )}
                                  </div>
                                  <span className="fw-medium text-truncate">{b.name}</span>
                                </div>
                                {isSelected && <Check size={14} className="text-primary flex-shrink-0" />}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 3. Product Media & Gallery Card (VPS Self-Hosted Storage) */}
            <div className="card-x mb-4 shadow-sm">
              <div className="card-head d-flex justify-content-between align-items-center pb-3 mb-3 border-bottom" style={{ borderColor: 'var(--border)' }}>
                <div>
                  <h5 className="m-0 fw-bold d-flex align-items-center gap-2">
                    <ImageIcon size={18} className="text-primary" />
                    Product Media &amp; Gallery
                  </h5>
                  <small className="text-muted">
                    Upload product images to your VPS media folder (<code>/media/products/</code>). No external URLs needed.
                  </small>
                </div>
                <span className="badge bg-primary-subtle text-primary border border-primary-subtle" style={{ fontSize: '11px' }}>
                  VPS Media Storage
                </span>
              </div>

              <div className="row g-4">
                {/* 1. Main Display / Featured Image (Left, 4 cols) */}
                <div className="col-12 col-lg-4">
                  <label className="d-block mb-1 text-muted fw-semibold" style={{ fontSize: '13px' }}>
                    Main Featured Image *
                  </label>
                  <small className="text-muted d-block mb-2" style={{ fontSize: '11px' }}>
                    Primary image shown on catalog cards and storefront hero view.
                  </small>

                  {mainImage ? (
                    <div className="p-3 border rounded-3 bg-light text-center position-relative group">
                      <div
                        style={{
                          width: '100%',
                          height: '220px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: '#ffffff',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          border: '1px solid var(--border)',
                        }}
                      >
                        <img
                          src={mainImage}
                          alt="Main Product"
                          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                        />
                      </div>
                      <div className="d-flex align-items-center justify-content-between mt-2 pt-2 border-top">
                        <span className="badge bg-success-subtle text-success" style={{ fontSize: '10px' }}>
                          <CheckCircle2 size={12} className="me-1" /> Primary Image
                        </span>
                        <div className="d-flex gap-2">
                          <label
                            className="btn btn-sm btn-outline-primary"
                            style={{ fontSize: '11px', padding: '3px 8px', cursor: 'pointer' }}
                          >
                            Replace
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleMainImageChange}
                              style={{ display: 'none' }}
                            />
                          </label>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            style={{ fontSize: '11px', padding: '3px 8px' }}
                            onClick={() => setMainImage('')}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                      <small className="text-muted d-block text-truncate mt-1" style={{ fontSize: '10px' }}>
                        {mainImage}
                      </small>
                    </div>
                  ) : (
                    <label
                      className="w-100 p-4 border border-dashed rounded-3 text-center d-flex flex-column align-items-center justify-content-center cursor-pointer transition hover-bg"
                      style={{
                        minHeight: '220px',
                        cursor: 'pointer',
                        borderColor: 'var(--border, #cbd5e1)',
                        background: 'var(--bg, #f8fafc)',
                      }}
                    >
                      <div
                        className="rounded-circle p-3 mb-2 d-flex align-items-center justify-content-center"
                        style={{ background: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary, #2563eb)' }}
                      >
                        <Upload size={24} />
                      </div>
                      <b style={{ fontSize: '13px' }}>
                        {isUploadingMain ? 'Uploading to VPS...' : 'Click to Upload Main Image'}
                      </b>
                      <small className="text-muted mt-1" style={{ fontSize: '11px' }}>
                        PNG, JPG, or WEBP up to 10MB
                      </small>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleMainImageChange}
                        disabled={isUploadingMain}
                        style={{ display: 'none' }}
                      />
                    </label>
                  )}
                </div>

                {/* 2. Product Gallery Images (Right, 8 cols) */}
                <div className="col-12 col-lg-8">
                  <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-2">
                    <div>
                      <label className="text-muted fw-semibold m-0" style={{ fontSize: '13px' }}>
                        Product Gallery Images ({galleryImages.length})
                      </label>
                      <small className="text-muted d-block" style={{ fontSize: '11px' }}>
                        Additional angles, box views, and color variants. These can also be assigned to variations.
                      </small>
                    </div>
                    <label
                      className="btn btn-primary btn-sm d-inline-flex align-items-center gap-1.5 align-self-start align-self-sm-auto"
                      style={{ fontSize: '12px', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer' }}
                    >
                      <Upload size={14} />
                      {isUploadingGallery ? 'Uploading...' : '+ Upload Gallery Images'}
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleGalleryImagesChange}
                        disabled={isUploadingGallery}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>

                  {/* Thumbnail Grid */}
                  <div
                    className="p-3 rounded-3 border"
                    style={{
                      background: 'var(--bg, #f8fafc)',
                      minHeight: '220px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: galleryImages.length === 0 ? 'center' : 'flex-start',
                    }}
                  >
                    {galleryImages.length === 0 ? (
                      <div className="text-center text-muted p-4">
                        <ImageIcon size={32} className="mx-auto mb-2 opacity-50" />
                        <p className="m-0" style={{ fontSize: '13px' }}>
                          No gallery images uploaded yet. Click <b>+ Upload Gallery Images</b> to select multiple photos from your device.
                        </p>
                      </div>
                    ) : (
                      <div className="d-flex flex-wrap gap-2.5">
                        {galleryImages.map((img, idx) => {
                          const isMain = mainImage === img;
                          return (
                            <div
                              key={img + idx}
                              className="rounded-3 border bg-white p-1.5 position-relative group shadow-xs"
                              style={{
                                width: '92px',
                                borderColor: isMain ? '#2563eb' : 'var(--border)',
                                borderWidth: isMain ? '2px' : '1px',
                              }}
                            >
                              <div
                                style={{
                                  width: '100%',
                                  height: '80px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  overflow: 'hidden',
                                  borderRadius: '6px',
                                  background: '#ffffff',
                                }}
                              >
                                <img
                                  src={img}
                                  alt={`Gallery ${idx + 1}`}
                                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                />
                              </div>

                              {isMain && (
                                <span
                                  className="position-absolute top-1 start-1 badge bg-primary text-white"
                                  style={{ fontSize: '9px', padding: '2px 4px' }}
                                >
                                  Main
                                </span>
                              )}

                              <div className="d-flex justify-content-between align-items-center mt-1 pt-1 border-top">
                                {!isMain ? (
                                  <button
                                    type="button"
                                    onClick={() => handleSetMainImage(img)}
                                    className="btn btn-link p-0 text-decoration-none text-primary"
                                    style={{ fontSize: '10px' }}
                                    title="Set as Main Image"
                                  >
                                    Set Main
                                  </button>
                                ) : (
                                  <span style={{ fontSize: '10px', color: '#16a34a' }}>Primary</span>
                                )}

                                <button
                                  type="button"
                                  onClick={() => handleRemoveGalleryImage(img)}
                                  className="btn btn-link p-0 text-danger"
                                  title="Remove from gallery"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Manual Image URL / VPS Path Input */}
                    <div className="mt-3 pt-2 border-top d-flex gap-2 align-items-center">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        style={{ fontSize: '12px' }}
                        placeholder="Or paste /media/products/... path or image URL"
                        value={manualImageUrl}
                        onChange={(e) => setManualImageUrl(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddManualImage();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleAddManualImage}
                        className="btn btn-sm btn-light border text-nowrap"
                        style={{ fontSize: '12px' }}
                      >
                        + Add Path
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Simple Product: Pricing & Inventory Cards */}
            {productType === 'simple' && (
              <>
                {/* Pricing Card */}
                <div className="card-x mb-4 shadow-sm">
                  <div className="card-head pb-3 mb-3 border-bottom" style={{ borderColor: 'var(--border)' }}>
                    <h5 className="m-0 fw-bold">Pricing</h5>
                  </div>

                  <div className="row g-3">
                    <div className="col-12 col-md-4">
                      <label className="d-block mb-1 text-muted" style={{ fontSize: '13px', fontWeight: 600 }}>
                        Regular Price (LKR) *
                      </label>
                      <input
                        type="number"
                        className="w-100 p-2 rounded-2 fw-bold"
                        style={{
                          background: 'var(--bg)',
                          border: '1px solid var(--border)',
                          color: 'var(--text)',
                          fontSize: '14px',
                          outline: 'none'
                        }}
                        placeholder="Rs. 0.00"
                        value={regularPrice}
                        onChange={(e) => setRegularPrice(e.target.value)}
                        required
                      />
                      <small className="text-muted" style={{ fontSize: '11px' }}>
                        Standard price shown to customers
                      </small>
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="d-block mb-1 text-muted" style={{ fontSize: '13px', fontWeight: 600 }}>
                        Sale / Promo Price (LKR)
                      </label>
                      <input
                        type="number"
                        className="w-100 p-2 rounded-2"
                        style={{
                          background: 'var(--bg)',
                          border: '1px solid var(--border)',
                          color: 'var(--text)',
                          fontSize: '14px',
                          outline: 'none'
                        }}
                        placeholder="Optional discount"
                        value={salePrice}
                        onChange={(e) => setSalePrice(e.target.value)}
                      />
                      <small className="text-muted" style={{ fontSize: '11px' }}>
                        If entered, regular price is crossed out
                      </small>
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="d-block mb-1 text-muted" style={{ fontSize: '13px', fontWeight: 600 }}>
                        Cost / Purchase Price (LKR)
                      </label>
                      <input
                        type="number"
                        className="w-100 p-2 rounded-2"
                        style={{
                          background: 'var(--bg)',
                          border: '1px solid var(--border)',
                          color: 'var(--text)',
                          fontSize: '14px',
                          outline: 'none'
                        }}
                        placeholder="Rs. 0.00"
                        value={costPrice}
                        onChange={(e) => setCostPrice(e.target.value)}
                      />
                      <small className="text-muted" style={{ fontSize: '11px' }}>
                        Supplier wholesale cost
                      </small>
                    </div>
                  </div>

                  {/* Customer Storefront Price Preview */}
                  {regularPrice && parseFloat(regularPrice) > 0 && (
                    <div
                      className="mt-3 p-3 rounded-3 d-flex flex-wrap align-items-center justify-content-between gap-2"
                      style={{ background: 'var(--hover)', border: '1px solid var(--border)' }}
                    >
                      <span className="text-muted" style={{ fontSize: '12px', fontWeight: 600 }}>
                        STOREFRONT CUSTOMER VIEW:
                      </span>
                      {salePrice && parseFloat(salePrice) > 0 && parseFloat(salePrice) < parseFloat(regularPrice) ? (
                        <div className="d-flex align-items-center gap-2">
                          <span className="text-muted text-decoration-line-through" style={{ fontSize: '14px' }}>
                            LKR {parseFloat(regularPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                          <b style={{ fontSize: '18px', color: '#2563eb' }}>
                            LKR {parseFloat(salePrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </b>
                          <span
                            className="badge rounded-pill bg-danger"
                            style={{ fontSize: '11px', padding: '3px 8px' }}
                          >
                            SAVE {Math.round(((parseFloat(regularPrice) - parseFloat(salePrice)) / parseFloat(regularPrice)) * 100)}%
                          </span>
                        </div>
                      ) : (
                        <b style={{ fontSize: '18px', color: '#2563eb' }}>
                          LKR {parseFloat(regularPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </b>
                      )}
                    </div>
                  )}
                </div>

                {/* Inventory Card */}
                <div className="card-x mb-4 shadow-sm">
                  <div className="card-head pb-3 mb-3 border-bottom" style={{ borderColor: 'var(--border)' }}>
                    <h5 className="m-0 fw-bold">Inventory</h5>
                  </div>

                  <div className="row g-3">
                    <div className="col-12 col-md-4">
                      <label className="d-block mb-1 text-muted" style={{ fontSize: '13px', fontWeight: 600 }}>
                        Opening Stock *
                      </label>
                      <input
                        type="number"
                        className="w-100 p-2 rounded-2"
                        style={{
                          background: 'var(--bg)',
                          border: '1px solid var(--border)',
                          color: 'var(--text)',
                          fontSize: '14px',
                          outline: 'none'
                        }}
                        placeholder="0"
                        value={openingStock}
                        onChange={(e) => setOpeningStock(e.target.value)}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="d-block mb-1 text-muted" style={{ fontSize: '13px', fontWeight: 600 }}>
                        Stock Alert Level (Optional)
                      </label>
                      <input
                        type="number"
                        className="w-100 p-2 rounded-2"
                        style={{
                          background: 'var(--bg)',
                          border: '1px solid var(--border)',
                          color: 'var(--text)',
                          fontSize: '14px',
                          outline: 'none'
                        }}
                        placeholder="e.g. 10"
                        value={stockAlertLevel}
                        onChange={(e) => setStockAlertLevel(e.target.value)}
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="d-block mb-1 text-muted" style={{ fontSize: '13px', fontWeight: 600 }}>
                        Catalog Status
                      </label>
                      <select
                        className="sel-x w-100"
                        value={stockStatus}
                        onChange={(e) => setStockStatus(e.target.value as any)}
                      >
                        <option value="Active">In Stock (Active)</option>
                        <option value="Low stock">Low Stock Alert</option>
                        <option value="Out of stock">Out of Stock</option>
                      </select>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* 4. Variable Product: Attributes & Variations */}
            {productType === 'variable' && (
              <>
                {/* Attributes Section */}
                <div className="card-x mb-4 shadow-sm">
                  <div className="card-head pb-3 mb-3 border-bottom" style={{ borderColor: 'var(--border)' }}>
                    <h5 className="m-0 fw-bold">Attributes</h5>
                  </div>

                  <div className="mb-4">
                    <b className="d-block mb-1" style={{ fontSize: '15px' }}>
                      Product Attributes
                    </b>
                    <p className="text-muted mb-3" style={{ fontSize: '13px' }}>
                      Add attributes like Color, Size, Weight, etc. Each attribute can have multiple values.
                    </p>

                    {/* Add Attribute Input Bar */}
                    <div className="d-flex gap-2 mb-4">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Attribute name (e.g., Color, Size, Capacity)"
                        value={newAttrName}
                        onChange={(e) => setNewAttrName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddAttribute();
                          }
                        }}
                        style={{
                          background: 'var(--bg)',
                          border: '1px solid var(--border)',
                          color: 'var(--text)',
                          fontSize: '14px'
                        }}
                      />
                      <button
                        type="button"
                        className="btn text-white px-4 fw-semibold"
                        style={{ background: '#0f172a', border: '1px solid #0f172a', whiteSpace: 'nowrap' }}
                        onClick={handleAddAttribute}
                      >
                        Add Attribute
                      </button>
                    </div>

                    {/* List of Created Attributes */}
                    <div className="d-flex flex-column gap-3 mb-4">
                      {workingAttributes.map((attr) => (
                        <div
                          key={attr.id}
                          className="p-3 rounded-3"
                          style={{
                            background: 'var(--bg)',
                            border: '1px solid var(--border)'
                          }}
                        >
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="fw-bold" style={{ fontSize: '14px', textTransform: 'capitalize' }}>
                              {attr.name}
                            </span>
                            <button
                              type="button"
                              className="btn btn-link text-danger p-0 text-decoration-none fw-semibold"
                              style={{ fontSize: '12px' }}
                              onClick={() => handleRemoveAttribute(attr.id)}
                            >
                              Remove
                            </button>
                          </div>

                          {/* Value Input Bar */}
                          <div className="d-flex gap-2 mb-2">
                            <input
                              type="text"
                              className="form-control"
                              placeholder={`Add ${attr.name} value (e.g., Red, Blue, 49mm)`}
                              value={attr.currentInput}
                              onChange={(e) =>
                                setWorkingAttributes(
                                  workingAttributes.map((a) =>
                                    a.id === attr.id ? { ...a, currentInput: e.target.value } : a
                                  )
                                )
                              }
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddAttributeValue(attr.id);
                                }
                              }}
                              style={{
                                background: 'var(--hover)',
                                border: '1px solid var(--border)',
                                color: 'var(--text)',
                                fontSize: '13px'
                              }}
                            />
                            <button
                              type="button"
                              className="btn text-white px-3 fw-semibold"
                              style={{ background: '#0f172a', border: '1px solid #0f172a' }}
                              onClick={() => handleAddAttributeValue(attr.id)}
                            >
                              Add
                            </button>
                          </div>

                          {/* Attribute Value Pills */}
                          <div className="d-flex flex-wrap gap-2">
                            {attr.values.map((v) => (
                              <span
                                key={v}
                                className="d-inline-flex align-items-center gap-1 px-2 py-1 rounded-2"
                                style={{
                                  background: 'var(--hover)',
                                  color: 'var(--text)',
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  border: '1px solid var(--border)'
                                }}
                              >
                                {v}
                                <button
                                  type="button"
                                  className="btn p-0 border-0 text-danger ms-1"
                                  style={{ lineHeight: 1 }}
                                  onClick={() => handleRemoveAttributeValue(attr.id, v)}
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                            {attr.values.length === 0 && (
                              <small className="text-muted fst-italic">
                                No values added yet. Type a value and click Add.
                              </small>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Generate Variations Button (Black Theme) */}
                    <button
                      type="button"
                      className="btn w-100 text-white py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
                      style={{ background: '#0f172a', border: '1px solid #0f172a', fontSize: '14px' }}
                      onClick={handleGenerateVariations}
                    >
                      <RefreshCw size={16} /> Generate Variations
                    </button>
                  </div>
                </div>

                {/* Variations Section */}
                <div className="card-x mb-4 shadow-sm">
                  <div className="card-head d-flex justify-content-between align-items-center pb-3 mb-3 border-bottom" style={{ borderColor: 'var(--border)' }}>
                    <div>
                      <h5 className="m-0 fw-bold">Variations</h5>
                    </div>
                    {variations.length > 0 && (
                      <div className="d-flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="btn-soft"
                          style={{ fontSize: '12px', padding: '4px 8px' }}
                          onClick={handleBulkSetVariationsRegularPrice}
                        >
                          Sync Regular Price to All
                        </button>
                        <button
                          type="button"
                          className="btn-soft"
                          style={{ fontSize: '12px', padding: '4px 8px' }}
                          onClick={handleBulkSetVariationsSalePrice}
                        >
                          Sync Sale Price to All
                        </button>
                        <button
                          type="button"
                          className="btn-soft"
                          style={{ fontSize: '12px', padding: '4px 8px' }}
                          onClick={handleBulkSetVariationsStock}
                        >
                          Sync Stock to All
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <b className="d-block mb-1" style={{ fontSize: '15px' }}>
                      Product Variations ({variations.length})
                    </b>
                    <p className="text-muted mb-3" style={{ fontSize: '13px' }}>
                      Edit price, SKU and inventory stock for each variation.
                    </p>

                    {variations.length === 0 ? (
                      <div
                        className="text-center p-4 rounded-3 text-muted"
                        style={{ background: 'var(--hover)', border: '1px dashed var(--border)' }}
                      >
                        <p className="m-0">
                          No variations generated yet. Add your attributes above and click <b>Generate Variations</b>.
                        </p>
                      </div>
                    ) : (
                      <div className="d-flex flex-column gap-3">
                        {variations.map((v) => (
                          <div
                            key={v.id}
                            className="p-3 rounded-3"
                            style={{
                              background: 'var(--bg)',
                              border: '1px solid var(--border)'
                            }}
                          >
                            {/* Attribute Badge Chips & Remove Link */}
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <div className="d-flex flex-wrap gap-2">
                                {Object.entries(v.attributes).map(([key, val]) => (
                                  <span
                                    key={key}
                                    className="px-2 py-1 rounded-2"
                                    style={{
                                      background: 'var(--hover)',
                                      color: 'var(--text)',
                                      fontSize: '12px',
                                      fontWeight: 600,
                                      border: '1px solid var(--border)'
                                    }}
                                  >
                                    <span className="text-muted">{key}:</span> {val}
                                  </span>
                                ))}
                              </div>
                              <button
                                type="button"
                                className="btn btn-link text-danger p-0 text-decoration-none fw-semibold"
                                style={{ fontSize: '12px' }}
                                onClick={() => handleRemoveVariation(v.id)}
                              >
                                Remove
                              </button>
                            </div>

                            {/* Variation Image Slot */}
                            <div
                              className="d-flex align-items-center gap-3 mb-2 p-2 rounded-2"
                              style={{ background: 'var(--hover)', border: '1px dashed var(--border)' }}
                            >
                              <div
                                style={{
                                  width: '46px',
                                  height: '46px',
                                  borderRadius: '8px',
                                  background: '#ffffff',
                                  border: '1px solid var(--border)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  overflow: 'hidden',
                                  flexShrink: 0,
                                  cursor: 'pointer'
                                }}
                                onClick={() =>
                                  setVariationImageModal({
                                    open: true,
                                    variationId: v.id,
                                    variationTitle: Object.entries(v.attributes)
                                      .map(([k, val]) => `${k}: ${val}`)
                                      .join(' / ')
                                  })
                                }
                                title="Click to assign or change image"
                              >
                                {v.image || v.displayImage ? (
                                  <img
                                    src={v.image || v.displayImage}
                                    alt="Variation"
                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                  />
                                ) : (
                                  <ImageIcon size={20} className="text-muted" />
                                )}
                              </div>
                              <div className="d-flex flex-column flex-grow-1">
                                <div className="d-flex align-items-center justify-content-between">
                                  <small className="fw-bold" style={{ fontSize: '12px' }}>
                                    {v.image || v.displayImage ? 'Variation Image Assigned' : 'No Specific Image (Uses Main Product Image)'}
                                  </small>
                                  <div className="d-flex gap-2">
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-link p-0 text-decoration-none fw-semibold"
                                      style={{ fontSize: '12px', color: 'var(--primary, #2563eb)' }}
                                      onClick={() =>
                                        setVariationImageModal({
                                          open: true,
                                          variationId: v.id,
                                          variationTitle: Object.entries(v.attributes)
                                            .map(([k, val]) => `${k}: ${val}`)
                                            .join(' / ')
                                        })
                                      }
                                    >
                                      {v.image || v.displayImage ? 'Change Image' : '+ Assign Image'}
                                    </button>
                                    {(v.image || v.displayImage) && (
                                      <button
                                        type="button"
                                        className="btn btn-sm btn-link p-0 text-danger text-decoration-none fw-semibold"
                                        style={{ fontSize: '12px' }}
                                        onClick={() => {
                                          handleUpdateVariation(v.id, 'image', '');
                                          handleUpdateVariation(v.id, 'displayImage', '');
                                        }}
                                      >
                                        Clear
                                      </button>
                                    )}
                                  </div>
                                </div>
                                <small className="text-muted" style={{ fontSize: '11px' }}>
                                  Choose from Product Gallery or upload specific image for this color/model.
                                </small>
                              </div>
                            </div>

                            {/* Row of Inputs */}
                            <div className="row g-2">
                              <div className="col-12 col-md-3">
                                <label className="text-muted d-block mb-1" style={{ fontSize: '11px', fontWeight: 600 }}>
                                  SKU (Optional)
                                </label>
                                <input
                                  type="text"
                                  className="w-100 p-2 rounded-2"
                                  style={{
                                    background: 'var(--hover)',
                                    border: '1px solid var(--border)',
                                    color: 'var(--text)',
                                    fontSize: '13px'
                                  }}
                                  placeholder="SKU (Optional)"
                                  value={v.sku || ''}
                                  onChange={(e) =>
                                    handleUpdateVariation(v.id, 'sku', e.target.value)
                                  }
                                />
                              </div>

                              <div className="col-6 col-md-3">
                                <label className="text-muted d-block mb-1" style={{ fontSize: '11px', fontWeight: 600 }}>
                                  Regular Price *
                                </label>
                                <input
                                  type="number"
                                  className="w-100 p-2 rounded-2 fw-bold"
                                  style={{
                                    background: 'var(--hover)',
                                    border: '1px solid var(--border)',
                                    color: 'var(--text)',
                                    fontSize: '13px'
                                  }}
                                  placeholder="Rs. 0.00"
                                  value={v.regularPrice || ''}
                                  onChange={(e) =>
                                    handleUpdateVariation(
                                      v.id,
                                      'regularPrice',
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                  required
                                />
                              </div>

                              <div className="col-6 col-md-2">
                                <label className="text-muted d-block mb-1" style={{ fontSize: '11px', fontWeight: 600 }}>
                                  Sale Price (Optional)
                                </label>
                                <input
                                  type="number"
                                  className="w-100 p-2 rounded-2"
                                  style={{
                                    background: 'var(--hover)',
                                    border: '1px solid var(--border)',
                                    color: 'var(--text)',
                                    fontSize: '13px'
                                  }}
                                  placeholder="Optional"
                                  value={v.salePrice || ''}
                                  onChange={(e) =>
                                    handleUpdateVariation(
                                      v.id,
                                      'salePrice',
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                />
                              </div>

                              <div className="col-6 col-md-2">
                                <label className="text-muted d-block mb-1" style={{ fontSize: '11px', fontWeight: 600 }}>
                                  Cost Price
                                </label>
                                <input
                                  type="number"
                                  className="w-100 p-2 rounded-2"
                                  style={{
                                    background: 'var(--hover)',
                                    border: '1px solid var(--border)',
                                    color: 'var(--text)',
                                    fontSize: '13px'
                                  }}
                                  placeholder="0"
                                  value={v.costPrice || ''}
                                  onChange={(e) =>
                                    handleUpdateVariation(
                                      v.id,
                                      'costPrice',
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                />
                              </div>

                              <div className="col-6 col-md-2">
                                <label className="text-muted d-block mb-1" style={{ fontSize: '11px', fontWeight: 600 }}>
                                  Stock *
                                </label>
                                <input
                                  type="number"
                                  className="w-100 p-2 rounded-2"
                                  style={{
                                    background: 'var(--hover)',
                                    border: '1px solid var(--border)',
                                    color: 'var(--text)',
                                    fontSize: '13px'
                                  }}
                                  placeholder="0"
                                  value={v.stock || ''}
                                  onChange={(e) =>
                                    handleUpdateVariation(
                                      v.id,
                                      'stock',
                                      parseInt(e.target.value, 10) || 0
                                    )
                                  }
                                  required
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* 5. Descriptions: Short Description & Description (Separated clearly as requested) */}
            <div className="card-x mb-4 shadow-sm">
              <div className="card-head pb-3 mb-3 border-bottom" style={{ borderColor: 'var(--border)' }}>
                <h5 className="m-0 fw-bold">Product Descriptions</h5>
              </div>

              {/* 5A. Short Description (Directly beside product image on storefront) */}
              <div className="mb-4">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div>
                    <label className="fw-semibold m-0 d-flex align-items-center gap-2" style={{ fontSize: '14px' }}>
                      <span>Short Description (Bullet Highlights)</span>
                      <span className="badge rounded-pill" style={{ background: 'var(--hover)', color: 'var(--text)', fontSize: '11px', border: '1px solid var(--border)' }}>
                        Beside Product Image on Storefront
                      </span>
                    </label>
                    <small className="text-muted d-block" style={{ fontSize: '12px' }}>
                      Shows on customer page directly to the right of product image (e.g. key bullet points).
                    </small>
                  </div>
                  <div className="seg">
                    <button
                      type="button"
                      className={shortDescMode === 'visual' ? 'on' : ''}
                      onClick={() => setShortDescMode('visual')}
                    >
                      <Eye size={12} className="me-1 d-inline" /> Preview
                    </button>
                    <button
                      type="button"
                      className={shortDescMode === 'html' ? 'on' : ''}
                      onClick={() => setShortDescMode('html')}
                    >
                      <Code size={12} className="me-1 d-inline" /> HTML
                    </button>
                  </div>
                </div>

                <textarea
                  rows={4}
                  className="w-100 p-3 rounded-2"
                  style={{
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                  placeholder="Enter short bullet points shown beside product image..."
                  value={shortDesc}
                  onChange={(e) => setShortDesc(e.target.value)}
                />

                {shortDescMode === 'visual' && shortDesc.trim() && (
                  <div className="mt-2 p-3 rounded-2" style={{ background: 'var(--hover)', border: '1px solid var(--border)' }}>
                    <small className="text-muted d-block mb-1">Storefront Visual Output:</small>
                    <div dangerouslySetInnerHTML={{ __html: shortDesc }} style={{ fontSize: '13px' }} />
                  </div>
                )}
              </div>

              {/* 5B. Detailed Description (Below product image in Description tab) */}
              <div>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div>
                    <label className="fw-semibold m-0 d-flex align-items-center gap-2" style={{ fontSize: '14px' }}>
                      <span>Detailed Description (Full Specs & Overview)</span>
                      <span className="badge rounded-pill" style={{ background: 'var(--hover)', color: 'var(--text)', fontSize: '11px', border: '1px solid var(--border)' }}>
                        Description Tab Below Image
                      </span>
                    </label>
                    <small className="text-muted d-block" style={{ fontSize: '12px' }}>
                      Full technical breakdown shown under the Description tab table below the product image.
                    </small>
                  </div>
                  <div className="seg">
                    <button
                      type="button"
                      className={fullDescMode === 'visual' ? 'on' : ''}
                      onClick={() => setFullDescMode('visual')}
                    >
                      <Eye size={12} className="me-1 d-inline" /> Preview
                    </button>
                    <button
                      type="button"
                      className={fullDescMode === 'html' ? 'on' : ''}
                      onClick={() => setFullDescMode('html')}
                    >
                      <Code size={12} className="me-1 d-inline" /> HTML
                    </button>
                  </div>
                </div>

                <textarea
                  rows={6}
                  className="w-100 p-3 rounded-2"
                  style={{
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                  placeholder="Enter full specifications, features, package contents, and warranty guidelines..."
                  value={fullDesc}
                  onChange={(e) => setFullDesc(e.target.value)}
                />

                {fullDescMode === 'visual' && fullDesc.trim() && (
                  <div className="mt-2 p-3 rounded-2" style={{ background: 'var(--hover)', border: '1px solid var(--border)' }}>
                    <small className="text-muted d-block mb-1">Storefront Visual Output:</small>
                    <div style={{ fontSize: '13px', whiteSpace: 'pre-line' }} dangerouslySetInnerHTML={{ __html: fullDesc }} />
                  </div>
                )}
              </div>
            </div>

            {/* 6. Shipping Section */}
            <div className="card-x mb-4 shadow-sm">
              <div className="card-head pb-3 mb-3 border-bottom" style={{ borderColor: 'var(--border)' }}>
                <h5 className="m-0 fw-bold">Shipping Details</h5>
              </div>

              <div className="row g-3">
                {/* Weight */}
                <div className="col-12 col-md-4">
                  <label className="d-block mb-1 text-muted" style={{ fontSize: '13px', fontWeight: 600 }}>
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-100 p-2 rounded-2"
                    style={{
                      background: 'var(--bg)',
                      border: '1px solid var(--border)',
                      color: 'var(--text)',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                    placeholder="0"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                  />
                  <small className="text-muted" style={{ fontSize: '11px' }}>
                    Parcel weight for courier rates
                  </small>
                </div>

                {/* Dimensions */}
                <div className="col-12 col-md-8">
                  <label className="d-block mb-1 text-muted" style={{ fontSize: '13px', fontWeight: 600 }}>
                    Dimensions (cm) - Length / Width / Height
                  </label>
                  <div className="d-flex gap-2">
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Length"
                      value={dimLength}
                      onChange={(e) => setDimLength(e.target.value)}
                      style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '13px' }}
                    />
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Width"
                      value={dimWidth}
                      onChange={(e) => setDimWidth(e.target.value)}
                      style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '13px' }}
                    />
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Height"
                      value={dimHeight}
                      onChange={(e) => setDimHeight(e.target.value)}
                      style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '13px' }}
                    />
                  </div>
                </div>

                {/* Shipping Class */}
                <div className="col-12">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label className="text-muted m-0" style={{ fontSize: '13px', fontWeight: 600 }}>
                      Shipping Class
                    </label>
                    <button
                      type="button"
                      className="btn btn-link p-0 text-decoration-none"
                      style={{ fontSize: '12px', color: 'var(--primary, #2563eb)', fontWeight: 600 }}
                      onClick={() => setNewShippingClassModalOpen(true)}
                    >
                      + New Shipping Class
                    </button>
                  </div>
                  <select
                    className="sel-x w-100"
                    value={shippingClass}
                    onChange={(e) => setShippingClass(e.target.value)}
                  >
                    {shippingClasses.map((sc) => (
                      <option key={sc.id} value={sc.name}>
                        {sc.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Custom Product Shipping Fee */}
                <div className="col-12 col-md-6 mt-3">
                  <label className="d-block mb-1 text-muted" style={{ fontSize: '13px', fontWeight: 600 }}>
                    Product Custom Shipping Fee (LKR)
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Leave empty for standard (Rs. 450)"
                    value={productShippingFee}
                    onChange={(e) => setProductShippingFee(e.target.value)}
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '14px' }}
                  />
                  <small className="text-muted" style={{ fontSize: '11px' }}>
                    Leave blank to use default Islandwide rate (LKR 450). Enter <b>0</b> for Free Shipping on this item.
                  </small>
                </div>
              </div>
            </div>

            {/* 7. Warranty Period Card */}
            <div className="card-x mb-4 shadow-sm">
              <div className="card-head pb-3 mb-3 border-bottom" style={{ borderColor: 'var(--border)' }}>
                <h5 className="m-0 fw-bold">Warranty Period</h5>
              </div>

              <div>
                <label className="d-block mb-1 text-muted" style={{ fontSize: '13px', fontWeight: 600 }}>
                  Warranty Coverage & Terms
                </label>
                <input
                  type="text"
                  className="w-100 p-2 rounded-2 mb-2"
                  style={{
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                  placeholder="e.g. 7 Days Checking Warranty / 6 Months Company Warranty"
                  value={warrantyPeriod}
                  onChange={(e) => setWarrantyPeriod(e.target.value)}
                />

                {/* Quick preset chips */}
                <div className="d-flex flex-wrap gap-2">
                  {[
                    '7 Days Checking Warranty',
                    '1 Month Replacement Warranty',
                    '3 Months Warranty',
                    '6 Months Company Warranty',
                    '1 Year Official Warranty'
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      className="btn-soft"
                      style={{ fontSize: '12px', padding: '4px 8px' }}
                      onClick={() => setWarrantyPeriod(preset)}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Actions, Profit Preview & Quick Tips */}
          <div className="col-12 col-xl-4">
            <div style={{ position: 'sticky', top: '90px' }}>
              {/* Actions Card (Black Buttons) */}
              <div className="card-x mb-3 shadow-sm">
                <div className="card-head pb-2 mb-3 border-bottom" style={{ borderColor: 'var(--border)' }}>
                  <h6 className="m-0 fw-bold">Actions</h6>
                </div>

                <div className="d-flex flex-column gap-2">
                  <button
                    type="submit"
                    className="btn w-100 text-white py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
                    style={{
                      background: '#0f172a',
                      border: '1px solid #0f172a',
                      fontSize: '14px',
                      borderRadius: '8px'
                    }}
                  >
                    <Check size={16} /> {isEditing ? 'Update Product' : 'Save Product'}
                  </button>

                  <button
                    type="button"
                    className="btn-soft w-100 py-2 d-flex align-items-center justify-content-center gap-2"
                    style={{ fontSize: '13px', borderRadius: '8px' }}
                    onClick={() => setActiveTab('products')}
                  >
                    <X size={15} /> Cancel
                  </button>
                </div>
              </div>

              {/* Profit Preview Card */}
              <div className="card-x mb-3 shadow-sm">
                <div className="card-head pb-2 mb-3 border-bottom" style={{ borderColor: 'var(--border)' }}>
                  <h6 className="m-0 fw-bold">Profit Preview</h6>
                </div>

                <div className="d-flex flex-column gap-2" style={{ fontSize: '13px' }}>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Selling Price</span>
                    <b>Rs {profitData.selling.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Cost Price</span>
                    <b>Rs {profitData.cost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b>
                  </div>
                  <hr className="my-1" style={{ borderColor: 'var(--border)' }} />
                  <div className="d-flex justify-content-between">
                    <span className="fw-semibold">Gross Profit</span>
                    <b style={{ fontSize: '15px' }}>
                      Rs {profitData.grossProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </b>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Margin</span>
                    <b>{profitData.margin.toFixed(1)}%</b>
                  </div>
                </div>
              </div>

              {/* Quick Tips Card */}
              <div
                className="card-x p-3 shadow-sm"
                style={{
                  background: 'var(--hover)',
                  border: '1px solid var(--border)'
                }}
              >
                <div className="d-flex align-items-center gap-2 mb-2">
                  <Info size={16} />
                  <h6 className="m-0 fw-bold" style={{ fontSize: '13px' }}>
                    Quick Tips
                  </h6>
                </div>
                <ul className="m-0 ps-3 text-muted" style={{ fontSize: '12px', lineHeight: '1.6' }}>
                  <li>Use a unique SKU for easy tracking (Optional)</li>
                  <li>Set a stock alert level to avoid stockouts</li>
                  <li>Variable products support size/color variants</li>
                  <li>Weight and dimensions are synced with Courier Waybills</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* New Category Quick Modal */}
      {newCatModalOpen && (
        <div className="react-modal-backdrop" onClick={() => setNewCatModalOpen(false)}>
          <div
            className="card-x"
            style={{ width: '100%', maxWidth: '440px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex justify-content-between align-items-center pb-2 mb-3 border-bottom" style={{ borderColor: 'var(--border)' }}>
              <h5 className="m-0 fw-bold d-flex align-items-center gap-2">
                <Layers size={18} className="text-primary" />
                Create New Category
              </h5>
              <button
                type="button"
                className="icon-btn"
                style={{ width: '28px', height: '28px' }}
                onClick={() => setNewCatModalOpen(false)}
              >
                <X size={15} />
              </button>
            </div>
            <form onSubmit={handleCreateCategory}>
              <div className="mb-3">
                <label className="d-block mb-1 text-muted" style={{ fontSize: '12px', fontWeight: 600 }}>
                  Category Name *
                </label>
                <input
                  type="text"
                  className="w-100 p-2 rounded-2"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
                  placeholder="e.g. Wireless Microphones"
                  value={newCatName}
                  onChange={(e) => {
                    setNewCatName(e.target.value);
                    if (!newCatSlug) {
                      setNewCatSlug(e.target.value.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-'));
                    }
                  }}
                  autoFocus
                  required
                />
              </div>

              {/* Parent Category Selector */}
              <div className="mb-3">
                <label className="d-block mb-1 text-muted" style={{ fontSize: '12px', fontWeight: 600 }}>
                  Parent Category (Optional)
                </label>
                <select
                  className="sel-x w-100"
                  value={newCatParentId}
                  onChange={(e) => setNewCatParentId(e.target.value)}
                >
                  <option value="">— None (Top-level Category) —</option>
                  {treeCategories.map(({ item, depth }) => (
                    <option key={item.id} value={item.id || item.slug}>
                      {'\u00A0'.repeat(depth * 3)}
                      {depth > 0 ? '↳ ' : ''}
                      {item.name}
                    </option>
                  ))}
                </select>
                <small className="text-muted d-block mt-1" style={{ fontSize: '11px' }}>
                  Choose a parent category to create a subcategory (WooCommerce hierarchy).
                </small>
              </div>

              <div className="d-flex justify-content-end gap-2 pt-2 border-top" style={{ borderColor: 'var(--border)' }}>
                <button
                  type="button"
                  className="btn-soft"
                  onClick={() => setNewCatModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn text-white"
                  style={{ background: '#0f172a', border: '1px solid #0f172a' }}
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Brand Quick Modal */}
      {newBrandModalOpen && (
        <div className="react-modal-backdrop" onClick={() => setNewBrandModalOpen(false)}>
          <div
            className="card-x"
            style={{ width: '100%', maxWidth: '440px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex justify-content-between align-items-center pb-2 mb-3 border-bottom" style={{ borderColor: 'var(--border)' }}>
              <h5 className="m-0 fw-bold d-flex align-items-center gap-2">
                <Tags size={18} className="text-primary" />
                Add New Brand
              </h5>
              <button
                type="button"
                className="icon-btn"
                style={{ width: '28px', height: '28px' }}
                onClick={() => setNewBrandModalOpen(false)}
              >
                <X size={15} />
              </button>
            </div>
            <form onSubmit={handleCreateBrand}>
              <div className="mb-3">
                <label className="d-block mb-1 text-muted" style={{ fontSize: '12px', fontWeight: 600 }}>
                  Brand Name *
                </label>
                <input
                  type="text"
                  className="w-100 p-2 rounded-2"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
                  placeholder="e.g. Sony / Anker / UGREEN"
                  value={newBrandName}
                  onChange={(e) => {
                    setNewBrandName(e.target.value);
                    if (!newBrandSlug) {
                      setNewBrandSlug(e.target.value.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-'));
                    }
                  }}
                  autoFocus
                  required
                />
              </div>

              {/* Brand Logo URL */}
              <div className="mb-3">
                <label className="d-block mb-1 text-muted" style={{ fontSize: '12px', fontWeight: 600 }}>
                  Brand Logo Image (Upload to VPS or URL)
                </label>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <label
                    className="btn-soft d-inline-flex align-items-center gap-2 mb-0"
                    style={{ cursor: isUploadingBrandLogo ? 'not-allowed' : 'pointer', fontSize: '12px', padding: '6px 12px' }}
                  >
                    <Upload size={14} />
                    {isUploadingBrandLogo ? 'Uploading to VPS...' : 'Upload Logo from Computer'}
                    <input
                      type="file"
                      accept="image/*"
                      className="d-none"
                      disabled={isUploadingBrandLogo}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setIsUploadingBrandLogo(true);
                        const url = await uploadMediaFile(file, 'brands');
                        if (url) {
                          setNewBrandLogo(url);
                          showNotification('Brand logo uploaded successfully to VPS media!');
                        }
                        setIsUploadingBrandLogo(false);
                        e.target.value = '';
                      }}
                    />
                  </label>
                  <span className="text-muted" style={{ fontSize: '11px' }}>or enter image link below:</span>
                </div>
                <input
                  type="text"
                  className="w-100 p-2 rounded-2"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
                  placeholder="/media/brands/... or https://..."
                  value={newBrandLogo}
                  onChange={(e) => setNewBrandLogo(e.target.value)}
                />

                {newBrandLogo && (
                  <div className="p-2 border rounded bg-white d-flex align-items-center gap-2 mt-2">
                    <div style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img
                        src={newBrandLogo}
                        alt="Preview"
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <div>
                      <small className="text-dark fw-bold d-block text-xs">Logo Preview</small>
                      <small className="text-muted" style={{ fontSize: '10px' }}>Shown in storefront homepage brand ticker.</small>
                    </div>
                  </div>
                )}
              </div>

              {/* Tagline */}
              <div className="mb-3">
                <label className="d-block mb-1 text-muted" style={{ fontSize: '12px', fontWeight: 600 }}>
                  Tagline / Specialization (Optional)
                </label>
                <input
                  type="text"
                  className="w-100 p-2 rounded-2"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
                  placeholder="e.g. Audio & Tech / Life Accessories"
                  value={newBrandTag}
                  onChange={(e) => setNewBrandTag(e.target.value)}
                />
              </div>

              <div className="d-flex justify-content-end gap-2 pt-2 border-top" style={{ borderColor: 'var(--border)' }}>
                <button
                  type="button"
                  className="btn-soft"
                  onClick={() => setNewBrandModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn text-white"
                  style={{ background: '#0f172a', border: '1px solid #0f172a' }}
                >
                  Save & Select Brand
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Shipping Class Quick Modal */}
      {newShippingClassModalOpen && (
        <div className="react-modal-backdrop" onClick={() => setNewShippingClassModalOpen(false)}>
          <div
            className="card-x"
            style={{ width: '100%', maxWidth: '420px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex justify-content-between align-items-center pb-2 mb-3 border-bottom" style={{ borderColor: 'var(--border)' }}>
              <h5 className="m-0">Add New Shipping Class</h5>
              <button
                type="button"
                className="icon-btn"
                style={{ width: '28px', height: '28px' }}
                onClick={() => setNewShippingClassModalOpen(false)}
              >
                <X size={15} />
              </button>
            </div>
            <form onSubmit={handleCreateShippingClass}>
              <div className="mb-3">
                <label className="d-block mb-1 text-muted" style={{ fontSize: '12px', fontWeight: 600 }}>
                  Shipping Class Name *
                </label>
                <input
                  type="text"
                  className="w-100 p-2 rounded-2"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
                  placeholder="e.g. Express 24H Islandwide"
                  value={newShippingClassName}
                  onChange={(e) => setNewShippingClassName(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              <div className="mb-3">
                <label className="d-block mb-1 text-muted" style={{ fontSize: '12px', fontWeight: 600 }}>
                  Courier Rate / Fee (LKR)
                </label>
                <input
                  type="number"
                  className="w-100 p-2 rounded-2"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
                  placeholder="e.g. 450"
                  value={newShippingClassRate}
                  onChange={(e) => setNewShippingClassRate(e.target.value)}
                />
                <small className="text-muted" style={{ fontSize: '11px' }}>
                  Optional default delivery fee for this class
                </small>
              </div>
              <div className="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn-soft"
                  onClick={() => setNewShippingClassModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn text-white"
                  style={{ background: '#0f172a', border: '1px solid #0f172a' }}
                >
                  Save Shipping Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Variation Image Assignment Modal */}
      {variationImageModal?.open && (
        <div className="react-modal-backdrop" onClick={() => setVariationImageModal(null)}>
          <div
            className="card-x"
            style={{ width: '100%', maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex justify-content-between align-items-center pb-2 mb-3 border-bottom" style={{ borderColor: 'var(--border)' }}>
              <div>
                <h5 className="m-0 fw-bold d-flex align-items-center gap-2">
                  <ImageIcon size={18} className="text-primary" />
                  Select Variation Image
                </h5>
                <small className="text-muted">
                  Variation: <b className="text-dark">{variationImageModal.variationTitle || 'Selected Variation'}</b>
                </small>
              </div>
              <button
                type="button"
                className="icon-btn"
                style={{ width: '28px', height: '28px' }}
                onClick={() => setVariationImageModal(null)}
              >
                <X size={15} />
              </button>
            </div>

            {/* Option 1: Select from existing gallery or main */}
            <div className="mb-4">
              <label className="d-block mb-2 fw-semibold" style={{ fontSize: '13px' }}>
                1. Select from Product Gallery (1-Click)
              </label>
              {Array.from(new Set([mainImage, ...galleryImages].filter(Boolean))).length === 0 ? (
                <div className="p-3 text-center text-muted rounded-2 border" style={{ background: 'var(--hover)', fontSize: '12px' }}>
                  No product images uploaded yet. Upload an image below or in Section 3 (Product Media).
                </div>
              ) : (
                <div className="d-flex flex-wrap gap-2">
                  {Array.from(new Set([mainImage, ...galleryImages].filter(Boolean))).map((imgUrl, i) => {
                    const currentVar = variations.find((v) => v.id === variationImageModal.variationId);
                    const isSelected = (currentVar?.image || currentVar?.displayImage) === imgUrl;
                    return (
                      <div
                        key={i}
                        className="position-relative rounded-2 overflow-hidden"
                        style={{
                          width: '90px',
                          height: '90px',
                          border: isSelected ? '3px solid #2563eb' : '1px solid var(--border)',
                          cursor: 'pointer',
                          background: '#fff',
                          boxShadow: isSelected ? '0 0 0 2px rgba(37,99,235,0.2)' : 'none'
                        }}
                        onClick={() => {
                          handleUpdateVariation(variationImageModal.variationId, 'image', imgUrl);
                          handleUpdateVariation(variationImageModal.variationId, 'displayImage', imgUrl);
                          showNotification('Assigned image to variation!');
                          setVariationImageModal(null);
                        }}
                      >
                        <img
                          src={imgUrl}
                          alt="Gallery item"
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                        {isSelected && (
                          <span
                            className="position-absolute bottom-0 start-0 end-0 text-center py-1 text-white fw-bold"
                            style={{ background: '#2563eb', fontSize: '10px' }}
                          >
                            Selected
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Option 2: Upload new image specifically for this variation */}
            <div className="mb-4 p-3 rounded-2 border" style={{ background: 'var(--hover)' }}>
              <label className="d-block mb-1 fw-semibold" style={{ fontSize: '13px' }}>
                2. Or Upload a New Image from Computer
              </label>
              <p className="text-muted mb-2" style={{ fontSize: '11px' }}>
                Directly uploads to VPS storage (`/media/products/`) and links to this variation.
              </p>
              <label
                className="btn-soft d-inline-flex align-items-center gap-2 mb-0"
                style={{ cursor: 'pointer', fontSize: '12px', padding: '7px 14px' }}
              >
                <Upload size={14} />
                Upload Variation Image to VPS
                <input
                  type="file"
                  accept="image/*"
                  className="d-none"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const url = await uploadMediaFile(file, 'products');
                    if (url) {
                      handleUpdateVariation(variationImageModal.variationId, 'image', url);
                      handleUpdateVariation(variationImageModal.variationId, 'displayImage', url);
                      if (!galleryImages.includes(url)) {
                        setGalleryImages((prev) => [...prev, url]);
                      }
                      showNotification('Uploaded and assigned variation image to VPS successfully!');
                      setVariationImageModal(null);
                    }
                    e.target.value = '';
                  }}
                />
              </label>
            </div>

            {/* Footer Buttons */}
            <div className="d-flex justify-content-between align-items-center pt-3 border-top" style={{ borderColor: 'var(--border)' }}>
              <button
                type="button"
                className="btn btn-sm btn-link text-danger p-0 text-decoration-none fw-semibold"
                style={{ fontSize: '12px' }}
                onClick={() => {
                  handleUpdateVariation(variationImageModal.variationId, 'image', '');
                  handleUpdateVariation(variationImageModal.variationId, 'displayImage', '');
                  showNotification('Reset variation image to default.');
                  setVariationImageModal(null);
                }}
              >
                Reset to Default (No Variation Image)
              </button>
              <button
                type="button"
                className="btn-soft"
                onClick={() => setVariationImageModal(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
