import { ref, computed } from 'vue';
import { findDocById } from '@/apis/dataServices'

const bannerCollectionName = 'banner' as const;
const bannerDetailsDocId = 'bannerDetails' as const;
const bannerStyles = ['sale', 'warning', 'info', ] as const;
type BannerDetails = {
  link: string | null,
  style: typeof bannerStyles[number] | null,
  message: string | null,
  showBanner: boolean | null,
}

export function useBannerMessage() {
  const bannerDetails = ref<BannerDetails | null>(null);
  const showBanner = computed(() => bannerDetails.value !== null && bannerDetails.value.showBanner === true);

  async function getBannerDetails() {
    const res = await findDocById(bannerCollectionName, bannerDetailsDocId);
    if (res === null) {
      bannerDetails.value = null;
      console.error('Unable to fetch banner details');
      return;
    }
    bannerDetails.value = parseBannerDetails(res);
  }

  function parseBannerDetails(data: any): BannerDetails | null {
    if (!data || typeof data !== 'object') return null;


    return {
      link: data.link || null,
      style: getBannerStyle(data.style),
      message: data.message || null,
      showBanner: data.showBanner || null,
    };
  }

  function getBannerStyle(style: typeof bannerStyles[number]) {
    if (bannerStyles.includes(style)) {
      return style;
    }
    return null;
  }

  return { bannerDetails, showBanner, getBannerDetails };
}
