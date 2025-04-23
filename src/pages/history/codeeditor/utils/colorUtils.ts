/**
 * HEX 색상을 RGBA로 변환하는 유틸리티 함수
 */
export const hexToRgba = (hex: string, opacity: number = 0.2): string => {
  if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) {
    return `rgba(248, 255, 156, ${opacity})`;
  }

  try {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    if (isNaN(r) || isNaN(g) || isNaN(b)) {
      throw new Error('유효하지 않은 RGB 값');
    }

    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  } catch (error) {
    return `rgba(248, 255, 156, ${opacity})`;
  }
};

/**
 * RGBA 색상을 HEX로 변환하는 유틸리티 함수
 */
export const rgbaToHex = (rgba: string): string => {
  if (!rgba || typeof rgba !== 'string' || !rgba.includes('rgba')) {
    return rgba;
  }

  try {
    const rgbMatch = rgba.match(/rgba\((\d+),\s*(\d+),\s*(\d+)/);

    if (rgbMatch) {
      const [, r, g, b] = rgbMatch;
      return `#${Number(r).toString(16).padStart(2, '0')}${Number(g).toString(16).padStart(2, '0')}${Number(b).toString(16).padStart(2, '0')}`;
    }

    return rgba;
  } catch (error) {
    return rgba;
  }
};

/**
 * 하이라이트 색상 생성 함수
 */
export const getHighlightColors = (hex: string): { background: string; border?: string } => {
  return {
    background: hexToRgba(hex, 0.2),
  };
};
