import React, { useState, useMemo } from 'react';
import {
  LayoutTemplate,
  Sparkles,
  Flame,
  Image as ImageIcon,
  Plus,
  Trash2,
  ExternalLink,
  Save,
  RotateCcw,
  Check,
  Search,
  ArrowRight,
  Info,
  CheckCircle2,
  Layers,
  Tags,
  Package,
  Sliders,
  Upload,
  ArrowUp,
  ArrowDown,
  Grid,
  CheckSquare,
  Square,
  Bookmark,
  Award,
  FolderTree,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { ProductItem, CategoryItem, BrandItem } from '../../types';
import { getStorefrontUrl } from '../../config';
import { resolveImageUrl } from '../../utils/image';

interface HomeCustomizerViewProps {
  products: ProductItem[];
  categories: CategoryItem[];
  brands: BrandItem[];
  showNotification: (msg: string) => void;
  setActiveTab?: (tab: any) => void;
}

export const HomeCustomizerView: React.FC<HomeCustomizerViewProps> = ({
  products,
  categories,
  brands,
  showNotification,
  setActiveTab,
}) => {
  const [activeSection, setActiveSection] = useState<'hero' | 'brands' | 'banners' | 'categories' | 'deals' | 'bento'>('hero');
  const [activeHeroBox, setActiveHeroBox] = useState<'mainBox' | 'sideBox1' | 'sideBox2'>('mainBox');
  const [activeBentoBoxIndex, setActiveBentoBoxIndex] = useState<number>(0);
  const [categorySearch, setCategorySearch] = useState('');
  const [brandSearch, setBrandSearch] = useState('');
  const [saving, setSaving] = useState(false);

  // Default initial configuration
  const defaultConfig = {
    hero: {
      mainBox: {
        type: 'custom' as 'category' | 'product' | 'brand' | 'custom',
        selectedId: '',
        badge: "DWSTORE • SRI LANKA'S TRUSTED TECH STORE",
        title: 'PREMIUM TECH, SMARTWATCHES & ACCESSORIES',
        description: 'Direct importer warranties, 100% genuine products & island-wide express cash on delivery. Pay in 3x or 4x installments with KOKO and Payzy.',
        button1Text: 'SHOP ALL PRODUCTS',
        button1Link: '/shop',
        button2Text: 'EXPLORE DEALS',
        button2Link: '/shop',
        image: '/media/products/T800-Ultra-Smart-Watch-1_d7ac6b08.jpg',
        secondaryImage: '/media/products/RPP2921_5d0c7431.jpg',
      },
      sideBox1: {
        type: 'product' as 'category' | 'product' | 'brand' | 'custom',
        selectedId: '29517',
        badge: 'BEST SELLER',
        title: 'T800 Ultra Series 8',
        subtitle: 'Large HD Display • Bluetooth Call • Sports Modes',
        priceText: 'Rs. 1,990',
        buttonText: 'Order now',
        link: '/product/t800-ultra-smartwatch-series-8-29517',
        image: '/media/products/T800-Ultra-Smart-Watch-1_d7ac6b08.jpg',
      },
      sideBox2: {
        type: 'product' as 'category' | 'product' | 'brand' | 'custom',
        selectedId: '29534',
        badge: 'HIGH CAPACITY',
        title: 'Remax RPP-292 PD+QC',
        subtitle: '20,000mAh 22.5W Super Fast Charging with LED',
        priceText: 'Rs. 9,990',
        buttonText: 'Order now',
        link: '/product/remax-rpp-292-225w-20000mah-pdqc-power-bank-29534',
        image: '/media/products/RPP2921_5d0c7431.jpg',
      },
    },
    promoBanners: {
      enabled: true,
      recommendedSize: '1400 x 360 px (Aspect ratio ~ 4:1 desktop, responsive mobile)',
      banners: [
        {
          id: 'banner-1',
          title: '11.11 Mega Sale - Up to 50% Off Top Tech & Accessories',
          image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1400&auto=format&fit=crop&q=80',
          link: '/shop',
          active: true,
        },
        {
          id: 'banner-2',
          title: 'Smart Watch Festival - Island-wide Free Delivery on Prepaid & COD',
          image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=1400&auto=format&fit=crop&q=80',
          link: '/category/smart-watches',
          active: true,
        },
      ],
    },
    brandsBar: {
      enabled: true,
      selectedBrands: [
        { name: 'Anker', slug: 'anker', tag: 'Sound & Power', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Anker_logo.svg/512px-Anker_logo.svg.png' },
        { name: 'Baseus', slug: 'baseus', tag: 'Charging & Audio', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Baseus_logo.svg/512px-Baseus_logo.svg.png' },
        { name: 'JBL', slug: 'jbl', tag: 'Signature Sound', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/JBL_logo.svg/512px-JBL_logo.svg.png' },
        { name: 'Remax', slug: 'remax', tag: 'Life Accessories', logo: 'https://seeklogo.com/images/R/remax-logo-F91A8CF3BA-seeklogo.com.png' },
        { name: 'Joyroom', slug: 'joyroom', tag: 'Fast Charging', logo: 'https://cdn.worldvectorlogo.com/logos/joyroom.svg' },
        { name: 'Lenovo', slug: 'lenovo', tag: 'Audio & Tech', logo: '/media/brands/lenovo-logo.svg' },
        { name: 'SONY', slug: 'sony', tag: 'Audio & Imaging', logo: '/media/brands/sony-logo.svg' },
        { name: 'SAMSUNG', slug: 'samsung', tag: 'Original Accessories', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Samsung_Logo.svg/512px-Samsung_Logo.svg.png' },
        { name: 'SanDisk', slug: 'sandisk', tag: 'Storage & Flash', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/SanDisk_Logo.svg/512px-SanDisk_Logo.svg.png' },
        { name: 'UGREEN', slug: 'ugreen', tag: 'Adapters & Hubs', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/UGREEN_logo.svg/512px-UGREEN_logo.svg.png' },
        { name: 'Hikvision', slug: 'hikvision', tag: 'Security & Cam', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Hikvision_logo.svg/512px-Hikvision_logo.svg.png' },
        { name: 'Aspor', slug: 'aspor', tag: 'Power Banks', logo: 'https://aspor.com.pk/wp-content/uploads/2021/04/aspor-logo.png' }
      ]
    },
    shopByCategories: {
      enabled: true,
      title: 'Shop by Categories',
      subtitle: 'Explore authentic imported tech products with official warranty',
      selectedCategorySlugs: [
        'phone-accessories',
        'cable-and-adaptors',
        'headphone-and-headset',
        'electronics-accessories',
        'bluetooth-speakers',
        'computer-accessories',
        'bluetooth-handfree',
        'power-banks'
      ]
    },
    superDeals: {
      enabled: true,
      title: "Today's Super Deals",
      subtitle: 'Limited time mega discounts with express island-wide cash on delivery',
      countdownHours: 18,
      productIds: ['29517', '29528', '29534', '29522', '33554', '29526'],
    },
    bentoGrid: {
      enabled: true,
      boxes: [
        {
          id: 'box1',
          categorySlug: 'headphone-and-headset',
          badge: 'STUDIO & WIRELESS',
          title: 'Headphones & Earbuds',
          description: 'Over-Ear Headsets, TWS Noise Cancelling & Wireless Earphones',
          subtitle: '',
          buttonText: 'Explore Headphones',
          link: '/category/headphone-and-headset',
          image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop&q=80'
        },
        {
          id: 'box2',
          categorySlug: 'smartwatches',
          badge: 'WEARABLE TECH',
          title: 'Smart Watches',
          description: 'AMOLED Displays, Bluetooth Calling, Heart Rate & Fitness Sensors',
          subtitle: '',
          buttonText: 'Explore Smartwatches',
          link: '/category/smartwatches',
          image: '/media/products/T800-Ultra-Smart-Watch-1_d7ac6b08.jpg'
        },
        {
          id: 'box3',
          categorySlug: 'bluetooth-speakers',
          badge: 'HI-FI SOUND',
          title: 'Speakers',
          description: 'Wireless Bluetooth & Extra Bass',
          subtitle: '55+ Models',
          buttonText: 'Shop Speakers',
          link: '/category/bluetooth-speakers',
          image: '/media/categories/bluetooth-speakers-M-10.jpg'
        },
        {
          id: 'box4',
          categorySlug: 'power-banks',
          badge: 'FAST CHARGE',
          title: 'PowerBanks',
          description: '10000mAh – 30000mAh 22.5W PD',
          subtitle: '32+ Models',
          buttonText: 'Shop PowerBanks',
          link: '/category/power-banks',
          image: '/media/categories/power-banks-1.jpg'
        },
        {
          id: 'box5',
          categorySlug: 'phone-accessories',
          badge: 'DAILY ESSENTIALS',
          title: 'Phone Accessories',
          description: 'Fast Wall Chargers, Type-C Cables, 9H Tempered Glass & Car Phone Mounts.',
          subtitle: '140+ Certified Accessories',
          buttonText: 'Explore Phone Accessories',
          link: '/category/phone-accessories',
          image: '/media/categories/phone-accessories-m-6.jpg'
        }
      ]
    },
  };

  const [config, setConfig] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('dwstore_homepage_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.hero?.mainBox?.image?.includes('wp-content/uploads')) {
          parsed.hero.mainBox.image = '/media/products/T800-Ultra-Smart-Watch-1_d7ac6b08.jpg';
        }
        if (parsed?.hero?.mainBox?.secondaryImage?.includes('wp-content/uploads')) {
          parsed.hero.mainBox.secondaryImage = '/media/products/RPP2921_5d0c7431.jpg';
        }
        if (parsed?.hero?.sideBox1?.image?.includes('wp-content/uploads')) {
          parsed.hero.sideBox1.image = '/media/products/T800-Ultra-Smart-Watch-1_d7ac6b08.jpg';
        }
        if (parsed?.hero?.sideBox2?.image?.includes('wp-content/uploads')) {
          parsed.hero.sideBox2.image = '/media/products/RPP2921_5d0c7431.jpg';
        }
        return parsed;
      }
    } catch {}
    return defaultConfig;
  });

  // Unified robust API POST helper with fallback
  const postHomepageApi = async (dataToSave: any) => {
    const endpoints = ['/api/homepage', `${getStorefrontUrl()}/api/homepage`];
    let lastError: any = null;
    for (const url of endpoints) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataToSave),
        });
        if (res.ok) {
          return { ok: true, res };
        } else {
          const errData = await res.json().catch(() => ({}));
          return { ok: false, error: errData.error || 'Server status ' + res.status };
        }
      } catch (e: any) {
        lastError = e;
      }
    }
    throw lastError || new Error('Could not connect to Storefront API');
  };

  // Helper to sanitize any legacy wp-content or broken URLs
  const cleanHeroConfig = (cfg: any) => {
    if (!cfg || typeof cfg !== 'object') return cfg;
    const copy = { ...cfg };
    if (copy.hero) {
      copy.hero = { ...copy.hero };
      if (copy.hero.mainBox) {
        copy.hero.mainBox = { ...copy.hero.mainBox };
        if (!copy.hero.mainBox.image || copy.hero.mainBox.image.includes('wp-content/uploads')) {
          copy.hero.mainBox.image = '/media/products/T800-Ultra-Smart-Watch-1_d7ac6b08.jpg';
        }
        if (!copy.hero.mainBox.secondaryImage || copy.hero.mainBox.secondaryImage.includes('wp-content/uploads')) {
          copy.hero.mainBox.secondaryImage = '/media/products/RPP2921_5d0c7431.jpg';
        }
      }
      if (copy.hero.sideBox1) {
        copy.hero.sideBox1 = { ...copy.hero.sideBox1 };
        if (!copy.hero.sideBox1.image || copy.hero.sideBox1.image.includes('wp-content/uploads')) {
          copy.hero.sideBox1.image = '/media/products/T800-Ultra-Smart-Watch-1_d7ac6b08.jpg';
        }
      }
      if (copy.hero.sideBox2) {
        copy.hero.sideBox2 = { ...copy.hero.sideBox2 };
        if (!copy.hero.sideBox2.image || copy.hero.sideBox2.image.includes('wp-content/uploads')) {
          copy.hero.sideBox2.image = '/media/products/RPP2921_5d0c7431.jpg';
        }
      }
    }
    return copy;
  };

  // Fetch live config from Storefront API on mount
  React.useEffect(() => {
    const fetchConfig = async () => {
      const endpoints = ['/api/homepage?t=' + Date.now(), `${getStorefrontUrl()}/api/homepage?t=` + Date.now()];
      for (const url of endpoints) {
        try {
          const res = await fetch(url, { cache: 'no-store' });
          if (res.ok) {
            const data = await res.json();
            if (data && data.success && data.config) {
              const cleaned = cleanHeroConfig(data.config);
              setConfig(cleaned);
              try {
                localStorage.setItem('dwstore_homepage_config', JSON.stringify(cleaned));
              } catch {}
              return;
            }
          }
        } catch {}
      }
    };
    fetchConfig();
  }, []);

  // Product search state for Today's Super Deals
  const [dealSearch, setDealSearch] = useState('');

  // Upload helper for banner images directly to VPS
  const uploadBannerFile = async (file: File): Promise<string | null> => {
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'home-customizer');
      const endpoints = ['/api/upload', `${getStorefrontUrl()}/api/upload`];
      let lastError: any = null;
      for (const url of endpoints) {
        try {
          const res = await fetch(url, { method: 'POST', body: fd });
          const data = await res.json();
          if (res.ok && data.success && data.url) {
            return data.url;
          }
        } catch (e: any) {
          lastError = e;
        }
      }
      showNotification('Failed to upload banner: ' + (lastError?.message || 'Server error'));
      return null;
    } catch (err: any) {
      showNotification('Failed to upload banner: ' + err.message);
      return null;
    }
  };

  // Save changes to API & localStorage
  const handleSave = async (customConfig?: any) => {
    setSaving(true);
    // Ignore synthetic mouse/touch click events from onClick={handleSave}
    const isExplicitConfig = customConfig && typeof customConfig === 'object' && !('nativeEvent' in customConfig) && !('isTrusted' in customConfig);
    const dataToSave = isExplicitConfig ? customConfig : config;
    try {
      localStorage.setItem('dwstore_homepage_config', JSON.stringify(dataToSave));
      window.dispatchEvent(new Event('storage'));

      const result = await postHomepageApi(dataToSave);
      if (result.ok) {
        showNotification('Homepage changes published live to Storefront successfully!');
      } else {
        showNotification(result.error || 'Saved to local browser storage.');
      }
    } catch (err: any) {
      showNotification('Save error: ' + (err?.message || 'Could not reach server'));
    } finally {
      setSaving(false);
    }
  };

  // Instant save helper for switches & deletions
  const saveConfigImmediately = async (updatedConfig: any, toastMsg?: string) => {
    try {
      localStorage.setItem('dwstore_homepage_config', JSON.stringify(updatedConfig));
      const result = await postHomepageApi(updatedConfig);
      if (result.ok && toastMsg) {
        showNotification(toastMsg);
      }
    } catch (err: any) {
      console.error('Instant save error:', err);
      showNotification('Save connection error: ' + (err?.message || 'Server offline'));
    }
  };

  // Reset to default
  const handleResetDefaults = () => {
    if (window.confirm('Reset homepage layout and sections to original defaults?')) {
      setConfig(defaultConfig);
      showNotification('Homepage configuration reset to defaults. Remember to click Save.');
    }
  };

  // Helper to resolve 9-position coordinates for banner overlay button
  const getAdminPositionStyle = (pos?: string): React.CSSProperties => {
    switch (pos) {
      case 'top-left':
        return { top: '16px', left: '16px' };
      case 'top-center':
        return { top: '16px', left: '50%', transform: 'translateX(-50%)' };
      case 'top-right':
        return { top: '16px', right: '16px' };
      case 'middle-left':
        return { top: '50%', left: '16px', transform: 'translateY(-50%)' };
      case 'middle-center':
        return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
      case 'middle-right':
        return { top: '50%', right: '16px', transform: 'translateY(-50%)' };
      case 'bottom-center':
        return { bottom: '16px', left: '50%', transform: 'translateX(-50%)' };
      case 'bottom-right':
        return { bottom: '16px', right: '16px' };
      case 'bottom-left':
      default:
        return { bottom: '16px', left: '16px' };
    }
  };

  // Helper to handle Hero box type change (product | category | brand | custom | banner)
  const handleHeroTypeChange = (boxKey: 'mainBox' | 'sideBox1' | 'sideBox2', type: 'category' | 'product' | 'brand' | 'custom' | 'banner') => {
    setConfig((prev: any) => ({
      ...prev,
      hero: {
        ...prev.hero,
        [boxKey]: {
          ...prev.hero[boxKey],
          type,
          buttonPosition: prev.hero[boxKey]?.buttonPosition || 'bottom-left',
        },
      },
    }));
  };

  // Helper when a product is picked for a Hero box
  const handleSelectProductForHero = (boxKey: 'mainBox' | 'sideBox1' | 'sideBox2', productId: string) => {
    const prod = products.find((p) => String(p.id) === String(productId));
    if (!prod) return;

    setConfig((prev: any) => {
      const box = prev.hero[boxKey];
      return {
        ...prev,
        hero: {
          ...prev.hero,
          [boxKey]: {
            ...box,
            selectedId: String(prod.id),
            title: prod.name,
            priceText: prod.salePrice ? `Rs. ${prod.salePrice.toLocaleString()}` : box.priceText,
            image: prod.image || box.image,
            link: `/product/${prod.sku ? prod.sku.toLowerCase() : prod.id}`,
            button1Link: boxKey === 'mainBox' ? `/product/${prod.sku ? prod.sku.toLowerCase() : prod.id}` : undefined,
          },
        },
      };
    });
  };

  // Helper when a category is picked for a Hero box
  const handleSelectCategoryForHero = (boxKey: 'mainBox' | 'sideBox1' | 'sideBox2', catSlug: string) => {
    const cat = categories.find((c) => c.slug === catSlug || c.id === catSlug);
    if (!cat) return;

    // Pick first product from this category if available
    const catProds = products.filter((p) => p.category?.toLowerCase() === cat.name.toLowerCase() || p.category?.toLowerCase().includes(cat.slug));
    const firstProd = catProds[0];

    setConfig((prev: any) => {
      const box = prev.hero[boxKey];
      return {
        ...prev,
        hero: {
          ...prev.hero,
          [boxKey]: {
            ...box,
            selectedId: cat.slug,
            title: cat.name,
            subtitle: `Explore authentic ${cat.name} with official warranty`,
            link: `/category/${cat.slug}`,
            button1Link: boxKey === 'mainBox' ? `/category/${cat.slug}` : undefined,
            image: firstProd?.image || box.image,
          },
        },
      };
    });
  };

  // Helper when a brand is picked for a Hero box
  const handleSelectBrandForHero = (boxKey: 'mainBox' | 'sideBox1' | 'sideBox2', brandSlug: string) => {
    const br = brands.find((b) => b.slug === brandSlug || b.id === brandSlug);
    if (!br) return;

    const brandProds = products.filter((p) => p.brand?.toLowerCase() === br.name.toLowerCase());
    const firstProd = brandProds[0];

    setConfig((prev: any) => {
      const box = prev.hero[boxKey];
      return {
        ...prev,
        hero: {
          ...prev.hero,
          [boxKey]: {
            ...box,
            selectedId: br.slug,
            title: br.name,
            subtitle: br.description || `Original ${br.name} genuine gadgets and audio`,
            link: `/brand/${br.slug}`,
            button1Link: boxKey === 'mainBox' ? `/brand/${br.slug}` : undefined,
            image: firstProd?.image || br.logo || box.image,
          },
        },
      };
    });
  };

  // Products belonging to the selected category (for image picking)
  const categoryProductsForActiveBox = useMemo(() => {
    const currentBox = config?.hero?.[activeHeroBox];
    if (currentBox?.type !== 'category' || !currentBox?.selectedId) return [];
    const cat = categories.find((c) => c.slug === currentBox.selectedId || c.id === currentBox.selectedId);
    if (!cat) return [];
    return products.filter((p) => p.category?.toLowerCase() === cat.name.toLowerCase() || p.category?.toLowerCase().includes(cat.slug));
  }, [config, activeHeroBox, categories, products]);

  // Promo Banners handlers
  const handleAddBanner = () => {
    const newBanner = {
      id: `banner-${Date.now()}`,
      title: 'New Promotional Campaign',
      image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1400&auto=format&fit=crop&q=80',
      link: '/shop',
      active: true,
    };
    setConfig((prev: any) => ({
      ...prev,
      promoBanners: {
        ...prev.promoBanners,
        banners: [...(prev.promoBanners?.banners || []), newBanner],
      },
    }));
  };

  const handleUpdateBanner = (index: number, key: string, value: any) => {
    setConfig((prev: any) => {
      const copy = [...(prev.promoBanners?.banners || [])];
      copy[index] = { ...copy[index], [key]: value };
      const updated = {
        ...prev,
        promoBanners: {
          ...prev.promoBanners,
          banners: copy,
        },
      };
      if (key === 'active') {
        saveConfigImmediately(
          updated,
          value ? 'Promo banner activated!' : 'Promo banner paused/hidden!'
        );
      }
      return updated;
    });
  };

  const handleDeleteBanner = (index: number) => {
    const copy = [...(config?.promoBanners?.banners || [])];
    copy.splice(index, 1);
    const updated = {
      ...config,
      promoBanners: {
        ...config.promoBanners,
        banners: copy,
      },
    };
    setConfig(updated);
    saveConfigImmediately(updated, 'Promo banner removed.');
  };

  // Super Deals handlers
  const filteredSearchProducts = useMemo(() => {
    if (!dealSearch.trim()) return [];
    const q = dealSearch.toLowerCase();
    const currentSelected = new Set(config?.superDeals?.productIds || []);
    return products
      .filter((p) => !currentSelected.has(String(p.id)) && (p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)))
      .slice(0, 8);
  }, [dealSearch, products, config]);

  const handleAddProductToDeals = (prodId: string) => {
    const prod = products.find((p) => String(p.id) === String(prodId));
    if (prod && (prod.status === 'Out of stock' || (typeof prod.stock === 'number' && prod.stock <= 0))) {
      showNotification(`"${prod.name}" is currently Out of Stock and cannot be added to Super Deals.`);
      return;
    }
    const currentIds = config?.superDeals?.productIds || [];
    if (currentIds.includes(String(prodId))) return;
    const updated = {
      ...config,
      superDeals: {
        ...config.superDeals,
        productIds: [...currentIds, String(prodId)],
      },
    };
    setConfig(updated);
    setDealSearch('');
    saveConfigImmediately(updated, 'Deal product added.');
  };

  const handleRemoveProductFromDeals = (prodId: string) => {
    const updated = {
      ...config,
      superDeals: {
        ...config.superDeals,
        productIds: (config?.superDeals?.productIds || []).filter((id: string) => String(id) !== String(prodId)),
      },
    };
    setConfig(updated);
    saveConfigImmediately(updated, 'Deal product removed.');
  };

  // ────────────────────────────────────────────────────────────────
  // Bento Grid Handlers
  // ────────────────────────────────────────────────────────────────
  const categoryProductsForBento = useMemo(() => {
    const currentBox = config?.bentoGrid?.boxes?.[activeBentoBoxIndex];
    if (!currentBox?.categorySlug) return [];
    const cat = categories.find((c) => c.slug === currentBox.categorySlug || c.id === currentBox.categorySlug);
    if (!cat) return [];
    return products.filter((p) => p.category?.toLowerCase() === cat.name.toLowerCase() || p.category?.toLowerCase().includes(cat.slug));
  }, [config, activeBentoBoxIndex, categories, products]);

  const handleUpdateBentoBox = (index: number, key: string, value: any) => {
    setConfig((prev: any) => {
      const boxes = [...(prev.bentoGrid?.boxes || [])];
      boxes[index] = { ...boxes[index], [key]: value };
      return {
        ...prev,
        bentoGrid: {
          ...prev.bentoGrid,
          boxes,
        },
      };
    });
  };

  const handleSelectCategoryForBentoBox = (index: number, catSlug: string) => {
    const cat = categories.find((c) => c.slug === catSlug || c.id === catSlug);
    if (!cat) return;
    const catProds = products.filter((p) => p.category?.toLowerCase() === cat.name.toLowerCase() || p.category?.toLowerCase().includes(cat.slug));
    const firstProd = catProds[0];

    setConfig((prev: any) => {
      const boxes = [...(prev.bentoGrid?.boxes || [])];
      const box = boxes[index] || {};
      boxes[index] = {
        ...box,
        categorySlug: cat.slug,
        title: cat.name,
        link: `/category/${cat.slug}`,
        buttonText: `Explore ${cat.name}`,
        subtitle: cat.productCount > 0 ? `${cat.productCount}+ Models` : box.subtitle || '',
        image: firstProd?.image || box.image,
      };
      return {
        ...prev,
        bentoGrid: {
          ...prev.bentoGrid,
          boxes,
        },
      };
    });
  };

  // ────────────────────────────────────────────────────────────────
  // Shop by Categories Carousel Handlers
  // ────────────────────────────────────────────────────────────────
  const filteredCategoriesForPicker = useMemo(() => {
    if (!categorySearch.trim()) return categories;
    const q = categorySearch.toLowerCase();
    return categories.filter((c) => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q));
  }, [categories, categorySearch]);

  const handleToggleCategoryForCarousel = (slug: string) => {
    const currentSlugs: string[] = config?.shopByCategories?.selectedCategorySlugs || [];
    let updatedSlugs: string[];
    if (currentSlugs.includes(slug)) {
      updatedSlugs = currentSlugs.filter((s) => s !== slug);
    } else {
      updatedSlugs = [...currentSlugs, slug];
    }
    const updated = {
      ...config,
      shopByCategories: {
        ...config.shopByCategories,
        selectedCategorySlugs: updatedSlugs,
      },
    };
    setConfig(updated);
    saveConfigImmediately(updated, 'Carousel categories updated.');
  };

  const handleMoveCategoryOrder = (index: number, direction: 'up' | 'down') => {
    const slugs = [...(config?.shopByCategories?.selectedCategorySlugs || [])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= slugs.length) return;
    const temp = slugs[index];
    slugs[index] = slugs[targetIndex];
    slugs[targetIndex] = temp;
    const updated = {
      ...config,
      shopByCategories: {
        ...config.shopByCategories,
        selectedCategorySlugs: slugs,
      },
    };
    setConfig(updated);
  };

  const handleRemoveCategoryFromCarousel = (slug: string) => {
    const slugs = (config?.shopByCategories?.selectedCategorySlugs || []).filter((s: string) => s !== slug);
    const updated = {
      ...config,
      shopByCategories: {
        ...config.shopByCategories,
        selectedCategorySlugs: slugs,
      },
    };
    setConfig(updated);
    saveConfigImmediately(updated, 'Category removed from carousel.');
  };

  const handleSelectTopCategories = (count: number = 8) => {
    const topSlugs = [...categories]
      .filter((c) => c.productCount > 0)
      .sort((a, b) => b.productCount - a.productCount)
      .slice(0, count)
      .map((c) => c.slug);
    const updated = {
      ...config,
      shopByCategories: {
        ...config.shopByCategories,
        selectedCategorySlugs: topSlugs,
      },
    };
    setConfig(updated);
    saveConfigImmediately(updated, `Top ${count} categories selected for carousel.`);
  };

  // ────────────────────────────────────────────────────────────────
  // Brand Logos Bar Handlers
  // ────────────────────────────────────────────────────────────────
  const filteredBrandsForPicker = useMemo(() => {
    const currentSlugs = new Set((config?.brandsBar?.selectedBrands || []).map((b: any) => b.slug));
    const available = brands.filter((b) => !currentSlugs.has(b.slug));
    if (!brandSearch.trim()) return available;
    const q = brandSearch.toLowerCase();
    return available.filter((b) => b.name.toLowerCase().includes(q) || b.slug.toLowerCase().includes(q));
  }, [brands, brandSearch, config]);

  const handleAddBrandToBar = (brand: BrandItem) => {
    const currentBrands: any[] = config?.brandsBar?.selectedBrands || [];
    if (currentBrands.some((b) => b.slug === brand.slug)) return;
    const newBrandItem = {
      name: brand.name,
      slug: brand.slug,
      tag: brand.description || 'Original Accessories',
      logo: brand.logo || '',
    };
    const updated = {
      ...config,
      brandsBar: {
        ...config.brandsBar,
        selectedBrands: [...currentBrands, newBrandItem],
      },
    };
    setConfig(updated);
    saveConfigImmediately(updated, `Brand "${brand.name}" added to logo bar.`);
  };

  const handleRemoveBrandFromBar = (index: number) => {
    const brandsList = [...(config?.brandsBar?.selectedBrands || [])];
    const removed = brandsList.splice(index, 1);
    const updated = {
      ...config,
      brandsBar: {
        ...config.brandsBar,
        selectedBrands: brandsList,
      },
    };
    setConfig(updated);
    saveConfigImmediately(updated, `Brand "${removed[0]?.name || ''}" removed.`);
  };

  const handleMoveBrandOrder = (index: number, direction: 'up' | 'down') => {
    const brandsList = [...(config?.brandsBar?.selectedBrands || [])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= brandsList.length) return;
    const temp = brandsList[index];
    brandsList[index] = brandsList[targetIndex];
    brandsList[targetIndex] = temp;
    const updated = {
      ...config,
      brandsBar: {
        ...config.brandsBar,
        selectedBrands: brandsList,
      },
    };
    setConfig(updated);
  };

  const handleUpdateBrandTag = (index: number, tag: string) => {
    const brandsList = [...(config?.brandsBar?.selectedBrands || [])];
    if (!brandsList[index]) return;
    brandsList[index] = { ...brandsList[index], tag };
    setConfig((prev: any) => ({
      ...prev,
      brandsBar: {
        ...prev.brandsBar,
        selectedBrands: brandsList,
      },
    }));
  };

  const handleUpdateBrandLogo = (index: number, logo: string) => {
    const brandsList = [...(config?.brandsBar?.selectedBrands || [])];
    if (!brandsList[index]) return;
    brandsList[index] = { ...brandsList[index], logo };
    setConfig((prev: any) => ({
      ...prev,
      brandsBar: {
        ...prev.brandsBar,
        selectedBrands: brandsList,
      },
    }));
  };

  const currentBoxConfig = config?.hero?.[activeHeroBox] || {};

  return (
    <div className="content">
      {/* Top Header */}
      <div className="page-head d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div>
          <h1 className="d-flex align-items-center gap-2">
            <LayoutTemplate size={24} className="text-primary" />
            Homepage Customizer &amp; Visual Layout
          </h1>
          <p className="m-0 text-muted" style={{ fontSize: '13px' }}>
            Customize hero 3-box showcase, seasonal promo slider (11.11 / Black Friday), and Daily Super Deals.
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn-soft"
            onClick={handleResetDefaults}
            title="Reset to default layout"
            style={{ height: '38px', fontSize: '13px' }}
          >
            <RotateCcw size={15} /> Reset
          </button>
          <a
            href={getStorefrontUrl()}
            target="_blank"
            rel="noreferrer"
            className="btn btn-outline-primary d-inline-flex align-items-center gap-1.5"
            style={{ height: '38px', fontSize: '13px', borderRadius: '10px' }}
          >
            <ExternalLink size={15} /> Preview Storefront
          </a>
          <button
            type="button"
            onClick={() => handleSave()}
            disabled={saving}
            className="btn btn-dark d-inline-flex align-items-center gap-2"
            style={{ background: '#0f172a', borderColor: '#0f172a', height: '38px', borderRadius: '10px', fontSize: '13px', fontWeight: 600 }}
          >
            <Save size={16} />
            <span>{saving ? 'Publishing...' : 'Save & Publish Live'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs for Homepage Sections */}
      <div className="tabs mb-4 flex-wrap">
        <button
          type="button"
          className={activeSection === 'hero' ? 'on' : ''}
          onClick={() => setActiveSection('hero')}
        >
          <LayoutTemplate size={16} className="me-1.5" />
          Hero Section (3 Boxes)
        </button>
        <button
          type="button"
          className={activeSection === 'brands' ? 'on' : ''}
          onClick={() => setActiveSection('brands')}
        >
          <Award size={16} className="me-1.5 text-primary" />
          Brand Logos Bar
          {config?.brandsBar?.enabled !== false && (
            <span className="ms-2 badge bg-primary-subtle text-primary border border-primary-subtle" style={{ fontSize: '10px' }}>
              {config?.brandsBar?.selectedBrands?.length || 0} Brands
            </span>
          )}
        </button>
        <button
          type="button"
          className={activeSection === 'banners' ? 'on' : ''}
          onClick={() => setActiveSection('banners')}
        >
          <ImageIcon size={16} className="me-1.5" />
          Promo Banners Slider (11.11 / Sales)
          {config?.promoBanners?.enabled && (
            <span className="ms-2 badge bg-success-subtle text-success border border-success-subtle" style={{ fontSize: '10px' }}>Active</span>
          )}
        </button>
        <button
          type="button"
          className={activeSection === 'categories' ? 'on' : ''}
          onClick={() => setActiveSection('categories')}
        >
          <FolderTree size={16} className="me-1.5 text-info" />
          Shop by Categories
          {config?.shopByCategories?.enabled !== false && (
            <span className="ms-2 badge bg-info-subtle text-info border border-info-subtle" style={{ fontSize: '10px' }}>
              {config?.shopByCategories?.selectedCategorySlugs?.length || 0} Items
            </span>
          )}
        </button>
        <button
          type="button"
          className={activeSection === 'deals' ? 'on' : ''}
          onClick={() => setActiveSection('deals')}
        >
          <Flame size={16} className="me-1.5 text-danger" />
          Today&apos;s Super Deals
          {config?.superDeals?.enabled && (
            <span className="ms-2 badge bg-danger-subtle text-danger border border-danger-subtle" style={{ fontSize: '10px' }}>
              {config?.superDeals?.productIds?.length || 0} Deals
            </span>
          )}
        </button>
        <button
          type="button"
          className={activeSection === 'bento' ? 'on' : ''}
          onClick={() => setActiveSection('bento')}
        >
          <Grid size={16} className="me-1.5 text-warning" />
          Category Boxes (5 Bento)
          {config?.bentoGrid?.enabled !== false && (
            <span className="ms-2 badge bg-warning-subtle text-warning border border-warning-subtle" style={{ fontSize: '10px' }}>
              5 Boxes
            </span>
          )}
        </button>
      </div>

      {/* ────────────────────────────────────────────────────────────── */}
      {/* SECTION 1: HERO SECTION 3 BOXES                                */}
      {/* ────────────────────────────────────────────────────────────── */}
      {activeSection === 'hero' && (
        <div className="d-flex flex-column gap-4">
          {/* Visual Mini-Map Selector of the 3 Boxes */}
          <div className="card-x p-3">
            <label className="fw-bold mb-2 d-block" style={{ fontSize: '13px' }}>
              Select Box to Customize:
            </label>
            <div className="row g-2">
              <div className="col-12 col-md-8">
                <div
                  onClick={() => setActiveHeroBox('mainBox')}
                  className={`p-3 rounded-3 text-start transition cursor-pointer border ${
                    activeHeroBox === 'mainBox'
                      ? 'border-primary shadow-sm bg-primary-subtle'
                      : 'border-secondary-subtle bg-light hover-bg'
                  }`}
                  style={{ minHeight: '120px', cursor: 'pointer' }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="badge bg-primary text-white" style={{ fontSize: '11px' }}>
                      Main Big Hero Box (8 Cols)
                    </span>
                    {activeHeroBox === 'mainBox' && (
                      <span className="text-primary fw-bold" style={{ fontSize: '12px' }}>
                        Editing Now ✓
                      </span>
                    )}
                  </div>
                  <strong className="d-block text-truncate" style={{ fontSize: '14px' }}>
                    {config.hero.mainBox.title}
                  </strong>
                  <small className="text-muted line-clamp-1" style={{ fontSize: '12px' }}>
                    {config.hero.mainBox.description}
                  </small>
                </div>
              </div>

              <div className="col-12 col-md-4 d-flex flex-column gap-2">
                <div
                  onClick={() => setActiveHeroBox('sideBox1')}
                  className={`p-2.5 rounded-3 text-start transition cursor-pointer border ${
                    activeHeroBox === 'sideBox1'
                      ? 'border-primary shadow-sm bg-primary-subtle'
                      : 'border-secondary-subtle bg-light hover-bg'
                  }`}
                  style={{ flex: 1, cursor: 'pointer' }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-0.5">
                    <span className="badge bg-dark text-white" style={{ fontSize: '10px' }}>
                      Side Box 1 (Top)
                    </span>
                    {activeHeroBox === 'sideBox1' && (
                      <span className="text-primary fw-bold" style={{ fontSize: '11px' }}>
                        Editing ✓
                      </span>
                    )}
                  </div>
                  <strong className="d-block text-truncate" style={{ fontSize: '12px' }}>
                    {config.hero.sideBox1.title}
                  </strong>
                  <small className="text-muted" style={{ fontSize: '11px' }}>
                    {config.hero.sideBox1.priceText}
                  </small>
                </div>

                <div
                  onClick={() => setActiveHeroBox('sideBox2')}
                  className={`p-2.5 rounded-3 text-start transition cursor-pointer border ${
                    activeHeroBox === 'sideBox2'
                      ? 'border-primary shadow-sm bg-primary-subtle'
                      : 'border-secondary-subtle bg-light hover-bg'
                  }`}
                  style={{ flex: 1, cursor: 'pointer' }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-0.5">
                    <span className="badge bg-dark text-white" style={{ fontSize: '10px' }}>
                      Side Box 2 (Bottom)
                    </span>
                    {activeHeroBox === 'sideBox2' && (
                      <span className="text-primary fw-bold" style={{ fontSize: '11px' }}>
                        Editing ✓
                      </span>
                    )}
                  </div>
                  <strong className="d-block text-truncate" style={{ fontSize: '12px' }}>
                    {config.hero.sideBox2.title}
                  </strong>
                  <small className="text-muted" style={{ fontSize: '11px' }}>
                    {config.hero.sideBox2.priceText}
                  </small>
                </div>
              </div>
            </div>
          </div>

          {/* 2-Column Layout: Left Configuration Form & Right Live Storefront Preview */}
          <div className="row g-4">
            {/* Left: Configuration Form for Active Box */}
            <div className="col-12 col-xl-7 d-flex flex-column gap-3">
              <div className="card-x p-4">
                <div className="d-flex align-items-center justify-content-between pb-3 mb-3 border-bottom" style={{ borderColor: 'var(--border)' }}>
                  <div>
                    <h5 className="m-0 fw-bold">
                      Editing:{' '}
                      <span className="text-primary">
                        {activeHeroBox === 'mainBox'
                          ? 'Main Hero Card (Left Big Banner)'
                          : activeHeroBox === 'sideBox1'
                          ? 'Side Card 1 (Top Right)'
                          : 'Side Card 2 (Bottom Right)'}
                      </span>
                    </h5>
                    <small className="text-muted">
                      Choose what entity to showcase or type custom marketing copy.
                    </small>
                  </div>
                </div>

            {/* 1. Target Type Selector (Product | Category | Brand | Custom) */}
            <div className="mb-4">
              <label className="form-label fw-bold mb-2" style={{ fontSize: '13px' }}>
                Showcase Type:
              </label>
              <div className="d-flex flex-wrap gap-2">
                {[
                  { id: 'product', label: 'Feature a Product', icon: Package },
                  { id: 'category', label: 'Feature a Category', icon: Layers },
                  { id: 'brand', label: 'Feature a Brand', icon: Tags },
                  { id: 'custom', label: 'Fully Custom Copy', icon: Sliders },
                  { id: 'banner', label: 'Banner Image Only', icon: ImageIcon },
                ].map((typeItem) => {
                  const Icon = typeItem.icon;
                  const isSelected = currentBoxConfig.type === typeItem.id;
                  return (
                    <button
                      key={typeItem.id}
                      type="button"
                      onClick={() => handleHeroTypeChange(activeHeroBox, typeItem.id as any)}
                      className={`btn d-flex align-items-center gap-1.5 ${
                        isSelected ? 'btn-dark' : 'btn-light border'
                      }`}
                      style={{
                        borderRadius: '10px',
                        fontSize: '13px',
                        background: isSelected ? '#0f172a' : undefined,
                        color: isSelected ? '#fff' : undefined,
                      }}
                    >
                      <Icon size={15} />
                      <span>{typeItem.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Entity Selectors */}
            {currentBoxConfig.type === 'product' && (
              <div className="p-3 mb-4 rounded-3 border bg-light" style={{ borderColor: 'var(--border)' }}>
                <label className="form-label fw-semibold mb-1" style={{ fontSize: '13px' }}>
                  Select Product from Catalog:
                </label>
                <select
                  className="form-select"
                  style={{ borderRadius: '10px', fontSize: '13px' }}
                  value={currentBoxConfig.selectedId || ''}
                  onChange={(e) => handleSelectProductForHero(activeHeroBox, e.target.value)}
                >
                  <option value="">— Choose a Product (407+ Available) —</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Rs. {p.salePrice.toLocaleString()})
                    </option>
                  ))}
                </select>
                <small className="text-muted d-block mt-1" style={{ fontSize: '11px' }}>
                  Selecting a product automatically fills Title, Image, Price &amp; Storefront Link.
                </small>
              </div>
            )}

            {currentBoxConfig.type === 'category' && (
              <div className="p-3 mb-4 rounded-3 border bg-light" style={{ borderColor: 'var(--border)' }}>
                <label className="form-label fw-semibold mb-1" style={{ fontSize: '13px' }}>
                  Select Category:
                </label>
                <select
                  className="form-select mb-3"
                  style={{ borderRadius: '10px', fontSize: '13px' }}
                  value={currentBoxConfig.selectedId || ''}
                  onChange={(e) => handleSelectCategoryForHero(activeHeroBox, e.target.value)}
                >
                  <option value="">— Choose a Category —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.slug || c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>

                {/* Sub-selector: products from this category to inherit image */}
                {categoryProductsForActiveBox.length > 0 && (
                  <div>
                    <label className="form-label fw-semibold mb-1" style={{ fontSize: '12px' }}>
                      Pick Image from Category Products:
                    </label>
                    <select
                      className="form-select"
                      style={{ borderRadius: '10px', fontSize: '12px' }}
                      onChange={(e) => {
                        const prod = products.find((p) => String(p.id) === e.target.value);
                        if (prod?.image) {
                          setConfig((prev: any) => ({
                            ...prev,
                            hero: {
                              ...prev.hero,
                              [activeHeroBox]: {
                                ...prev.hero[activeHeroBox],
                                image: prod.image,
                              },
                            },
                          }));
                        }
                      }}
                    >
                      <option value="">— Select product to use its image —</option>
                      {categoryProductsForActiveBox.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            {currentBoxConfig.type === 'brand' && (
              <div className="p-3 mb-4 rounded-3 border bg-light" style={{ borderColor: 'var(--border)' }}>
                <label className="form-label fw-semibold mb-1" style={{ fontSize: '13px' }}>
                  Select Brand:
                </label>
                <select
                  className="form-select mb-3"
                  style={{ borderRadius: '10px', fontSize: '13px' }}
                  value={currentBoxConfig.selectedId || ''}
                  onChange={(e) => handleSelectBrandForHero(activeHeroBox, e.target.value)}
                >
                  <option value="">— Choose Brand (Anker / Remax / Baseus / etc.) —</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.slug || b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Content Fields */}
            {currentBoxConfig.type === 'banner' ? (
              <div className="d-flex flex-column gap-3">
                {/* Size recommendation alert */}
                <div
                  className="alert alert-info py-2.5 px-3 d-flex align-items-center gap-2 m-0"
                  style={{ fontSize: '12px', borderRadius: '10px' }}
                >
                  <Info size={16} className="text-info flex-shrink-0" />
                  <div>
                    <strong>Recommended Banner Image Dimensions: </strong>
                    {activeHeroBox === 'mainBox'
                      ? '1200 x 500 px (or 800 x 440 px) — Full width hero graphic'
                      : '600 x 300 px (or 400 x 200 px) — Side card banner graphic'}
                    <span className="d-block text-muted mt-0.5" style={{ fontSize: '11px' }}>
                      Clean image with no auto text overlays. Image will automatically scale to fit the box cleanly.
                    </span>
                  </div>
                </div>

                {/* Banner Image Input & VPS Uploader */}
                <div>
                  <label className="form-label fw-bold mb-1" style={{ fontSize: '13px' }}>
                    Banner Image (Direct Upload / VPS Media Storage):
                  </label>
                  <div className="d-flex gap-2">
                    <input
                      type="text"
                      className="form-control"
                      style={{ borderRadius: '10px', fontSize: '13px' }}
                      placeholder="e.g. /media/home-customizer/my-banner.jpg or https://..."
                      value={currentBoxConfig.image || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setConfig((prev: any) => ({
                          ...prev,
                          hero: {
                            ...prev.hero,
                            [activeHeroBox]: { ...prev.hero[activeHeroBox], image: val },
                          },
                        }));
                      }}
                    />
                    <label
                      className="btn btn-primary d-flex align-items-center gap-1.5 flex-shrink-0 shadow-sm"
                      style={{ borderRadius: '10px', fontSize: '13px', cursor: 'pointer' }}
                    >
                      <Upload size={14} />
                      <span>Upload Banner</span>
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const fd = new FormData();
                          fd.append('file', file);
                          fd.append('folder', 'home-customizer');
                          try {
                            const res = await fetch(`${getStorefrontUrl()}/api/upload`, {
                              method: 'POST',
                              body: fd,
                            });
                            const data = await res.json();
                            if (data.success && data.url) {
                              setConfig((prev: any) => ({
                                ...prev,
                                hero: {
                                  ...prev.hero,
                                  [activeHeroBox]: { ...prev.hero[activeHeroBox], image: data.url },
                                },
                              }));
                              showNotification('Banner image uploaded to VPS media successfully!');
                            } else {
                              showNotification(data.error || 'Upload failed');
                            }
                          } catch (err: any) {
                            showNotification('Upload error: ' + err.message);
                          }
                          e.target.value = '';
                        }}
                      />
                    </label>
                  </div>
                  {currentBoxConfig.image && (
                    <div className="mt-2 p-2 border rounded-3 bg-light d-flex align-items-center gap-3">
                      <div
                        style={{
                          width: '70px',
                          height: '45px',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          background: '#0f172a',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <img
                          src={resolveImageUrl(currentBoxConfig.image)}
                          alt="Banner preview"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                      <div className="flex-grow-1 overflow-hidden">
                        <small className="d-block text-truncate fw-semibold text-body" style={{ fontSize: '11px' }}>
                          {currentBoxConfig.image}
                        </small>
                        <small className="text-success fw-bold" style={{ fontSize: '10px' }}>
                          ✓ Image Active
                        </small>
                      </div>
                    </div>
                  )}
                </div>

                {/* Banner Click Link */}
                <div>
                  <label className="form-label fw-semibold mb-1" style={{ fontSize: '13px' }}>
                    Banner Target Link (Optional — Whole banner click destination):
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    style={{ borderRadius: '10px', fontSize: '13px' }}
                    placeholder="/shop or /category/... or /product/..."
                    value={currentBoxConfig.link || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setConfig((prev: any) => ({
                        ...prev,
                        hero: {
                          ...prev.hero,
                          [activeHeroBox]: { ...prev.hero[activeHeroBox], link: val },
                        },
                      }));
                    }}
                  />
                  <small className="text-muted" style={{ fontSize: '11px' }}>
                    If no button is used, clicking anywhere on the banner will navigate to this link.
                  </small>
                </div>

                {/* Overlay Button Settings */}
                <div className="p-3 border rounded-3 bg-light" style={{ borderColor: 'var(--border)' }}>
                  <div className="form-check form-switch mb-3">
                    <input
                      className="form-check-input cursor-pointer"
                      type="checkbox"
                      id="heroBannerBtnSwitch"
                      checked={Boolean(currentBoxConfig.buttonText)}
                      onChange={(e) => {
                        const enabled = e.target.checked;
                        setConfig((prev: any) => ({
                          ...prev,
                          hero: {
                            ...prev.hero,
                            [activeHeroBox]: {
                              ...prev.hero[activeHeroBox],
                              buttonText: enabled ? 'SHOP NOW' : '',
                              buttonPosition: prev.hero[activeHeroBox].buttonPosition || 'bottom-left',
                            },
                          },
                        }));
                      }}
                    />
                    <label className="form-check-label fw-bold cursor-pointer" htmlFor="heroBannerBtnSwitch" style={{ fontSize: '13px' }}>
                      Add Clickable Call-to-Action Button on Banner
                    </label>
                  </div>

                  {Boolean(currentBoxConfig.buttonText) && (
                    <div className="row g-3">
                      <div className="col-12 col-md-6">
                        <label className="form-label fw-semibold mb-1" style={{ fontSize: '12px' }}>
                          Button Name / Text:
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          style={{ borderRadius: '8px', fontSize: '13px' }}
                          placeholder="e.g. SHOP NOW, BUY NOW"
                          value={currentBoxConfig.buttonText || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setConfig((prev: any) => ({
                              ...prev,
                              hero: {
                                ...prev.hero,
                                [activeHeroBox]: { ...prev.hero[activeHeroBox], buttonText: val },
                              },
                            }));
                          }}
                        />
                      </div>

                      <div className="col-12 col-md-6">
                        <label className="form-label fw-semibold mb-1" style={{ fontSize: '12px' }}>
                          Button Destination Link:
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          style={{ borderRadius: '8px', fontSize: '13px' }}
                          placeholder="e.g. /shop or /category/..."
                          value={currentBoxConfig.buttonLink || currentBoxConfig.link || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setConfig((prev: any) => ({
                              ...prev,
                              hero: {
                                ...prev.hero,
                                [activeHeroBox]: { ...prev.hero[activeHeroBox], buttonLink: val },
                              },
                            }));
                          }}
                        />
                      </div>

                      {/* 9 Positions Interactive Grid */}
                      <div className="col-12">
                        <label className="form-label fw-bold mb-1.5 d-block" style={{ fontSize: '12px' }}>
                          Button Position on Banner (Select 1 of 9 Positions):
                        </label>
                        <div
                          className="d-grid gap-1.5 p-2 bg-white rounded-3 border"
                          style={{ gridTemplateColumns: 'repeat(3, 1fr)', maxWidth: '360px' }}
                        >
                          {[
                            { id: 'top-left', label: 'Top Left' },
                            { id: 'top-center', label: 'Top Center' },
                            { id: 'top-right', label: 'Top Right' },
                            { id: 'middle-left', label: 'Middle Left' },
                            { id: 'middle-center', label: 'Middle Center' },
                            { id: 'middle-right', label: 'Middle Right' },
                            { id: 'bottom-left', label: 'Bottom Left' },
                            { id: 'bottom-center', label: 'Bottom Center' },
                            { id: 'bottom-right', label: 'Bottom Right' },
                          ].map((pos) => {
                            const isSelected = (currentBoxConfig.buttonPosition || 'bottom-left') === pos.id;
                            return (
                              <button
                                key={pos.id}
                                type="button"
                                onClick={() => {
                                  setConfig((prev: any) => ({
                                    ...prev,
                                    hero: {
                                      ...prev.hero,
                                      [activeHeroBox]: { ...prev.hero[activeHeroBox], buttonPosition: pos.id },
                                    },
                                  }));
                                }}
                                className={`btn btn-sm py-1.5 px-1 d-flex align-items-center justify-content-center text-center ${
                                  isSelected ? 'btn-primary' : 'btn-outline-secondary'
                                }`}
                                style={{ fontSize: '11px', borderRadius: '6px', fontWeight: isSelected ? 700 : 500 }}
                              >
                                {isSelected ? `✓ ${pos.label}` : pos.label}
                              </button>
                            );
                          })}
                        </div>
                        <small className="text-muted d-block mt-1" style={{ fontSize: '11px' }}>
                          Current position: <strong>{currentBoxConfig.buttonPosition || 'bottom-left'}</strong>
                        </small>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="row g-3">
              {/* Badge Text */}
              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold mb-1" style={{ fontSize: '13px' }}>
                  Top Badge / Label Text
                </label>
                <input
                  type="text"
                  className="form-control"
                  style={{ borderRadius: '10px', fontSize: '13px' }}
                  value={currentBoxConfig.badge || ''}
                  placeholder="e.g. BEST SELLER or DWSTORE ORIGINAL"
                  onChange={(e) => {
                    const val = e.target.value;
                    setConfig((prev: any) => ({
                      ...prev,
                      hero: {
                        ...prev.hero,
                        [activeHeroBox]: { ...prev.hero[activeHeroBox], badge: val },
                      },
                    }));
                  }}
                />
              </div>

              {/* Price Text (for Side Boxes) */}
              {activeHeroBox !== 'mainBox' && (
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold mb-1" style={{ fontSize: '13px' }}>
                    Display Price (Rs.)
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    style={{ borderRadius: '10px', fontSize: '13px' }}
                    value={currentBoxConfig.priceText || ''}
                    placeholder="e.g. Rs. 1,990"
                    onChange={(e) => {
                      const val = e.target.value;
                      setConfig((prev: any) => ({
                        ...prev,
                        hero: {
                          ...prev.hero,
                          [activeHeroBox]: { ...prev.hero[activeHeroBox], priceText: val },
                        },
                      }));
                    }}
                  />
                </div>
              )}

              {/* Title */}
              <div className="col-12">
                <label className="form-label fw-semibold mb-1" style={{ fontSize: '13px' }}>
                  Headline / Title
                </label>
                <input
                  type="text"
                  className="form-control"
                  style={{ borderRadius: '10px', fontSize: '13px' }}
                  value={currentBoxConfig.title || ''}
                  placeholder="Main Headline"
                  onChange={(e) => {
                    const val = e.target.value;
                    setConfig((prev: any) => ({
                      ...prev,
                      hero: {
                        ...prev.hero,
                        [activeHeroBox]: { ...prev.hero[activeHeroBox], title: val },
                      },
                    }));
                  }}
                />
              </div>

              {/* Description / Subtitle */}
              <div className="col-12">
                <label className="form-label fw-semibold mb-1" style={{ fontSize: '13px' }}>
                  {activeHeroBox === 'mainBox' ? 'Description Paragraph' : 'Short Subtitle'}
                </label>
                {activeHeroBox === 'mainBox' ? (
                  <textarea
                    rows={2}
                    className="form-control"
                    style={{ borderRadius: '10px', fontSize: '13px' }}
                    value={currentBoxConfig.description || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setConfig((prev: any) => ({
                        ...prev,
                        hero: {
                          ...prev.hero,
                          mainBox: { ...prev.hero.mainBox, description: val },
                        },
                      }));
                    }}
                  />
                ) : (
                  <input
                    type="text"
                    className="form-control"
                    style={{ borderRadius: '10px', fontSize: '13px' }}
                    value={currentBoxConfig.subtitle || ''}
                    placeholder="e.g. Large HD Display • Bluetooth Call"
                    onChange={(e) => {
                      const val = e.target.value;
                      setConfig((prev: any) => ({
                        ...prev,
                        hero: {
                          ...prev.hero,
                          [activeHeroBox]: { ...prev.hero[activeHeroBox], subtitle: val },
                        },
                      }));
                    }}
                  />
                )}
              </div>

              {/* Main Box Buttons */}
              {activeHeroBox === 'mainBox' ? (
                <>
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold mb-1" style={{ fontSize: '13px' }}>
                      Primary Button 1 Label
                    </label>
                    <input
                      type="text"
                      className="form-control mb-2"
                      style={{ borderRadius: '10px', fontSize: '13px' }}
                      value={currentBoxConfig.button1Text || ''}
                      placeholder="e.g. SHOP ALL PRODUCTS"
                      onChange={(e) => {
                        const val = e.target.value;
                        setConfig((prev: any) => ({
                          ...prev,
                          hero: {
                            ...prev.hero,
                            mainBox: { ...prev.hero.mainBox, button1Text: val },
                          },
                        }));
                      }}
                    />
                    <label className="form-label fw-semibold mb-1 text-muted" style={{ fontSize: '11px' }}>
                      Button 1 Target URL Link
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      style={{ borderRadius: '10px', fontSize: '12px' }}
                      value={currentBoxConfig.button1Link || ''}
                      placeholder="/shop"
                      onChange={(e) => {
                        const val = e.target.value;
                        setConfig((prev: any) => ({
                          ...prev,
                          hero: {
                            ...prev.hero,
                            mainBox: { ...prev.hero.mainBox, button1Link: val },
                          },
                        }));
                      }}
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold mb-1" style={{ fontSize: '13px' }}>
                      Secondary Button 2 Label
                    </label>
                    <input
                      type="text"
                      className="form-control mb-2"
                      style={{ borderRadius: '10px', fontSize: '13px' }}
                      value={currentBoxConfig.button2Text || ''}
                      placeholder="e.g. EXPLORE DEALS"
                      onChange={(e) => {
                        const val = e.target.value;
                        setConfig((prev: any) => ({
                          ...prev,
                          hero: {
                            ...prev.hero,
                            mainBox: { ...prev.hero.mainBox, button2Text: val },
                          },
                        }));
                      }}
                    />
                    <label className="form-label fw-semibold mb-1 text-muted" style={{ fontSize: '11px' }}>
                      Button 2 Target URL Link
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      style={{ borderRadius: '10px', fontSize: '12px' }}
                      value={currentBoxConfig.button2Link || ''}
                      placeholder="/shop"
                      onChange={(e) => {
                        const val = e.target.value;
                        setConfig((prev: any) => ({
                          ...prev,
                          hero: {
                            ...prev.hero,
                            mainBox: { ...prev.hero.mainBox, button2Link: val },
                          },
                        }));
                      }}
                    />
                  </div>
                </>
              ) : (
                /* Side Boxes Single Button & Link */
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold mb-1" style={{ fontSize: '13px' }}>
                    Button Label
                  </label>
                  <input
                    type="text"
                    className="form-control mb-2"
                    style={{ borderRadius: '10px', fontSize: '13px' }}
                    value={currentBoxConfig.buttonText || ''}
                    placeholder="e.g. Order now"
                    onChange={(e) => {
                      const val = e.target.value;
                      setConfig((prev: any) => ({
                        ...prev,
                        hero: {
                          ...prev.hero,
                          [activeHeroBox]: { ...prev.hero[activeHeroBox], buttonText: val },
                        },
                      }));
                    }}
                  />
                  <label className="form-label fw-semibold mb-1 text-muted" style={{ fontSize: '11px' }}>
                    Target Link URL
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    style={{ borderRadius: '10px', fontSize: '12px' }}
                    value={currentBoxConfig.link || ''}
                    placeholder="/product/..."
                    onChange={(e) => {
                      const val = e.target.value;
                      setConfig((prev: any) => ({
                        ...prev,
                        hero: {
                          ...prev.hero,
                          [activeHeroBox]: { ...prev.hero[activeHeroBox], link: val },
                        },
                      }));
                    }}
                  />
                </div>
              )}

              {/* Image URL & Live Preview */}
              <div className="col-12 col-md-6">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="form-label fw-semibold mb-0" style={{ fontSize: '13px' }}>
                    Main Showcase Image
                  </label>
                  <label
                    className="btn btn-link p-0 text-decoration-none fw-semibold"
                    style={{ fontSize: '11px', color: 'var(--primary, #2563eb)', cursor: 'pointer' }}
                  >
                    <Upload size={11} className="me-1 inline" /> Upload from PC
                    <input
                      type="file"
                      accept="image/*"
                      className="d-none"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const url = await uploadBannerFile(file);
                        if (url) {
                          setConfig((prev: any) => ({
                            ...prev,
                            hero: {
                              ...prev.hero,
                              [activeHeroBox]: { ...prev.hero[activeHeroBox], image: url },
                            },
                          }));
                          showNotification('Hero box image uploaded successfully!');
                        }
                        e.target.value = '';
                      }}
                    />
                  </label>
                </div>
                <div className="d-flex gap-2 align-items-center">
                  <input
                    type="text"
                    className="form-control"
                    style={{ borderRadius: '10px', fontSize: '12px' }}
                    value={currentBoxConfig.image || ''}
                    placeholder="/media/home-customizer/... or https://..."
                    onChange={(e) => {
                      const val = e.target.value;
                      setConfig((prev: any) => ({
                        ...prev,
                        hero: {
                          ...prev.hero,
                          [activeHeroBox]: { ...prev.hero[activeHeroBox], image: val },
                        },
                      }));
                    }}
                  />
                  {currentBoxConfig.image && (
                    <div
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        border: '1px solid var(--border)',
                        background: '#fff',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <img
                        src={resolveImageUrl(currentBoxConfig.image)}
                        alt="Preview"
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Secondary floating image for Main Box */}
              {activeHeroBox === 'mainBox' && (
                <div className="col-12 col-md-6">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label className="form-label fw-semibold mb-0" style={{ fontSize: '13px' }}>
                      Secondary Floating Badge Image (Optional)
                    </label>
                    <label
                      className="btn btn-link p-0 text-decoration-none fw-semibold"
                      style={{ fontSize: '11px', color: 'var(--primary, #2563eb)', cursor: 'pointer' }}
                    >
                      <Upload size={11} className="me-1 inline" /> Upload from PC
                      <input
                        type="file"
                        accept="image/*"
                        className="d-none"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const url = await uploadBannerFile(file);
                          if (url) {
                            setConfig((prev: any) => ({
                              ...prev,
                              hero: {
                                ...prev.hero,
                                mainBox: { ...prev.hero.mainBox, secondaryImage: url },
                              },
                            }));
                            showNotification('Secondary hero badge image uploaded successfully!');
                          }
                          e.target.value = '';
                        }}
                      />
                    </label>
                  </div>
                  <div className="d-flex gap-2 align-items-center">
                    <input
                      type="text"
                      className="form-control"
                      style={{ borderRadius: '10px', fontSize: '12px' }}
                      value={currentBoxConfig.secondaryImage || ''}
                      placeholder="/media/home-customizer/... or https://..."
                      onChange={(e) => {
                        const val = e.target.value;
                        setConfig((prev: any) => ({
                          ...prev,
                          hero: {
                            ...prev.hero,
                            mainBox: { ...prev.hero.mainBox, secondaryImage: val },
                          },
                        }));
                      }}
                    />
                    {currentBoxConfig.secondaryImage && (
                      <div
                        style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          border: '1px solid var(--border)',
                          background: '#fff',
                          flexShrink: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <img
                          src={resolveImageUrl(currentBoxConfig.secondaryImage)}
                          alt="Preview"
                          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            )}
          </div>
        </div>

        {/* Right: Live Card Preview (Storefront Style) */}
        <div className="col-12 col-xl-5">
          <div className="card-x p-3 sticky-top" style={{ top: '80px' }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="fw-bold text-muted" style={{ fontSize: '12px' }}>
                Live Card Preview (Storefront Style):
              </span>
              <span
                className={`badge ${
                  activeHeroBox === 'mainBox'
                    ? 'bg-primary'
                    : 'bg-dark'
                } text-white`}
                style={{ fontSize: '10px' }}
              >
                {activeHeroBox === 'mainBox'
                  ? 'Main Hero Box (8 Cols)'
                  : activeHeroBox === 'sideBox1'
                  ? 'Side Box 1 (Top)'
                  : 'Side Box 2 (Bottom)'}
              </span>
            </div>

            {/* 1. Main Hero Card Preview */}
            {activeHeroBox === 'mainBox' && (
              currentBoxConfig.type === 'banner' ? (
                <div
                  className="rounded-4 position-relative overflow-hidden shadow-sm border d-flex align-items-center justify-content-center"
                  style={{
                    minHeight: '380px',
                    background: '#0f172a',
                    borderColor: '#334155',
                  }}
                >
                  {currentBoxConfig.image ? (
                    <img
                      src={resolveImageUrl(currentBoxConfig.image)}
                      alt="Main Banner Preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
                    />
                  ) : (
                    <div className="text-center p-4 text-white">
                      <ImageIcon size={36} className="text-muted mb-2" />
                      <h6 className="m-0 fw-bold">No Banner Image Uploaded</h6>
                      <small className="text-muted">Recommended: 1200 x 500 px (or 800 x 440 px)</small>
                    </div>
                  )}

                  {/* Overlay Button at chosen position */}
                  {Boolean(currentBoxConfig.buttonText) && (
                    <div
                      className="position-absolute"
                      style={{
                        zIndex: 10,
                        ...getAdminPositionStyle(currentBoxConfig.buttonPosition),
                      }}
                    >
                      <span
                        className="btn btn-primary btn-sm fw-bold shadow-md d-inline-flex align-items-center gap-1.5"
                        style={{ fontSize: '12px', borderRadius: '8px', padding: '8px 16px' }}
                      >
                        <span>{currentBoxConfig.buttonText}</span>
                        <ArrowRight size={13} />
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  className="rounded-4 p-4 text-slate-900 position-relative overflow-hidden d-flex flex-column justify-content-between shadow-sm border"
                  style={{
                    minHeight: '380px',
                    background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 40%, #dbeafe 100%)',
                    borderColor: '#c7d2fe',
                  }}
                >
                  {/* Subtle dot overlay */}
                  <div
                    className="position-absolute"
                    style={{
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)',
                      backgroundSize: '18px 18px',
                      opacity: 0.15,
                      pointerEvents: 'none',
                    }}
                  />

                  <div className="position-relative" style={{ zIndex: 2 }}>
                    {/* Top Badge */}
                    <div
                      className="d-inline-flex align-items-center gap-1.5 px-2.5 py-1 rounded-pill mb-3 shadow-xs"
                      style={{
                        background: 'rgba(255, 255, 255, 0.85)',
                        border: '1px solid #bfdbfe',
                        color: '#1d4ed8',
                        fontSize: '10px',
                        fontWeight: 700,
                      }}
                    >
                      <Sparkles size={12} className="text-primary flex-shrink-0" />
                      <span>{currentBoxConfig.badge || "DWSTORE • SRI LANKA'S TRUSTED TECH STORE"}</span>
                    </div>

                    {/* Main Title */}
                    <h3
                      className="fw-black text-uppercase m-0 tracking-tight"
                      style={{
                        fontSize: '20px',
                        lineHeight: 1.15,
                        color: '#0f172a',
                        fontWeight: 900,
                      }}
                    >
                      {currentBoxConfig.title || 'PREMIUM TECH, SMARTWATCHES & ACCESSORIES'}
                    </h3>

                    {/* Description */}
                    <p
                      className="mt-2 text-muted fw-medium"
                      style={{ fontSize: '12px', lineHeight: 1.45, maxWidth: '260px', color: '#475569' }}
                    >
                      {currentBoxConfig.description || 'Direct importer warranties, 100% genuine products & island-wide express cash on delivery.'}
                    </p>

                    {/* Trust Badges */}
                    <div className="d-flex flex-wrap gap-2 mt-2" style={{ fontSize: '10px', fontWeight: 600, color: '#334155' }}>
                      <span className="d-inline-flex align-items-center gap-1">
                        <CheckCircle2 size={12} className="text-success" /> 100% Genuine
                      </span>
                      <span className="d-inline-flex align-items-center gap-1">
                        <ShieldCheck size={12} className="text-primary" /> Island-wide COD
                      </span>
                      <span className="d-inline-flex align-items-center gap-1">
                        <Zap size={12} className="text-warning" /> KOKO &amp; Payzy
                      </span>
                    </div>
                  </div>

                  {/* CTA Buttons */}
                  <div className="position-relative d-flex flex-wrap gap-2 mt-3" style={{ zIndex: 2 }}>
                    {currentBoxConfig.button1Text && (
                      <span
                        className="btn btn-primary btn-sm d-inline-flex align-items-center gap-1.5 fw-bold shadow-sm"
                        style={{ fontSize: '11px', borderRadius: '8px', padding: '6px 14px', background: '#2563eb', border: 'none' }}
                      >
                        <span>{currentBoxConfig.button1Text}</span>
                        <ArrowRight size={12} />
                      </span>
                    )}
                    {currentBoxConfig.button2Text && (
                      <span
                        className="btn btn-light btn-sm fw-bold border shadow-xs"
                        style={{ fontSize: '11px', borderRadius: '8px', padding: '6px 12px', background: '#ffffff', color: '#1e293b' }}
                      >
                        {currentBoxConfig.button2Text}
                      </span>
                    )}
                  </div>

                  {/* Image Showcase */}
                  <div
                    className="position-absolute"
                    style={{
                      right: '10px',
                      bottom: '10px',
                      width: '170px',
                      height: '170px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      pointerEvents: 'none',
                      zIndex: 1,
                    }}
                  >
                    {currentBoxConfig.image && (
                      <div
                        style={{
                          width: '135px',
                          height: '135px',
                          borderRadius: '16px',
                          background: 'rgba(255, 255, 255, 0.75)',
                          border: '1px solid #fff',
                          padding: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 10px 20px -5px rgba(0,0,0,0.15)',
                        }}
                      >
                        <img
                          src={resolveImageUrl(currentBoxConfig.image)}
                          alt={currentBoxConfig.title}
                          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                        />
                      </div>
                    )}

                    {/* Secondary floating chip */}
                    {currentBoxConfig.secondaryImage && (
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '0px',
                          left: '0px',
                          width: '56px',
                          height: '56px',
                          borderRadius: '12px',
                          background: '#ffffff',
                          border: '1px solid #e2e8f0',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 6px 12px -3px rgba(0,0,0,0.2)',
                        }}
                      >
                        <img
                          src={resolveImageUrl(currentBoxConfig.secondaryImage)}
                          alt="Secondary"
                          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )
            )}

            {/* 2. Side Box 1 Preview */}
            {activeHeroBox === 'sideBox1' && (
              currentBoxConfig.type === 'banner' ? (
                <div
                  className="rounded-4 position-relative overflow-hidden shadow-sm border d-flex align-items-center justify-content-center"
                  style={{
                    minHeight: '230px',
                    background: '#020617',
                    borderColor: '#1e293b',
                  }}
                >
                  {currentBoxConfig.image ? (
                    <img
                      src={resolveImageUrl(currentBoxConfig.image)}
                      alt="Side Banner 1 Preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
                    />
                  ) : (
                    <div className="text-center p-3 text-white">
                      <ImageIcon size={28} className="text-muted mb-1" />
                      <h6 className="m-0 fw-bold" style={{ fontSize: '13px' }}>No Banner Image</h6>
                      <small className="text-muted" style={{ fontSize: '11px' }}>Recommended: 600 x 300 px</small>
                    </div>
                  )}

                  {Boolean(currentBoxConfig.buttonText) && (
                    <div
                      className="position-absolute"
                      style={{
                        zIndex: 10,
                        ...getAdminPositionStyle(currentBoxConfig.buttonPosition),
                      }}
                    >
                      <span
                        className="btn btn-primary btn-sm fw-bold shadow-md d-inline-flex align-items-center gap-1"
                        style={{ fontSize: '11px', borderRadius: '6px', padding: '6px 12px' }}
                      >
                        <span>{currentBoxConfig.buttonText}</span>
                        <ArrowRight size={12} />
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  className="rounded-4 p-4 text-white position-relative overflow-hidden d-flex flex-column justify-content-between shadow-lg"
                  style={{
                    minHeight: '230px',
                    background: 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #1e1b4b 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <div className="position-relative" style={{ zIndex: 2 }}>
                    <span
                      className="text-uppercase fw-bold d-block mb-1 font-monospace"
                      style={{ fontSize: '10px', letterSpacing: '1px', color: '#60a5fa' }}
                    >
                      {currentBoxConfig.badge || 'BEST SELLER'}
                    </span>
                    <h3 className="fw-black text-white m-0" style={{ fontSize: '18px' }}>
                      {currentBoxConfig.title || 'Side Card 1 Title'}
                    </h3>
                    {currentBoxConfig.subtitle && (
                      <p className="mt-1 text-white-50 text-truncate" style={{ fontSize: '11px', maxWidth: '180px' }}>
                        {currentBoxConfig.subtitle}
                      </p>
                    )}
                    {currentBoxConfig.priceText && (
                      <p className="fw-bold mt-2 font-monospace" style={{ fontSize: '14px', color: '#fbbf24' }}>
                        {currentBoxConfig.priceText}
                      </p>
                    )}
                  </div>

                  <div className="position-relative d-flex align-items-center gap-1 fw-bold mt-3" style={{ zIndex: 2, fontSize: '12px', color: '#60a5fa' }}>
                    <span>{currentBoxConfig.buttonText || 'Order now'}</span>
                    <ArrowRight size={14} />
                  </div>

                  {currentBoxConfig.image && (
                    <div
                      className="position-absolute"
                      style={{
                        right: '12px',
                        bottom: '12px',
                        width: '130px',
                        height: '130px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        pointerEvents: 'none',
                        zIndex: 1,
                      }}
                    >
                      <img
                        src={resolveImageUrl(currentBoxConfig.image)}
                        alt={currentBoxConfig.title}
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', filter: 'drop-shadow(0 8px 14px rgba(0,0,0,0.5))' }}
                      />
                    </div>
                  )}
                </div>
              )
            )}

            {/* 3. Side Box 2 Preview */}
            {activeHeroBox === 'sideBox2' && (
              currentBoxConfig.type === 'banner' ? (
                <div
                  className="rounded-4 position-relative overflow-hidden shadow-sm border d-flex align-items-center justify-content-center"
                  style={{
                    minHeight: '230px',
                    background: '#0c1321',
                    borderColor: '#1e293b',
                  }}
                >
                  {currentBoxConfig.image ? (
                    <img
                      src={resolveImageUrl(currentBoxConfig.image)}
                      alt="Side Banner 2 Preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
                    />
                  ) : (
                    <div className="text-center p-3 text-white">
                      <ImageIcon size={28} className="text-muted mb-1" />
                      <h6 className="m-0 fw-bold" style={{ fontSize: '13px' }}>No Banner Image</h6>
                      <small className="text-muted" style={{ fontSize: '11px' }}>Recommended: 600 x 300 px</small>
                    </div>
                  )}

                  {Boolean(currentBoxConfig.buttonText) && (
                    <div
                      className="position-absolute"
                      style={{
                        zIndex: 10,
                        ...getAdminPositionStyle(currentBoxConfig.buttonPosition),
                      }}
                    >
                      <span
                        className="btn btn-primary btn-sm fw-bold shadow-md d-inline-flex align-items-center gap-1"
                        style={{ fontSize: '11px', borderRadius: '6px', padding: '6px 12px' }}
                      >
                        <span>{currentBoxConfig.buttonText}</span>
                        <ArrowRight size={12} />
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  className="rounded-4 p-4 text-white position-relative overflow-hidden d-flex flex-column justify-content-between shadow-lg"
                  style={{
                    minHeight: '230px',
                    background: 'linear-gradient(135deg, #0c1321 0%, #111827 50%, #0c1a2e 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <div className="position-relative" style={{ zIndex: 2 }}>
                    <span
                      className="text-uppercase fw-bold d-block mb-1 font-monospace"
                      style={{ fontSize: '10px', letterSpacing: '1px', color: '#22d3ee' }}
                    >
                      {currentBoxConfig.badge || 'HIGH CAPACITY'}
                    </span>
                    <h3 className="fw-black text-white m-0" style={{ fontSize: '18px' }}>
                      {currentBoxConfig.title || 'Side Card 2 Title'}
                    </h3>
                    {currentBoxConfig.subtitle && (
                      <p className="mt-1 text-white-50 text-truncate" style={{ fontSize: '11px', maxWidth: '180px' }}>
                        {currentBoxConfig.subtitle}
                      </p>
                    )}
                    {currentBoxConfig.priceText && (
                      <p className="fw-bold mt-2 font-monospace" style={{ fontSize: '14px', color: '#fbbf24' }}>
                        {currentBoxConfig.priceText}
                      </p>
                    )}
                  </div>

                  <div className="position-relative d-flex align-items-center gap-1 fw-bold mt-3" style={{ zIndex: 2, fontSize: '12px', color: '#22d3ee' }}>
                    <span>{currentBoxConfig.buttonText || 'Order now'}</span>
                    <ArrowRight size={14} />
                  </div>

                  {currentBoxConfig.image && (
                    <div
                      className="position-absolute"
                      style={{
                        right: '12px',
                        bottom: '12px',
                        width: '130px',
                        height: '130px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        pointerEvents: 'none',
                        zIndex: 1,
                      }}
                    >
                      <img
                        src={resolveImageUrl(currentBoxConfig.image)}
                        alt={currentBoxConfig.title}
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', filter: 'drop-shadow(0 8px 14px rgba(0,0,0,0.5))' }}
                      />
                    </div>
                  )}
                </div>
              )
            )}

            {/* Quick Switch to Other Boxes */}
            <div className="mt-3 pt-3 border-top">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-muted fw-bold" style={{ fontSize: '11px' }}>
                  Quick Switch Box Preview:
                </span>
              </div>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className={`btn btn-sm flex-grow-1 ${activeHeroBox === 'mainBox' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  style={{ fontSize: '11px', borderRadius: '6px' }}
                  onClick={() => setActiveHeroBox('mainBox')}
                >
                  Main Box
                </button>
                <button
                  type="button"
                  className={`btn btn-sm flex-grow-1 ${activeHeroBox === 'sideBox1' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  style={{ fontSize: '11px', borderRadius: '6px' }}
                  onClick={() => setActiveHeroBox('sideBox1')}
                >
                  Side Box 1
                </button>
                <button
                  type="button"
                  className={`btn btn-sm flex-grow-1 ${activeHeroBox === 'sideBox2' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  style={{ fontSize: '11px', borderRadius: '6px' }}
                  onClick={() => setActiveHeroBox('sideBox2')}
                >
                  Side Box 2
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )}

      {/* ────────────────────────────────────────────────────────────── */}
      {/* SECTION 2: PROMO BANNERS SLIDER                                */}
      {/* ────────────────────────────────────────────────────────────── */}
      {activeSection === 'banners' && (
        <div className="d-flex flex-column gap-4">
          {/* Master Enable Card */}
          <div className="card-x p-4 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
            <div>
              <h5 className="m-0 fw-bold d-flex align-items-center gap-2">
                <ImageIcon size={20} className="text-primary" />
                Promo Banners Slider (Below Brand Logos)
              </h5>
              <small className="text-muted">
                Display high-impact sliding promotional banners for 11.11 Mega Sale, Black Friday, and seasonal events.
              </small>
            </div>
            <div className="form-check form-switch m-0 d-flex align-items-center gap-2">
              <input
                className="form-check-input"
                type="checkbox"
                role="switch"
                style={{ width: '45px', height: '24px', cursor: 'pointer' }}
                checked={Boolean(config?.promoBanners?.enabled)}
                onChange={(e) => {
                  const checked = e.target.checked;
                  const updated = {
                    ...config,
                    promoBanners: { ...(config?.promoBanners || {}), enabled: checked },
                  };
                  setConfig(updated);
                  saveConfigImmediately(
                    updated,
                    checked ? 'Promo Banners section enabled live on Storefront!' : 'Promo Banners section disabled live on Storefront!'
                  );
                }}
              />
              <span className="fw-bold" style={{ fontSize: '13px' }}>
                {config?.promoBanners?.enabled ? (
                  <span className="text-success d-inline-flex align-items-center gap-1">
                    <span className="badge bg-success rounded-circle p-1"></span> Section Enabled
                  </span>
                ) : (
                  <span className="text-secondary d-inline-flex align-items-center gap-1">
                    <span className="badge bg-secondary rounded-circle p-1"></span> Section Disabled
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Dimension Guideline Alert */}
          <div
            className="p-3 rounded-3 d-flex align-items-start gap-2.5 border"
            style={{ background: '#eff6ff', borderColor: '#bfdbfe', color: '#1e3a8a' }}
          >
            <Info size={20} className="text-primary mt-0.5 flex-shrink-0" />
            <div style={{ fontSize: '13px' }}>
              <strong>Recommended Promo Banner Dimensions:</strong>
              <div className="mt-1">
                • <b>Desktop:</b> <code>1400 x 360 px</code> (Aspect ratio ~ 4:1 or 21:5).
                <br />
                • <b>Mobile:</b> Auto-scales responsively with touch swipe navigation.
                <br />
                • Use high-quality PNG or JPG files with bold text for special discounts like <i>11.11 Mega Sale</i>.
              </div>
            </div>
          </div>

          {/* Banner List */}
          <div className="card-x p-4">
            <div className="d-flex justify-content-between align-items-center pb-3 mb-3 border-bottom" style={{ borderColor: 'var(--border)' }}>
              <div>
                <h6 className="m-0 fw-bold">Active Promo Banners ({config?.promoBanners?.banners?.length || 0})</h6>
                <small className="text-muted">Banners will automatically cycle every 4.5 seconds on storefront.</small>
              </div>
              <button
                type="button"
                onClick={handleAddBanner}
                className="btn btn-outline-primary d-inline-flex align-items-center gap-1.5"
                style={{ fontSize: '13px', borderRadius: '10px' }}
              >
                <Plus size={16} /> Add Promo Banner
              </button>
            </div>

            <div className="d-flex flex-column gap-3">
              {(config?.promoBanners?.banners || []).map((banner: any, idx: number) => (
                <div
                  key={banner.id || idx}
                  className="p-3 rounded-3 border d-flex flex-column flex-md-row gap-3 align-items-md-center justify-content-between"
                  style={{ background: banner.active ? '#fff' : '#f8fafc', borderColor: 'var(--border)' }}
                >
                  {/* Banner Preview */}
                  <div
                    style={{
                      width: '180px',
                      height: '60px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      background: '#0f172a',
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={resolveImageUrl(banner.image)}
                      alt={banner.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400';
                      }}
                    />
                  </div>

                  {/* Form fields */}
                  <div className="flex-grow-1 d-flex flex-column flex-sm-row gap-2">
                    <div style={{ flex: 1 }}>
                      <small className="text-muted d-block fw-semibold" style={{ fontSize: '11px' }}>
                        Campaign Title
                      </small>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        style={{ borderRadius: '8px', fontSize: '12px' }}
                        value={banner.title || ''}
                        placeholder="11.11 Mega Sale - Up to 50% Off"
                        onChange={(e) => handleUpdateBanner(idx, 'title', e.target.value)}
                      />
                    </div>
                    <div style={{ flex: 1.2 }}>
                      <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted d-block fw-semibold" style={{ fontSize: '11px' }}>
                          Banner Image (1400x360 px)
                        </small>
                        <label
                          className="btn btn-link p-0 text-decoration-none fw-semibold"
                          style={{ fontSize: '11px', color: 'var(--primary, #2563eb)', cursor: 'pointer' }}
                        >
                          <Upload size={11} className="me-1 inline" /> Upload from PC
                          <input
                            type="file"
                            accept="image/*"
                            className="d-none"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const url = await uploadBannerFile(file);
                              if (url) {
                                handleUpdateBanner(idx, 'image', url);
                                showNotification('Banner uploaded to VPS media successfully!');
                              }
                              e.target.value = '';
                            }}
                          />
                        </label>
                      </div>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        style={{ borderRadius: '8px', fontSize: '12px' }}
                        value={banner.image || ''}
                        placeholder="/media/home-customizer/... or https://..."
                        onChange={(e) => handleUpdateBanner(idx, 'image', e.target.value)}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <small className="text-muted d-block fw-semibold" style={{ fontSize: '11px' }}>
                        Target Link
                      </small>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        style={{ borderRadius: '8px', fontSize: '12px' }}
                        value={banner.link || ''}
                        placeholder="/shop or /category/..."
                        onChange={(e) => handleUpdateBanner(idx, 'link', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="d-flex align-items-center gap-2 flex-shrink-0">
                    <div className="form-check form-switch m-0" title="Toggle active">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={banner.active !== false}
                        onChange={(e) => handleUpdateBanner(idx, 'active', e.target.checked)}
                        style={{ cursor: 'pointer' }}
                      />
                    </div>
                    <button
                      type="button"
                      className="icon-btn text-danger"
                      onClick={() => handleDeleteBanner(idx)}
                      title="Delete banner"
                      style={{ width: '32px', height: '32px' }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────── */}
      {/* SECTION 3: TODAY'S SUPER DEALS SLIDER                           */}
      {/* ────────────────────────────────────────────────────────────── */}
      {activeSection === 'deals' && (
        <div className="d-flex flex-column gap-4">
          {/* Master Enable Card */}
          <div className="card-x p-4 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
            <div>
              <h5 className="m-0 fw-bold d-flex align-items-center gap-2">
                <Flame size={20} className="text-danger" />
                Today&apos;s Super Deals Slider
              </h5>
              <small className="text-muted">
                Display curated discount deals in a horizontal slider between <b>Shop by Categories</b> and <b>Best Selling</b>.
              </small>
            </div>
            <div className="form-check form-switch m-0 d-flex align-items-center gap-2">
              <input
                className="form-check-input"
                type="checkbox"
                role="switch"
                style={{ width: '45px', height: '24px', cursor: 'pointer' }}
                checked={config?.superDeals?.enabled ?? true}
                onChange={(e) => {
                  const checked = e.target.checked;
                  const updated = {
                    ...config,
                    superDeals: { ...config?.superDeals, enabled: checked },
                  };
                  setConfig(updated);
                  saveConfigImmediately(
                    updated,
                    checked ? "Today's Super Deals section enabled live on Storefront!" : "Today's Super Deals section disabled live on Storefront!"
                  );
                }}
              />
              <span className="fw-bold" style={{ fontSize: '13px' }}>
                {config?.superDeals?.enabled ? 'Section Enabled' : 'Section Disabled'}
              </span>
            </div>
          </div>

          {/* Section Titles */}
          <div className="card-x p-4">
            <h6 className="fw-bold mb-3">Section Headers</h6>
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold mb-1" style={{ fontSize: '13px' }}>
                  Deal Section Title
                </label>
                <input
                  type="text"
                  className="form-control"
                  style={{ borderRadius: '10px', fontSize: '13px' }}
                  value={config?.superDeals?.title || ''}
                  placeholder="Today's Super Deals"
                  onChange={(e) => {
                    const val = e.target.value;
                    setConfig((prev: any) => ({
                      ...prev,
                      superDeals: { ...prev.superDeals, title: val },
                    }));
                  }}
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold mb-1" style={{ fontSize: '13px' }}>
                  Subtitle / Promo Tagline
                </label>
                <input
                  type="text"
                  className="form-control"
                  style={{ borderRadius: '10px', fontSize: '13px' }}
                  value={config?.superDeals?.subtitle || ''}
                  placeholder="Limited time mega discounts with express cash on delivery"
                  onChange={(e) => {
                    const val = e.target.value;
                    setConfig((prev: any) => ({
                      ...prev,
                      superDeals: { ...prev.superDeals, subtitle: val },
                    }));
                  }}
                />
              </div>
            </div>
          </div>

          {/* Selected Products in Super Deals */}
          <div className="card-x p-4">
            <div className="d-flex justify-content-between align-items-center pb-3 mb-3 border-bottom" style={{ borderColor: 'var(--border)' }}>
              <div>
                <h6 className="m-0 fw-bold">
                  Curated Deals Products ({config?.superDeals?.productIds?.length || 0})
                </h6>
                <small className="text-muted">
                  These items will slide horizontally with live countdown and &quot;Grab Super Deal&quot; buttons.
                </small>
              </div>
            </div>

            {/* Product Picker Search Bar */}
            <div className="mb-4">
              <label className="form-label fw-bold mb-1" style={{ fontSize: '13px' }}>
                Search &amp; Add Product to Super Deals:
              </label>
              <div className="search position-relative" style={{ maxWidth: '480px' }}>
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search products by title, brand, or SKU..."
                  value={dealSearch}
                  onChange={(e) => setDealSearch(e.target.value)}
                  style={{ borderRadius: '10px' }}
                />
              </div>

              {/* Instant Search Results Dropdown */}
              {filteredSearchProducts.length > 0 && (
                <div
                  className="card-x p-2 mt-2 shadow-lg position-relative"
                  style={{ maxWidth: '520px', maxHeight: '280px', overflowY: 'auto', zIndex: 10 }}
                >
                  {filteredSearchProducts.map((p) => {
                    const isOutOfStock = p.status === 'Out of stock' || (typeof p.stock === 'number' && p.stock <= 0);
                    return (
                      <div
                        key={p.id}
                        className={`d-flex align-items-center justify-content-between p-2 rounded-2 border-bottom transition ${
                          isOutOfStock ? 'bg-light' : 'hover-bg'
                        }`}
                        style={{
                          cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                          opacity: isOutOfStock ? 0.7 : 1,
                        }}
                        onClick={() => {
                          if (isOutOfStock) {
                            showNotification(`"${p.name}" is out of stock and cannot be added to Super Deals.`);
                            return;
                          }
                          handleAddProductToDeals(String(p.id));
                        }}
                      >
                        <div className="d-flex align-items-center gap-2" style={{ minWidth: 0 }}>
                          <img
                            src={resolveImageUrl(p.image) || '/dwstore_logo.png'}
                            alt={p.name}
                            style={{
                              width: '36px',
                              height: '36px',
                              objectFit: 'contain',
                              borderRadius: '6px',
                              border: '1px solid var(--border)',
                              background: '#fff',
                              flexShrink: 0,
                            }}
                          />
                          <div style={{ minWidth: 0 }}>
                            <div className="d-flex align-items-center gap-1.5 flex-wrap">
                              <span className="fw-semibold text-truncate" style={{ fontSize: '12px', maxWidth: '240px' }}>
                                {p.name}
                              </span>
                              {isOutOfStock ? (
                                <span className="badge bg-danger text-white flex-shrink-0" style={{ fontSize: '9px', padding: '2px 6px' }}>
                                  Out of Stock
                                </span>
                              ) : (
                                <span className="badge bg-success-subtle text-success flex-shrink-0" style={{ fontSize: '9px', padding: '2px 6px' }}>
                                  In Stock ({p.stock})
                                </span>
                              )}
                            </div>
                            <small className="text-muted d-block text-truncate" style={{ fontSize: '11px' }}>
                              Rs. {p.salePrice.toLocaleString()} ({p.brand || 'DWstore'})
                            </small>
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={isOutOfStock}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isOutOfStock) {
                              showNotification(`"${p.name}" is out of stock and cannot be added to Super Deals.`);
                              return;
                            }
                            handleAddProductToDeals(String(p.id));
                          }}
                          className={`btn btn-sm flex-shrink-0 ${
                            isOutOfStock ? 'btn-light border text-danger fw-semibold' : 'btn-primary'
                          }`}
                          style={{
                            fontSize: '11px',
                            borderRadius: '6px',
                            cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                          }}
                          title={isOutOfStock ? 'Product is out of stock' : 'Add to Super Deals'}
                        >
                          {isOutOfStock ? 'Out of Stock' : '+ Add'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Selected Deals Grid */}
            <div className="row g-3">
              {(config?.superDeals?.productIds || []).map((id: string) => {
                const prod = products.find((p) => String(p.id) === String(id));
                if (!prod) return null;
                const isOutOfStock = prod.status === 'Out of stock' || (typeof prod.stock === 'number' && prod.stock <= 0);

                return (
                  <div key={id} className="col-12 col-sm-6 col-md-4 col-xl-3">
                    <div
                      className="p-3 rounded-3 border d-flex flex-column justify-content-between h-100 position-relative group shadow-xs"
                      style={{
                        background: isOutOfStock ? '#fff5f5' : '#fff',
                        borderColor: isOutOfStock ? '#fca5a5' : 'var(--border)',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => handleRemoveProductFromDeals(id)}
                        className="icon-btn text-danger position-absolute top-2 right-2"
                        title="Remove from deals"
                        style={{
                          top: '8px',
                          right: '8px',
                          width: '28px',
                          height: '28px',
                          background: 'rgba(239, 68, 68, 0.1)',
                        }}
                      >
                        <Trash2 size={13} />
                      </button>

                      <div className="d-flex align-items-center gap-2 mb-2">
                        <div
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            background: '#f8fafc',
                            border: '1px solid var(--border)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <img
                            src={resolveImageUrl(prod.image) || '/dwstore_logo.png'}
                            alt={prod.name}
                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                          />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="d-flex align-items-center gap-1">
                            <span className="badge bg-danger-subtle text-danger" style={{ fontSize: '10px' }}>
                              Deal Item
                            </span>
                            {isOutOfStock && (
                              <span className="badge bg-danger text-white" style={{ fontSize: '9px', padding: '1px 5px' }}>
                                Out of Stock
                              </span>
                            )}
                          </div>
                          <strong className="d-block text-truncate mt-0.5" style={{ fontSize: '13px' }}>
                            {prod.name}
                          </strong>
                          <span className="text-danger fw-bold font-monospace" style={{ fontSize: '12px' }}>
                            Rs. {prod.salePrice.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {isOutOfStock && (
                        <div className="mt-2 pt-2 border-top border-danger-subtle text-danger fw-semibold" style={{ fontSize: '11px' }}>
                          ⚠️ Out of Stock - Not purchasable
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────── */}
      {/* SECTION 4: BRAND LOGOS BAR                                     */}
      {/* ────────────────────────────────────────────────────────────── */}
      {activeSection === 'brands' && (
        <div className="d-flex flex-column gap-4">
          {/* Header & Toggle */}
          <div className="card-x p-3 d-flex justify-content-between align-items-center">
            <div>
              <div className="d-flex align-items-center gap-2">
                <Award size={20} className="text-primary" />
                <h3 className="m-0" style={{ fontSize: '16px', fontWeight: 700 }}>
                  Brand Logos Slider (Storefront Homepage)
                </h3>
              </div>
              <p className="m-0 text-muted mt-1" style={{ fontSize: '13px' }}>
                Featured brand logos appear in the modern auto-sliding cards ticker below the hero section.
              </p>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className="text-muted" style={{ fontSize: '13px' }}>
                {config?.brandsBar?.enabled !== false ? 'Section Enabled' : 'Section Disabled'}
              </span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={config?.brandsBar?.enabled !== false}
                  onChange={(e) => {
                    const updated = {
                      ...config,
                      brandsBar: {
                        ...config.brandsBar,
                        enabled: e.target.checked,
                      },
                    };
                    setConfig(updated);
                    saveConfigImmediately(
                      updated,
                      e.target.checked ? 'Brand logos bar enabled!' : 'Brand logos bar hidden.'
                    );
                  }}
                />
                <span className="slider round"></span>
              </label>
            </div>
          </div>

          {/* Centralized Brand Management Notice */}
          <div
            className="p-3 rounded-3 border d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 shadow-2xs"
            style={{ background: '#f0fdf4', borderColor: '#bbf7d0' }}
          >
            <div className="d-flex align-items-center gap-2.5">
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: '#dcfce7',
                  color: '#16a34a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <CheckCircle2 size={18} />
              </div>
              <div>
                <b className="d-block text-success-emphasis" style={{ fontSize: '13px' }}>
                  Brand Logos are Centralized in the Brands Page
                </b>
                <small className="text-success-emphasis opacity-75" style={{ fontSize: '12px' }}>
                  To add new brands or upload / replace brand logos, please use the dedicated <b>Brands</b> page. Uploaded brand logos automatically sync to the homepage auto-sliding ticker.
                </small>
              </div>
            </div>
            {setActiveTab && (
              <button
                type="button"
                className="btn btn-sm btn-success d-inline-flex align-items-center gap-1.5 flex-shrink-0"
                style={{ borderRadius: '8px', fontWeight: 600, fontSize: '12px', padding: '6px 14px' }}
                onClick={() => setActiveTab('brands')}
              >
                <ExternalLink size={13} /> Manage Brands &amp; Logos
              </button>
            )}
          </div>

          {/* Active Brands List */}
          <div className="card-x p-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h4 className="m-0" style={{ fontSize: '15px', fontWeight: 700 }}>
                  Active Brand Logos ({config?.brandsBar?.selectedBrands?.length || 0})
                </h4>
                <small className="text-muted" style={{ fontSize: '12px' }}>
                  These brands appear in the continuous auto-sliding card ticker. Use the arrows to reorder.
                </small>
              </div>
              <button
                type="button"
                className="btn-soft d-inline-flex align-items-center gap-1.5"
                style={{ fontSize: '12px' }}
                onClick={() => {
                  const updated = {
                    ...config,
                    brandsBar: {
                      ...config.brandsBar,
                      selectedBrands: defaultConfig.brandsBar.selectedBrands,
                    },
                  };
                  setConfig(updated);
                  saveConfigImmediately(updated, 'Reset to default top brands.');
                }}
              >
                <RotateCcw size={13} /> Reset to Default Top Brands
              </button>
            </div>

            <div className="d-flex flex-column gap-2 mb-4">
              {(config?.brandsBar?.selectedBrands || []).map((brandItem: any, index: number) => {
                const total = config?.brandsBar?.selectedBrands?.length || 0;
                // Match brand with live catalog to get live logo
                const liveBrand = brands.find(
                  (b) => b.slug === brandItem.slug || b.id === brandItem.slug || b.name.toLowerCase() === brandItem.name.toLowerCase()
                );
                const currentLogo = liveBrand?.logo || brandItem.logo;

                return (
                  <div
                    key={brandItem.slug + '-' + index}
                    className="p-3 rounded-3 border d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 bg-white hover-bg transition"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    {/* Left: Reorder & Logo Card Preview */}
                    <div className="d-flex align-items-center gap-3">
                      <div className="d-flex flex-column align-items-center gap-1">
                        <button
                          type="button"
                          className="icon-btn"
                          disabled={index === 0}
                          onClick={() => handleMoveBrandOrder(index, 'up')}
                          title="Move up"
                          style={{ width: '24px', height: '24px' }}
                        >
                          <ArrowUp size={12} />
                        </button>
                        <span className="fw-bold font-monospace text-muted" style={{ fontSize: '11px' }}>
                          #{index + 1}
                        </span>
                        <button
                          type="button"
                          className="icon-btn"
                          disabled={index === total - 1}
                          onClick={() => handleMoveBrandOrder(index, 'down')}
                          title="Move down"
                          style={{ width: '24px', height: '24px' }}
                        >
                          <ArrowDown size={12} />
                        </button>
                      </div>

                      {/* Storefront Style Logo Card Preview */}
                      <div
                        style={{
                          width: '80px',
                          height: '52px',
                          borderRadius: '12px',
                          background: '#fff',
                          border: '1px solid #e2e8f0',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '6px',
                          flexShrink: 0,
                        }}
                      >
                        {currentLogo ? (
                          <img
                            src={resolveImageUrl(currentLogo)}
                            alt={brandItem.name}
                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600 }}>No Logo</span>
                        )}
                      </div>

                      <div>
                        <strong className="d-block" style={{ fontSize: '14px' }}>
                          {brandItem.name}
                        </strong>
                        <span className="text-muted font-monospace" style={{ fontSize: '11px' }}>
                          slug: {brandItem.slug}
                        </span>
                      </div>
                    </div>

                    {/* Middle: Brand Status info */}
                    <div className="d-flex flex-grow-1 align-items-center px-2">
                      {currentLogo ? (
                        <span
                          className="badge bg-success-subtle text-success border border-success-subtle py-1 px-2.5 d-inline-flex align-items-center gap-1"
                          style={{ fontSize: '11px' }}
                        >
                          <CheckCircle2 size={12} /> Live Logo in Brands
                        </span>
                      ) : (
                        <span
                          className="badge bg-warning-subtle text-warning border border-warning-subtle py-1 px-2.5 d-inline-flex align-items-center gap-1"
                          style={{ fontSize: '11px' }}
                        >
                          ⚠️ Missing Logo (Upload in Brands page)
                        </span>
                      )}
                    </div>

                    {/* Right: Actions */}
                    <div className="d-flex align-items-center gap-2">
                      {setActiveTab && (
                        <button
                          type="button"
                          className="btn-soft d-inline-flex align-items-center gap-1"
                          style={{ height: '34px', fontSize: '12px', padding: '0 10px' }}
                          onClick={() => setActiveTab('brands')}
                          title="Open Brands page to edit logo"
                        >
                          <ExternalLink size={12} /> Edit Logo in Brands
                        </button>
                      )}
                      <button
                        type="button"
                        className="icon-btn text-danger"
                        onClick={() => handleRemoveBrandFromBar(index)}
                        title="Remove brand from bar"
                        style={{ width: '34px', height: '34px', background: 'rgba(239, 68, 68, 0.1)' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add More Brands Picker */}
            <div className="pt-3 border-top">
              <label className="fw-bold mb-2 d-block" style={{ fontSize: '13px' }}>
                Add More Brands to the Homepage Bar:
              </label>
              <div className="position-relative mb-3">
                <Search size={16} className="position-absolute text-muted" style={{ top: '10px', left: '12px' }} />
                <input
                  type="text"
                  className="input-x ps-5"
                  value={brandSearch}
                  placeholder="Search among all 56+ store brands (e.g. JBL, Joyroom, Xiaomi, Apple)..."
                  onChange={(e) => setBrandSearch(e.target.value)}
                  style={{ height: '36px', fontSize: '13px' }}
                />
              </div>

              <div className="row g-2" style={{ maxHeight: '280px', overflowY: 'auto' }}>
                {filteredBrandsForPicker.map((b) => (
                  <div key={b.slug} className="col-12 col-sm-6 col-md-4 col-xl-3">
                    <div
                      className="p-2.5 rounded-3 border d-flex align-items-center justify-content-between gap-2 bg-light hover-bg transition cursor-pointer"
                      onClick={() => handleAddBrandToBar(b)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="d-flex align-items-center gap-2 overflow-hidden">
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '6px',
                            background: '#fff',
                            border: '1px solid var(--border)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            padding: '2px',
                          }}
                        >
                          {b.logo ? (
                            <img
                              src={resolveImageUrl(b.logo)}
                              alt={b.name}
                              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                            />
                          ) : (
                            <Award size={14} className="text-muted" />
                          )}
                        </div>
                        <div className="text-truncate">
                          <strong className="d-block text-truncate" style={{ fontSize: '12px' }}>
                            {b.name}
                          </strong>
                          <small className="text-muted" style={{ fontSize: '10px' }}>
                            {b.productCount || 0} products
                          </small>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn btn-sm btn-primary py-0 px-2 d-inline-flex align-items-center gap-1"
                        style={{ height: '26px', fontSize: '11px', borderRadius: '6px' }}
                      >
                        <Plus size={12} /> Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────── */}
      {/* SECTION 5: SHOP BY CATEGORIES CAROUSEL                         */}
      {/* ────────────────────────────────────────────────────────────── */}
      {activeSection === 'categories' && (
        <div className="d-flex flex-column gap-4">
          {/* Header & Toggle */}
          <div className="card-x p-3 d-flex justify-content-between align-items-center">
            <div>
              <div className="d-flex align-items-center gap-2">
                <FolderTree size={20} className="text-info" />
                <h3 className="m-0" style={{ fontSize: '16px', fontWeight: 700 }}>
                  Shop by Categories Carousel
                </h3>
              </div>
              <p className="m-0 text-muted mt-1" style={{ fontSize: '13px' }}>
                Select exactly which category circles appear in the homepage slider and in what order.
              </p>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className="text-muted" style={{ fontSize: '13px' }}>
                {config?.shopByCategories?.enabled !== false ? 'Section Enabled' : 'Section Disabled'}
              </span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={config?.shopByCategories?.enabled !== false}
                  onChange={(e) => {
                    const updated = {
                      ...config,
                      shopByCategories: {
                        ...config.shopByCategories,
                        enabled: e.target.checked,
                      },
                    };
                    setConfig(updated);
                    saveConfigImmediately(
                      updated,
                      e.target.checked ? 'Categories section enabled!' : 'Categories section hidden.'
                    );
                  }}
                />
                <span className="slider round"></span>
              </label>
            </div>
          </div>

          {/* Section Titles Customization */}
          <div className="card-x p-3">
            <h4 className="fw-bold mb-3" style={{ fontSize: '14px' }}>
              Section Headings
            </h4>
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="text-muted d-block mb-1" style={{ fontSize: '12px', fontWeight: 600 }}>
                  Heading Title:
                </label>
                <input
                  type="text"
                  className="input-x"
                  value={config?.shopByCategories?.title || 'Shop by Categories'}
                  onChange={(e) => {
                    setConfig((prev: any) => ({
                      ...prev,
                      shopByCategories: {
                        ...prev.shopByCategories,
                        title: e.target.value,
                      },
                    }));
                  }}
                  style={{ height: '38px', fontSize: '13px' }}
                />
              </div>
              <div className="col-12 col-md-6">
                <label className="text-muted d-block mb-1" style={{ fontSize: '12px', fontWeight: 600 }}>
                  Sub-heading Text:
                </label>
                <input
                  type="text"
                  className="input-x"
                  value={config?.shopByCategories?.subtitle || 'Explore authentic imported tech products with official warranty'}
                  onChange={(e) => {
                    setConfig((prev: any) => ({
                      ...prev,
                      shopByCategories: {
                        ...prev.shopByCategories,
                        subtitle: e.target.value,
                      },
                    }));
                  }}
                  style={{ height: '38px', fontSize: '13px' }}
                />
              </div>
            </div>
          </div>

          {/* Selected Categories in Order */}
          <div className="card-x p-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h4 className="m-0" style={{ fontSize: '15px', fontWeight: 700 }}>
                  Categories Displayed on Homepage ({config?.shopByCategories?.selectedCategorySlugs?.length || 0})
                </h4>
                <small className="text-muted" style={{ fontSize: '12px' }}>
                  Only these selected categories will be shown in the circle slider in this exact sequence.
                </small>
              </div>
              <div className="d-flex align-items-center gap-2">
                <button
                  type="button"
                  className="btn-soft"
                  style={{ fontSize: '12px' }}
                  onClick={() => handleSelectTopCategories(8)}
                >
                  Select Top 8
                </button>
                <button
                  type="button"
                  className="btn-soft text-danger"
                  style={{ fontSize: '12px' }}
                  onClick={() => {
                    const updated = {
                      ...config,
                      shopByCategories: {
                        ...config.shopByCategories,
                        selectedCategorySlugs: [],
                      },
                    };
                    setConfig(updated);
                    saveConfigImmediately(updated, 'Cleared selected categories.');
                  }}
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Ordered Category Pills */}
            <div className="d-flex flex-wrap gap-2 mb-4">
              {(config?.shopByCategories?.selectedCategorySlugs || []).map((slug: string, index: number) => {
                const cat = categories.find((c) => c.slug === slug || c.id === slug);
                const total = config?.shopByCategories?.selectedCategorySlugs?.length || 0;
                return (
                  <div
                    key={slug}
                    className="p-2 ps-3 pe-2 rounded-3 border d-flex align-items-center gap-2 bg-white shadow-xs"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <span className="badge bg-primary text-white" style={{ fontSize: '10px' }}>
                      #{index + 1}
                    </span>
                    <strong style={{ fontSize: '12px' }}>
                      {cat?.name || slug}
                    </strong>
                    <span className="text-muted" style={{ fontSize: '11px' }}>
                      ({cat?.productCount || 0})
                    </span>

                    <div className="d-flex align-items-center ms-1">
                      <button
                        type="button"
                        className="icon-btn p-0"
                        disabled={index === 0}
                        onClick={() => handleMoveCategoryOrder(index, 'up')}
                        title="Move left"
                        style={{ width: '22px', height: '22px' }}
                      >
                        <ArrowUp size={11} />
                      </button>
                      <button
                        type="button"
                        className="icon-btn p-0"
                        disabled={index === total - 1}
                        onClick={() => handleMoveCategoryOrder(index, 'down')}
                        title="Move right"
                        style={{ width: '22px', height: '22px' }}
                      >
                        <ArrowDown size={11} />
                      </button>
                      <button
                        type="button"
                        className="icon-btn text-danger p-0 ms-1"
                        onClick={() => handleRemoveCategoryFromCarousel(slug)}
                        title="Remove category"
                        style={{ width: '22px', height: '22px' }}
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Category Selector Grid */}
            <div className="pt-3 border-top">
              <label className="fw-bold mb-2 d-block" style={{ fontSize: '13px' }}>
                Select Categories to Include:
              </label>
              <div className="position-relative mb-3">
                <Search size={16} className="position-absolute text-muted" style={{ top: '10px', left: '12px' }} />
                <input
                  type="text"
                  className="input-x ps-5"
                  value={categorySearch}
                  placeholder="Filter store categories (e.g. Smart Watch, Earbuds, Chargers, Glass)..."
                  onChange={(e) => setCategorySearch(e.target.value)}
                  style={{ height: '36px', fontSize: '13px' }}
                />
              </div>

              <div className="row g-2" style={{ maxHeight: '320px', overflowY: 'auto' }}>
                {filteredCategoriesForPicker.map((cat) => {
                  const isSelected = (config?.shopByCategories?.selectedCategorySlugs || []).includes(cat.slug);
                  return (
                    <div key={cat.slug} className="col-12 col-sm-6 col-md-4 col-xl-3">
                      <div
                        onClick={() => handleToggleCategoryForCarousel(cat.slug)}
                        className={`p-2.5 rounded-3 border d-flex align-items-center justify-content-between gap-2 transition cursor-pointer ${
                          isSelected
                            ? 'border-primary bg-primary-subtle shadow-xs'
                            : 'border-secondary-subtle bg-white hover-bg'
                        }`}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="d-flex align-items-center gap-2 overflow-hidden">
                          {isSelected ? (
                            <CheckSquare size={16} className="text-primary flex-shrink-0" />
                          ) : (
                            <Square size={16} className="text-muted flex-shrink-0" />
                          )}
                          <div className="text-truncate">
                            <strong className="d-block text-truncate" style={{ fontSize: '12px' }}>
                              {cat.name}
                            </strong>
                            <small className="text-muted" style={{ fontSize: '10px' }}>
                              {cat.productCount} products
                            </small>
                          </div>
                        </div>
                        {isSelected && (
                          <span className="badge bg-primary text-white" style={{ fontSize: '10px' }}>
                            Selected
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────── */}
      {/* SECTION 6: CATEGORY BOXES 5 (BENTO GRID)                       */}
      {/* ────────────────────────────────────────────────────────────── */}
      {activeSection === 'bento' && (
        <div className="d-flex flex-column gap-4">
          {/* Header & Toggle */}
          <div className="card-x p-3 d-flex justify-content-between align-items-center">
            <div>
              <div className="d-flex align-items-center gap-2">
                <Grid size={20} className="text-warning" />
                <h3 className="m-0" style={{ fontSize: '16px', fontWeight: 700 }}>
                  Category Showcase (5 Bento Boxes Grid)
                </h3>
              </div>
              <p className="m-0 text-muted mt-1" style={{ fontSize: '13px' }}>
                Customize the 5 bento category promo cards. Select a category, customize title, badge, models count, description and image.
              </p>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className="text-muted" style={{ fontSize: '13px' }}>
                {config?.bentoGrid?.enabled !== false ? 'Section Enabled' : 'Section Disabled'}
              </span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={config?.bentoGrid?.enabled !== false}
                  onChange={(e) => {
                    const updated = {
                      ...config,
                      bentoGrid: {
                        ...config.bentoGrid,
                        enabled: e.target.checked,
                      },
                    };
                    setConfig(updated);
                    saveConfigImmediately(
                      updated,
                      e.target.checked ? 'Bento grid enabled!' : 'Bento grid hidden.'
                    );
                  }}
                />
                <span className="slider round"></span>
              </label>
            </div>
          </div>

          {/* Mini Bento Layout Visual Selector */}
          <div className="card-x p-3">
            <label className="fw-bold mb-2 d-block" style={{ fontSize: '13px' }}>
              Select Bento Box to Customize:
            </label>
            <div className="row g-2">
              {/* Box 1: Left tall card */}
              <div className="col-12 col-md-3">
                {(() => {
                  const b = (config?.bentoGrid?.boxes || [])[0] || {};
                  const isCurrent = activeBentoBoxIndex === 0;
                  return (
                    <div
                      onClick={() => setActiveBentoBoxIndex(0)}
                      className={`p-3 rounded-3 text-start transition cursor-pointer border h-100 d-flex flex-column justify-content-between ${
                        isCurrent
                          ? 'border-warning shadow-sm'
                          : 'border-secondary-subtle hover-bg'
                      }`}
                      style={{
                        background: isCurrent ? 'linear-gradient(180deg, #27221e 0%, #171412 100%)' : '#1c1917',
                        color: '#fff',
                        minHeight: '140px',
                        cursor: 'pointer',
                      }}
                    >
                      <div>
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="badge bg-warning text-dark" style={{ fontSize: '10px', fontWeight: 700 }}>
                            Box 1 (Left Tall)
                          </span>
                          {isCurrent && <span className="text-warning fw-bold" style={{ fontSize: '11px' }}>Editing ✓</span>}
                        </div>
                        <span className="text-warning fw-bold text-uppercase d-block" style={{ fontSize: '9px' }}>
                          {b.badge || 'STUDIO & WIRELESS'}
                        </span>
                        <strong className="d-block text-truncate text-white" style={{ fontSize: '13px' }}>
                          {b.title || 'Headphones & Earbuds'}
                        </strong>
                      </div>
                      <small className="text-warning font-monospace" style={{ fontSize: '11px' }}>
                        {b.buttonText || 'Explore Headphones'} →
                      </small>
                    </div>
                  );
                })()}
              </div>

              {/* Box 2: Middle tall card */}
              <div className="col-12 col-md-3">
                {(() => {
                  const b = (config?.bentoGrid?.boxes || [])[1] || {};
                  const isCurrent = activeBentoBoxIndex === 1;
                  return (
                    <div
                      onClick={() => setActiveBentoBoxIndex(1)}
                      className={`p-3 rounded-3 text-start transition cursor-pointer border h-100 d-flex flex-column justify-content-between ${
                        isCurrent
                          ? 'border-warning shadow-sm'
                          : 'border-secondary-subtle hover-bg'
                      }`}
                      style={{
                        background: isCurrent ? 'linear-gradient(180deg, #261b17 0%, #140f0c 100%)' : '#1a1210',
                        color: '#fff',
                        minHeight: '140px',
                        cursor: 'pointer',
                      }}
                    >
                      <div>
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="badge bg-warning text-dark" style={{ fontSize: '10px', fontWeight: 700 }}>
                            Box 2 (Middle Tall)
                          </span>
                          {isCurrent && <span className="text-warning fw-bold" style={{ fontSize: '11px' }}>Editing ✓</span>}
                        </div>
                        <span className="text-orange-300 fw-bold text-uppercase d-block" style={{ fontSize: '9px', color: '#fdba74' }}>
                          {b.badge || 'WEARABLE TECH'}
                        </span>
                        <strong className="d-block text-truncate text-white" style={{ fontSize: '13px' }}>
                          {b.title || 'Smart Watches'}
                        </strong>
                      </div>
                      <small className="font-monospace" style={{ fontSize: '11px', color: '#fdba74' }}>
                        {b.buttonText || 'Explore Smartwatches'} →
                      </small>
                    </div>
                  );
                })()}
              </div>

              {/* Right Stack (Boxes 3, 4, 5) */}
              <div className="col-12 col-md-6 d-flex flex-column gap-2">
                <div className="row g-2">
                  {/* Box 3: Speakers */}
                  <div className="col-6">
                    {(() => {
                      const b = (config?.bentoGrid?.boxes || [])[2] || {};
                      const isCurrent = activeBentoBoxIndex === 2;
                      return (
                        <div
                          onClick={() => setActiveBentoBoxIndex(2)}
                          className={`p-2.5 rounded-3 text-start transition cursor-pointer border ${
                            isCurrent ? 'border-primary shadow-sm' : 'border-secondary-subtle'
                          }`}
                          style={{
                            background: '#0f172a',
                            color: '#fff',
                            cursor: 'pointer',
                          }}
                        >
                          <div className="d-flex justify-content-between align-items-center mb-0.5">
                            <span className="badge bg-primary text-white" style={{ fontSize: '9px' }}>
                              Box 3 (Top Right 1)
                            </span>
                            {isCurrent && <span className="text-primary fw-bold" style={{ fontSize: '10px' }}>Editing ✓</span>}
                          </div>
                          <span className="text-info fw-bold text-uppercase d-block" style={{ fontSize: '8px' }}>
                            {b.badge || 'HI-FI SOUND'}
                          </span>
                          <strong className="d-block text-truncate text-white" style={{ fontSize: '12px' }}>
                            {b.title || 'Speakers'}
                          </strong>
                          <small className="text-info" style={{ fontSize: '10px' }}>
                            {b.subtitle || '55+ Models'}
                          </small>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Box 4: PowerBanks */}
                  <div className="col-6">
                    {(() => {
                      const b = (config?.bentoGrid?.boxes || [])[3] || {};
                      const isCurrent = activeBentoBoxIndex === 3;
                      return (
                        <div
                          onClick={() => setActiveBentoBoxIndex(3)}
                          className={`p-2.5 rounded-3 text-start transition cursor-pointer border ${
                            isCurrent ? 'border-success shadow-sm' : 'border-secondary-subtle'
                          }`}
                          style={{
                            background: '#0a1a0e',
                            color: '#fff',
                            cursor: 'pointer',
                          }}
                        >
                          <div className="d-flex justify-content-between align-items-center mb-0.5">
                            <span className="badge bg-success text-white" style={{ fontSize: '9px' }}>
                              Box 4 (Top Right 2)
                            </span>
                            {isCurrent && <span className="text-success fw-bold" style={{ fontSize: '10px' }}>Editing ✓</span>}
                          </div>
                          <span className="text-success fw-bold text-uppercase d-block" style={{ fontSize: '8px' }}>
                            {b.badge || 'FAST CHARGE'}
                          </span>
                          <strong className="d-block text-truncate text-white" style={{ fontSize: '12px' }}>
                            {b.title || 'PowerBanks'}
                          </strong>
                          <small className="text-success" style={{ fontSize: '10px' }}>
                            {b.subtitle || '32+ Models'}
                          </small>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Box 5: Phone Accessories (Bottom Wide) */}
                <div>
                  {(() => {
                    const b = (config?.bentoGrid?.boxes || [])[4] || {};
                    const isCurrent = activeBentoBoxIndex === 4;
                    return (
                      <div
                        onClick={() => setActiveBentoBoxIndex(4)}
                        className={`p-2.5 rounded-3 text-start transition cursor-pointer border ${
                          isCurrent ? 'border-success shadow-sm' : 'border-secondary-subtle'
                        }`}
                        style={{
                          background: 'linear-gradient(90deg, #052e16 0%, #0f172a 100%)',
                          color: '#fff',
                          cursor: 'pointer',
                        }}
                      >
                        <div className="d-flex justify-content-between align-items-center mb-0.5">
                          <span className="badge bg-success text-white" style={{ fontSize: '9px' }}>
                            Box 5 (Bottom Wide)
                          </span>
                          {isCurrent && <span className="text-success fw-bold" style={{ fontSize: '10px' }}>Editing ✓</span>}
                        </div>
                        <strong className="d-block text-truncate text-white" style={{ fontSize: '13px' }}>
                          {b.title || 'Phone Accessories'}
                        </strong>
                        <small className="text-success-subtle text-truncate d-block" style={{ fontSize: '11px', color: '#86efac' }}>
                          {b.description || 'Fast Wall Chargers, Type-C Cables & Mounts'} • {b.subtitle || '140+ Items'}
                        </small>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>

          {/* Editor for Currently Active Bento Box */}
          {(() => {
            const currentBox = (config?.bentoGrid?.boxes || [])[activeBentoBoxIndex] || {};
            return (
              <div className="row g-4">
                {/* Left: Configuration Form */}
                <div className="col-12 col-lg-7 d-flex flex-column gap-3">
                  <div className="card-x p-3">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h4 className="m-0" style={{ fontSize: '15px', fontWeight: 700 }}>
                        Customize Box #{activeBentoBoxIndex + 1}: {currentBox.title || 'Category Box'}
                      </h4>
                      <span className="badge bg-dark text-white" style={{ fontSize: '11px' }}>
                        Box {activeBentoBoxIndex + 1} of 5
                      </span>
                    </div>

                    {/* Step 1: Select Category */}
                    <div className="p-3 mb-3 rounded-3 bg-light border">
                      <label className="fw-bold mb-1.5 d-block text-primary" style={{ fontSize: '13px' }}>
                        1. Select Store Category:
                      </label>
                      <select
                        className="input-x"
                        value={currentBox.categorySlug || ''}
                        onChange={(e) => handleSelectCategoryForBentoBox(activeBentoBoxIndex, e.target.value)}
                        style={{ height: '38px', fontSize: '13px' }}
                      >
                        <option value="">-- Choose a category from your store --</option>
                        {categories.map((c) => (
                          <option key={c.slug} value={c.slug}>
                            {c.name} ({c.productCount} products)
                          </option>
                        ))}
                      </select>
                      <small className="text-muted d-block mt-1" style={{ fontSize: '11px' }}>
                        Selecting a category automatically sets the title, link, subtitle/count, and provides product image suggestions below.
                      </small>
                    </div>

                    {/* Step 2: Content Text Inputs */}
                    <div className="d-flex flex-column gap-2.5">
                      <div className="row g-2">
                        <div className="col-12 col-sm-6">
                          <label className="text-muted d-block mb-1" style={{ fontSize: '11px', fontWeight: 600 }}>
                            Top Badge:
                          </label>
                          <input
                            type="text"
                            className="input-x"
                            value={currentBox.badge || ''}
                            placeholder="e.g. STUDIO & WIRELESS, WEARABLE TECH"
                            onChange={(e) => handleUpdateBentoBox(activeBentoBoxIndex, 'badge', e.target.value)}
                            style={{ height: '36px', fontSize: '12px' }}
                          />
                        </div>
                        <div className="col-12 col-sm-6">
                          <label className="text-muted d-block mb-1" style={{ fontSize: '11px', fontWeight: 600 }}>
                            Card Title:
                          </label>
                          <input
                            type="text"
                            className="input-x fw-bold"
                            value={currentBox.title || ''}
                            placeholder="e.g. Headphones & Earbuds"
                            onChange={(e) => handleUpdateBentoBox(activeBentoBoxIndex, 'title', e.target.value)}
                            style={{ height: '36px', fontSize: '13px' }}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-muted d-block mb-1" style={{ fontSize: '11px', fontWeight: 600 }}>
                          Card Description:
                        </label>
                        <textarea
                          rows={2}
                          className="input-x"
                          value={currentBox.description || ''}
                          placeholder="e.g. Over-Ear Headsets, TWS Noise Cancelling & Wireless Earphones"
                          onChange={(e) => handleUpdateBentoBox(activeBentoBoxIndex, 'description', e.target.value)}
                          style={{ fontSize: '12px' }}
                        />
                      </div>

                      <div className="row g-2">
                        <div className="col-12 col-sm-6">
                          <label className="text-muted d-block mb-1" style={{ fontSize: '11px', fontWeight: 600 }}>
                            Subtitle / Models Count:
                          </label>
                          <input
                            type="text"
                            className="input-x"
                            value={currentBox.subtitle || ''}
                            placeholder="e.g. 55+ Models, 140+ Certified Accessories"
                            onChange={(e) => handleUpdateBentoBox(activeBentoBoxIndex, 'subtitle', e.target.value)}
                            style={{ height: '36px', fontSize: '12px' }}
                          />
                        </div>
                        <div className="col-12 col-sm-6">
                          <label className="text-muted d-block mb-1" style={{ fontSize: '11px', fontWeight: 600 }}>
                            Button / Action Text:
                          </label>
                          <input
                            type="text"
                            className="input-x"
                            value={currentBox.buttonText || ''}
                            placeholder="e.g. Explore Headphones, Shop Speakers"
                            onChange={(e) => handleUpdateBentoBox(activeBentoBoxIndex, 'buttonText', e.target.value)}
                            style={{ height: '36px', fontSize: '12px' }}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-muted d-block mb-1" style={{ fontSize: '11px', fontWeight: 600 }}>
                          Target Link (URL):
                        </label>
                        <input
                          type="text"
                          className="input-x font-monospace"
                          value={currentBox.link || ''}
                          placeholder="/category/smartwatches or /shop?category=..."
                          onChange={(e) => handleUpdateBentoBox(activeBentoBoxIndex, 'link', e.target.value)}
                          style={{ height: '36px', fontSize: '12px' }}
                        />
                      </div>

                      {/* Image Picker */}
                      <div className="pt-2 border-top">
                        <label className="fw-bold mb-1.5 d-block" style={{ fontSize: '12px' }}>
                          Card Image:
                        </label>
                        <div className="d-flex gap-2 mb-2 align-items-center">
                          <input
                            type="text"
                            className="input-x flex-grow-1"
                            value={currentBox.image || ''}
                            placeholder="Paste direct Image URL..."
                            onChange={(e) => handleUpdateBentoBox(activeBentoBoxIndex, 'image', e.target.value)}
                            style={{ height: '36px', fontSize: '12px' }}
                          />
                          {currentBox.image && (
                            <div
                              style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '6px',
                                overflow: 'hidden',
                                border: '1px solid var(--border)',
                                background: '#fff',
                                flexShrink: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <img
                                src={resolveImageUrl(currentBox.image)}
                                alt="Preview"
                                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                              />
                            </div>
                          )}
                          <label
                            className="btn-soft d-inline-flex align-items-center gap-1.5 cursor-pointer"
                            style={{ height: '36px', fontSize: '12px', padding: '0 12px', cursor: 'pointer', flexShrink: 0 }}
                            title="Upload Image from PC"
                          >
                            <Upload size={14} />
                            <span>Upload PC</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="d-none"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const uploadedUrl = await uploadBannerFile(file);
                                  if (uploadedUrl) {
                                    handleUpdateBentoBox(activeBentoBoxIndex, 'image', uploadedUrl);
                                    showNotification('Bento box image uploaded!');
                                  }
                                }
                              }}
                            />
                          </label>
                        </div>

                        {/* Pick from category products thumbnails */}
                        {categoryProductsForBento.length > 0 && (
                          <div className="mt-2 p-2.5 rounded-3 bg-light border">
                            <label className="text-muted d-block mb-1.5" style={{ fontSize: '11px', fontWeight: 600 }}>
                              Or click any product from this category to use its image:
                            </label>
                            <div className="d-flex gap-2 overflow-x-auto pb-1">
                              {categoryProductsForBento.slice(0, 10).map((prod) => (
                                <div
                                  key={prod.id}
                                  onClick={() => prod.image && handleUpdateBentoBox(activeBentoBoxIndex, 'image', prod.image)}
                                  className={`p-1 rounded-2 border bg-white flex-shrink-0 cursor-pointer ${
                                    currentBox.image === prod.image ? 'border-primary ring-2' : 'border-secondary-subtle'
                                  }`}
                                  style={{ width: '48px', height: '48px', cursor: 'pointer' }}
                                  title={prod.name}
                                >
                                  <img
                                    src={resolveImageUrl(prod.image)}
                                    alt={prod.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Live Preview Card */}
                <div className="col-12 col-lg-5">
                  <div className="card-x p-3 sticky-top" style={{ top: '80px' }}>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="fw-bold text-muted" style={{ fontSize: '12px' }}>
                        Live Card Preview (Storefront Style):
                      </span>
                      <span className="badge bg-warning text-dark" style={{ fontSize: '10px' }}>
                        Box #{activeBentoBoxIndex + 1}
                      </span>
                    </div>

                    <div
                      className="rounded-4 p-4 text-white position-relative overflow-hidden d-flex flex-column justify-content-between shadow-lg"
                      style={{
                        minHeight: activeBentoBoxIndex < 2 ? '360px' : '220px',
                        background:
                          activeBentoBoxIndex === 0
                            ? 'linear-gradient(180deg, #1c1917 0%, #0c0a09 100%)'
                            : activeBentoBoxIndex === 1
                            ? 'linear-gradient(180deg, #1a1210 0%, #0d0b09 100%)'
                            : activeBentoBoxIndex === 2
                            ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)'
                            : activeBentoBoxIndex === 3
                            ? 'linear-gradient(135deg, #0a1a0e 0%, #0f2d0e 100%)'
                            : 'linear-gradient(90deg, #052e16 0%, #0f172a 60%, #000000 100%)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      <div className="position-relative" style={{ zIndex: 2 }}>
                        {currentBox.badge && (
                          <span
                            className="text-uppercase fw-bold d-block mb-1"
                            style={{
                              fontSize: '10px',
                              letterSpacing: '1px',
                              color: activeBentoBoxIndex === 1 ? '#fdba74' : activeBentoBoxIndex === 2 ? '#60a5fa' : '#34d399',
                            }}
                          >
                            {currentBox.badge}
                          </span>
                        )}
                        <h3 className="fw-black text-white text-uppercase m-0" style={{ fontSize: '20px', lineHeight: 1.2 }}>
                          {currentBox.title || 'Card Title'}
                        </h3>
                        {currentBox.description && (
                          <p className="mt-1 text-white-50" style={{ fontSize: '12px', maxWidth: '240px' }}>
                            {currentBox.description}
                          </p>
                        )}
                        {currentBox.subtitle && (
                          <p className="fw-bold mt-1" style={{ fontSize: '12px', color: '#34d399' }}>
                            {currentBox.subtitle}
                          </p>
                        )}
                      </div>

                      <div className="position-relative d-flex align-items-center gap-1 fw-bold mt-3" style={{ zIndex: 2, fontSize: '12px', color: '#34d399' }}>
                        <span>{currentBox.buttonText || 'Explore'}</span>
                        <ArrowRight size={14} />
                      </div>

                      {/* Card Image */}
                      {currentBox.image && (
                        <div
                          className="position-absolute"
                          style={{
                            right: '12px',
                            bottom: '12px',
                            width: activeBentoBoxIndex < 2 ? '180px' : '120px',
                            height: activeBentoBoxIndex < 2 ? '180px' : '120px',
                            display: 'flex',
                            alignItems: 'flex-end',
                            justifyContent: 'flex-end',
                            pointerEvents: 'none',
                            zIndex: 1,
                          }}
                        >
                          <img
                            src={resolveImageUrl(currentBox.image)}
                            alt={currentBox.title}
                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.5))' }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Sticky Bottom Save Action Bar */}
      <div
        className="card-x p-3 mt-4 d-flex justify-content-between align-items-center sticky-bottom"
        style={{
          boxShadow: '0 -4px 16px rgba(0,0,0,0.06)',
          zIndex: 100,
          background: 'var(--card-bg, #ffffff)',
          borderTop: '1px solid var(--border)',
        }}
      >
        <span className="text-muted" style={{ fontSize: '13px' }}>
          Unsaved changes will apply immediately upon clicking Save.
        </span>
        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn-soft"
            onClick={handleResetDefaults}
            style={{ fontSize: '13px', height: '36px' }}
          >
            Reset Layout
          </button>
          <button
            type="button"
            onClick={() => handleSave()}
            disabled={saving}
            className="btn btn-dark d-inline-flex align-items-center gap-2"
            style={{ background: '#0f172a', borderColor: '#0f172a', height: '36px', borderRadius: '10px', fontSize: '13px', fontWeight: 600 }}
          >
            <Save size={15} />
            <span>{saving ? 'Publishing...' : 'Save & Publish Live'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
