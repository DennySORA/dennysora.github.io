import { useEffect, useRef } from 'react';
import { dictionaries, type Locale } from '../i18n/index.ts';

/**
 * Renders build-time sanitized HTML. Copy buttons are progressive enhancement:
 * without JavaScript the code stays selectable and the toolbar keeps its label.
 */
export function Prose({ html, locale }: { html: string; locale: Locale }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const t = dictionaries[locale];
    const cleanups: (() => void)[] = [];
    for (const block of ref.current?.querySelectorAll<HTMLElement>(
      '.code-block',
    ) ?? []) {
      const toolbar = block.querySelector('.code-toolbar');
      const code = block.querySelector('code');
      if (!toolbar || !code) continue;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'copy-button';
      button.textContent = t.copyCode;
      const status = document.createElement('span');
      status.className = 'sr-only';
      status.setAttribute('role', 'status');
      let timer: ReturnType<typeof setTimeout> | undefined;
      const settle = (state: 'success' | 'danger') => {
        button.dataset['status'] = state;
        button.textContent = state === 'success' ? t.copied : t.copyFailedShort;
        status.textContent = state === 'success' ? t.copied : t.copyError;
        clearTimeout(timer);
        timer = setTimeout(
          () => {
            delete button.dataset['status'];
            button.textContent = t.copyCode;
            status.textContent = '';
          },
          state === 'success' ? 2000 : 5000,
        );
      };
      const copy = () => {
        // Report success only after the clipboard actually accepted the text.
        if (!navigator.clipboard) return settle('danger');
        navigator.clipboard.writeText(code.textContent ?? '').then(
          () => settle('success'),
          () => settle('danger'),
        );
      };
      button.addEventListener('click', copy);
      toolbar.append(button, status);
      cleanups.push(() => {
        clearTimeout(timer);
        button.removeEventListener('click', copy);
        button.remove();
        status.remove();
      });
    }
    return () => {
      for (const cleanup of cleanups) cleanup();
    };
  }, [html, locale]);
  return (
    <div
      ref={ref}
      className="prose"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
