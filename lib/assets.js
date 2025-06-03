/**
 * Asset Management System
 * Centralized configuration for all project assets
 */

// Asset base paths
export const ASSET_PATHS = {
  images: '/images',
  icons: '/icons',
  documents: '/documents',
  media: '/media',
  data: '/data',
  fonts: '/fonts'
};

// Asset collections
export const ASSETS = {
  // Logo and branding
  logos: {
    main: `${ASSET_PATHS.images}/logo.png`,
    favicon: '/favicon.ico',
    brandMark: `${ASSET_PATHS.images}/brand-mark.png`
  },
  
  // Icons
  icons: {
    file: '/file.svg',
    globe: '/globe.svg',
    next: '/next.svg',
    vercel: '/vercel.svg',
    window: '/window.svg',
    dashboard: `${ASSET_PATHS.icons}/dashboard.svg`,
    profile: `${ASSET_PATHS.icons}/profile.svg`,
    settings: `${ASSET_PATHS.icons}/settings.svg`
  },
  
  // Documents and content
  documents: {
    readme: `${ASSET_PATHS.documents}/README.md`,
    terms: `${ASSET_PATHS.documents}/terms-of-service.md`,
    privacy: `${ASSET_PATHS.documents}/privacy-policy.md`,
    api: `${ASSET_PATHS.documents}/api-documentation.md`
  },
  
  // Data files
  data: {
    sampleData: `${ASSET_PATHS.data}/sample-data.json`,
    config: `${ASSET_PATHS.data}/app-config.json`,
    navigation: `${ASSET_PATHS.data}/navigation.json`
  }
};

/**
 * Get asset path by key
 * @param {string} category - Asset category (e.g., 'logos', 'icons')
 * @param {string} key - Asset key within category
 * @returns {string} Full asset path
 */
export const getAssetPath = (category, key) => {
  if (!ASSETS[category] || !ASSETS[category][key]) {
    console.warn(`Asset not found: ${category}.${key}`);
    return null;
  }
  return ASSETS[category][key];
};

/**
 * Get all assets in a category
 * @param {string} category - Asset category
 * @returns {object} All assets in the category
 */
export const getAssetCategory = (category) => {
  if (!ASSETS[category]) {
    console.warn(`Asset category not found: ${category}`);
    return {};
  }
  return ASSETS[category];
};

/**
 * Check if asset exists
 * @param {string} category - Asset category
 * @param {string} key - Asset key
 * @returns {boolean} Whether asset exists
 */
export const hasAsset = (category, key) => {
  return ASSETS[category] && ASSETS[category][key];
};

/**
 * Add new asset dynamically
 * @param {string} category - Asset category
 * @param {string} key - Asset key
 * @param {string} path - Asset path
 */
export const addAsset = (category, key, path) => {
  if (!ASSETS[category]) {
    ASSETS[category] = {};
  }
  ASSETS[category][key] = path;
};

// Export default asset object for direct access
export default ASSETS;
