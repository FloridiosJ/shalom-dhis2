import React from 'react';
import {View, StyleSheet} from 'react-native';
import Svg, {
  Circle,
  G,
  Rect,
  Path,
  Text as SvgText,
} from 'react-native-svg';

interface AppLogoProps {
  width?: number;
  height?: number;
  showText?: boolean;
  variant?: 'full' | 'mark' | 'mono';
}

/**
 * AppLogo component - Displays the Shalom DHIS2 logo
 * 
 * @param width - Width of the logo (default: 200)
 * @param height - Height of the logo (default: 200)
 * @param showText - Whether to show the "SHALOM" text (default: true)
 * @param variant - Logo variant: 'full' (colored), 'mark' (icon only), 'mono' (monochrome)
 */
export const AppLogo: React.FC<AppLogoProps> = ({
  width = 200,
  height = 200,
  showText = true,
  variant = 'full',
}) => {
  const viewBox = '0 0 512 512';

  const getColors = () => {
    if (variant === 'mono') {
      return {
        primary: '#000000',
        heart: '#000000',
        accent: '#000000',
        bgOpacity: 0.05,
        heartOpacity: 0.7,
        accentOpacity: 0.3,
      };
    }
    return {
      primary: '#2E7D32',
      heart: '#E53935',
      accent: '#4CAF50',
      bgOpacity: 0.1,
      heartOpacity: 0.9,
      accentOpacity: 0.6,
    };
  };

  const colors = getColors();

  if (!showText || variant === 'mark') {
    // Mark/Icon only version
    return (
      <View style={[styles.container, {width, height}]}>
        <Svg width={width} height={height} viewBox="0 0 512 512">
          {/* Background Circle */}
          <Circle
            cx="256"
            cy="256"
            r="240"
            fill={colors.primary}
            opacity={colors.bgOpacity}
          />

          {/* Main Medical Cross */}
          <G transform="translate(256, 256)">
            {/* Vertical bar */}
            <Rect
              x="-40"
              y="-140"
              width="80"
              height="280"
              rx="12"
              fill={colors.primary}
            />
            {/* Horizontal bar */}
            <Rect
              x="-140"
              y="-40"
              width="280"
              height="80"
              rx="12"
              fill={colors.primary}
            />

            {/* Heart symbol in center */}
            <Path
              d="M 0,-20 C -12,-35 -30,-35 -38,-20 C -45,-8 -45,8 -30,23 L 0,45 L 30,23 C 45,8 45,-8 38,-20 C 30,-35 12,-35 0,-20 Z"
              fill={colors.heart}
              opacity={colors.heartOpacity}
            />
          </G>

          {/* Decorative elements */}
          <Circle cx="120" cy="120" r="12" fill={colors.accent} opacity={colors.accentOpacity} />
          <Circle cx="392" cy="120" r="12" fill={colors.accent} opacity={colors.accentOpacity} />
          <Circle cx="120" cy="392" r="12" fill={colors.accent} opacity={colors.accentOpacity} />
          <Circle cx="392" cy="392" r="12" fill={colors.accent} opacity={colors.accentOpacity} />
        </Svg>
      </View>
    );
  }

  // Full logo with text
  return (
    <View style={[styles.container, {width, height}]}>
      <Svg width={width} height={height} viewBox={viewBox}>
        {/* Background Circle */}
        <Circle
          cx="256"
          cy="256"
          r="240"
          fill={colors.primary}
          opacity={colors.bgOpacity}
        />

        {/* Main Medical Cross */}
        <G transform="translate(256, 256)">
          {/* Vertical bar */}
          <Rect
            x="-30"
            y="-100"
            width="60"
            height="200"
            rx="8"
            fill={colors.primary}
          />
          {/* Horizontal bar */}
          <Rect
            x="-100"
            y="-30"
            width="200"
            height="60"
            rx="8"
            fill={colors.primary}
          />

          {/* Heart symbol in center */}
          <Path
            d="M 0,-15 C -8,-25 -20,-25 -25,-15 C -30,-5 -30,5 -20,15 L 0,30 L 20,15 C 30,5 30,-5 25,-15 C 20,-25 8,-25 0,-15 Z"
            fill={colors.heart}
            opacity={colors.heartOpacity}
          />
        </G>

        {/* Decorative elements */}
        <Circle cx="140" cy="140" r="8" fill={colors.accent} opacity={colors.accentOpacity} />
        <Circle cx="372" cy="140" r="8" fill={colors.accent} opacity={colors.accentOpacity} />
        <Circle cx="140" cy="372" r="8" fill={colors.accent} opacity={colors.accentOpacity} />
        <Circle cx="372" cy="372" r="8" fill={colors.accent} opacity={colors.accentOpacity} />

        {/* Text: SHALOM */}
        <SvgText
          x="256"
          y="420"
          fontSize="48"
          fontWeight="bold"
          textAnchor="middle"
          fill={colors.primary}>
          SHALOM
        </SvgText>

        {/* Subtitle */}
        <SvgText
          x="256"
          y="455"
          fontSize="24"
          textAnchor="middle"
          fill="#666666">
          Santé · Dispensaires
        </SvgText>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AppLogo;
