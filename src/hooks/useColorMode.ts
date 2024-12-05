// 主题色

import { ref, Ref, watch } from 'vue';
type ColorModeType = 'auto' | 'light' | 'dark';

export const useColorMode = (): Ref<ColorModeType> => {
  const colorMode = ref<ColorModeType>(
    utools.dbStorage.getItem('/key/color-mode') || 'auto'
  );

  function onAutoColor() {
    if (colorMode.value != 'auto') {
      return;
    }
    document.body.setAttribute(
      'arco-theme',
      utools.isDarkColors() ? 'dark' : 'light'
    );
  }

  window
    .matchMedia('(prefers-color-scheme:dark)')
    .addEventListener('change', onAutoColor);

  function renderColorMode() {
    if (colorMode.value === 'light') {
      document.body.setAttribute('arco-theme', 'light');
    } else if (colorMode.value === 'dark') {
      document.body.setAttribute('arco-theme', 'dark');
    } else {
      document.body.setAttribute(
        'arco-theme',
        utools.isDarkColors() ? 'dark' : 'light'
      );
    }
  }

  renderColorMode();

  watch(colorMode, (val) => {
    utools.dbStorage.setItem('/key/color-mode', val);
    renderColorMode();
  });

  return colorMode;
};
