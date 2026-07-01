import { useWindowDimensions } from 'react-native';

export function useResponsiveLayout() {
  const { width, height } = useWindowDimensions();
  const shortSide = Math.min(width, height);
  const isTablet = shortSide >= 740;
  const isLandscape = width > height;
  const contentWidth = isTablet ? Math.min(width - 64, isLandscape ? 860 : 620) : width;
  return { width, height, isTablet, isLandscape, contentWidth };
}
