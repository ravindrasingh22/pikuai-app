import React from 'react';
import { Image, ImageStyle, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Images } from '../assets/assets';
import PratvimWordmark from '../../../assets/images/pratvim-wordmark.svg';
import PratvimIcon from '../../../assets/images/pratvim-icon-new.svg';

type Props = {
  variant?: 'wordmark' | 'icon' | 'symbol' | 'chat';
  style?: StyleProp<ImageStyle>;
  containerStyle?: StyleProp<ViewStyle>;
};

const PRATVIM_ICON_ASPECT_RATIO = 297 / 375;

export function Brand({ variant = 'wordmark', style, containerStyle }: Props) {
  const source = variant === 'symbol' ? Images.brandSymbol : variant === 'chat' ? Images.wordmarkChat : Images.wordmark;
  if (variant === 'wordmark' || variant === 'icon') {
    const flattenedStyle = StyleSheet.flatten(style) ?? {};
    const defaultSize = variant === 'wordmark' ? styles.wordmark : styles.icon;
    const requestedWidth = typeof flattenedStyle.width === 'number' ? flattenedStyle.width : undefined;
    const requestedHeight = typeof flattenedStyle.height === 'number' ? flattenedStyle.height : undefined;
    const height = requestedHeight ?? (variant === 'icon' && requestedWidth ? requestedWidth / PRATVIM_ICON_ASPECT_RATIO : defaultSize.height);
    const width = variant === 'icon' ? height * PRATVIM_ICON_ASPECT_RATIO : requestedWidth ?? defaultSize.width;

    return (
      <View style={[styles.wrap, containerStyle]}>
        {variant === 'wordmark' ? <PratvimWordmark width={width} height={height} /> : <PratvimIcon width={width} height={height} />}
      </View>
    );
  }

  return (
    <View style={[styles.wrap, containerStyle]}>
      <Image source={source} style={[variant === 'chat' ? styles.wordmark : styles.icon, style]} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  wordmark: { width: 160, height: 70 },
  icon: { width: 34, height: 34 }
});
