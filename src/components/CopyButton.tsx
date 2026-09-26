import { useEffect, useRef, useState } from 'react';
import { Icon, type IconName } from './Icon.tsx';

/** Copies one value on request and reports the real outcome; hidden without JavaScript. */
export function CopyButton({
  value,
  label,
  success,
  failure,
  variant = 'button',
  icon,
}: {
  value: string;
  label: string;
  success: string;
  failure: string;
  variant?: 'button' | 'text';
  icon?: IconName;
}) {
  const [state, setState] = useState<'idle' | 'success' | 'danger'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  function settle(next: 'success' | 'danger') {
    setState(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(
      () => setState('idle'),
      next === 'success' ? 2500 : 5000,
    );
  }
  return (
    <>
      <button
        type="button"
        className={`${variant === 'text' ? 'text-button' : 'button button-quiet'} requires-js`}
        data-status={state === 'idle' ? undefined : state}
        onClick={() => {
          if (!navigator.clipboard) return settle('danger');
          navigator.clipboard.writeText(value).then(
            () => settle('success'),
            () => settle('danger'),
          );
        }}
      >
        {icon ? (
          <Icon name={state === 'success' ? 'check' : icon} size={16} />
        ) : null}
        {state === 'success' ? success : state === 'danger' ? failure : label}
      </button>
      <span className="sr-only" role="status">
        {state === 'success' ? success : state === 'danger' ? failure : ''}
      </span>
    </>
  );
}
