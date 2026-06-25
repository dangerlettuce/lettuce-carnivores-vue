import { ref, computed } from 'vue';
import { findDocById, saveExistingItem, saveItem } from '@/apis/dataServices.ts';

const bannerCollectionName = 'banner' as const;
const bannerDetailsDocId = 'bannerDetails' as const;
const bannerStyles = ['sale', 'warning', 'info'] as const;
type BannerDetails = {
  link: string | null;
  style: (typeof bannerStyles)[number] | null;
  message: string | null;
  showBanner: boolean | null;
};

export function useBannerMessage() {
  const bannerDetails = ref<BannerDetails>({ message: null, link: null, style: null, showBanner: null });
  const showBanner = computed(() => bannerDetails.value !== null && bannerDetails.value.showBanner === true);

  async function getBannerDetails() {
    const res = await findDocById(bannerCollectionName, bannerDetailsDocId);
    if (res === null) {
      bannerDetails.value = { message: null, link: null, style: null, showBanner: null };
      window.alert('Unable to fetch banner details');
      return;
    }
    bannerDetails.value = parseBannerDetails(res);
  }

  async function saveBannerDetails(details: BannerDetails | null) {
    if (details === null) {
      console.error('Banner details cannot be null');
      return false;
    }
    const res = await saveExistingItem(bannerCollectionName, details, bannerDetailsDocId);
    if (!res) {
      console.error('Unable to save banner details');
      return false;
    }
    return true;
  }

  function parseBannerDetails(data: any): BannerDetails {
    if (!data || typeof data !== 'object') return { message: null, link: null, style: null, showBanner: null };

    return {
      link: data.link || null,
      style: getBannerStyle(data.style),
      message: data.message || null,
      showBanner: data.showBanner || null,
    };
  }

  function getBannerStyle(style: (typeof bannerStyles)[number]) {
    if (bannerStyles.includes(style)) {
      return style;
    }
    return null;
  }

  return { bannerDetails, showBanner, getBannerDetails, saveBannerDetails };
}
