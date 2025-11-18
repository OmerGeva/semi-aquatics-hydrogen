import type {ScriptHTMLAttributes} from 'react';

type ScriptProps = ScriptHTMLAttributes<HTMLScriptElement> & {
  strategy?: 'afterInteractive' | 'lazyOnload' | 'worker';
};

/**
 * Minimal shim for Next.js <Script>. The `strategy` prop is ignored.
 */
export default function Script({children, strategy: _strategy, ...rest}: ScriptProps) {
  if (typeof children === 'string') {
    return (
      <script
        {...rest}
        dangerouslySetInnerHTML={{
          __html: children,
        }}
      />
    );
  }
  return <script {...rest}>{children}</script>;
}
