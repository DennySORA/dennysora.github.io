import type { Locator, Page } from '@playwright/test';

export const origin = 'http://127.0.0.1:4174';

/** WCAG contrast of an element's text against the first opaque background behind it. */
export function contrastOf(
  locator: Locator,
  property: 'color' | 'outline-color' = 'color',
) {
  return locator.evaluate((element, colourProperty) => {
    const parse = (value: string) => {
      const numbers = value.match(/[\d.]+/g)?.map(Number) ?? [];
      return { rgb: numbers.slice(0, 3), alpha: numbers[3] ?? 1 };
    };
    const luminance = (rgb: number[]) => {
      const [r = 0, g = 0, b = 0] = rgb.map((channel) => {
        const value = channel / 255;
        return value <= 0.03928
          ? value / 12.92
          : ((value + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    let node: Element | null = element;
    let background = parse('rgb(11, 16, 32)');
    while (node) {
      const colour = parse(getComputedStyle(node).backgroundColor);
      if (colour.alpha >= 1) {
        background = colour;
        break;
      }
      node = node.parentElement;
    }
    const foreground = parse(
      getComputedStyle(element).getPropertyValue(colourProperty),
    );
    const [light, dark] = [
      luminance(foreground.rgb),
      luminance(background.rgb),
    ].sort((a, b) => b - a);
    return ((light ?? 0) + 0.05) / ((dark ?? 0) + 0.05);
  }, property);
}

export function trackExternalRequests(page: Page) {
  const external: string[] = [];
  page.on('request', (request) => {
    if (
      !request.url().startsWith(origin + '/') &&
      !request.url().startsWith('data:')
    )
      external.push(request.url());
  });
  return external;
}
