import React from 'react';

export const SparkleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69a.75.75 0 01.981.981A10.503 10.503 0 0118 19.5a10.5 10.5 0 01-10.5-10.5c0-1.562.32-3.056.898-4.434a.75.75 0 01.818-.162z" clipRule="evenodd" />
        <path fillRule="evenodd" d="M11.472 2.372a.75.75 0 01.098 1.06l-2.1 2.94a.75.75 0 01-1.156.098l-2.94-2.1a.75.75 0 011.06-.098l2.94 2.1 2.1-2.94a.75.75 0 01.098-1.06zM19.24 8.76a.75.75 0 01.098 1.06l-2.1 2.94a.75.75 0 01-1.156.098l-2.94-2.1a.75.75 0 11.958-1.156l2.94 2.1 2.1-2.94a.75.75 0 011.06-.098zM21.628 13.81a.75.75 0 01.098 1.06l-2.1 2.94a.75.75 0 01-1.156.098l-2.94-2.1a.75.75 0 11.958-1.156l2.94 2.1 2.1-2.94a.75.75 0 011.06-.098z" clipRule="evenodd" />
    </svg>
);

export const SpeakerOnIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.348 2.595.341 1.24 1.518 1.905 2.66 1.905H6.44l4.5 4.5c.945.945 2.56.276 2.56-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 01-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
        <path d="M15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" />
    </svg>
);

export const SpeakerOffIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.348 2.595.341 1.24 1.518 1.905 2.66 1.905H6.44l4.5 4.5c.945.945 2.56.276 2.56-1.06V4.06zM17.78 9.22a.75.75 0 10-1.06 1.06L18.94 12l-2.22 2.22a.75.75 0 101.06 1.06L20 13.06l2.22 2.22a.75.75 0 101.06-1.06L21.06 12l2.22-2.22a.75.75 0 10-1.06-1.06L20 10.94l-2.22-2.22z" />
    </svg>
);

export const HeartSparkleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-1.383-.597 15.246 15.246 0 01-4.244-3.17c-1.186-1.258-2.224-2.637-2.9-4.016-1.24-2.652-1.3-5.26-.06-7.728s2.83-4.274 5.39-4.274c1.47 0 2.848.56 3.896 1.562 1.047-1.002 2.426-1.562 3.896-1.562 2.56 0 4.829 1.834 5.45 4.274.54 2.468.48 5.076-.06 7.728-.676 1.378-1.714 2.756-2.9 4.015-1.518 1.62-3.23 2.768-4.243 3.17-.5.22-1.003.39-1.383.596l-.022.012-.007.004-.004.002a.75.75 0 01-.652 0l-.003-.002z" />
    </svg>
);

export const LoadingIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    className="animate-spin"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

const MoonIconSvg: React.FC<{ defs: React.ReactNode, path: string }> = ({ defs, path }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
        {defs}
        <path d={path} filter="url(#glow)" />
    </svg>
);

const moonDefs = (
    <defs>
        <radialGradient id="moonTexture" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" style={{ stopColor: '#f0f0f0', stopOpacity: 1 }} />
            <stop offset="80%" style={{ stopColor: '#d0d0d0', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#b0b0b0', stopOpacity: 1 }} />
        </radialGradient>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur" />
            <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
            </feMerge>
        </filter>
    </defs>
);

const MoonIcons = {
    NewMoon: () => <MoonIconSvg defs={moonDefs} path="M50,50 m-40,0 a40,40 0 1,0 80,0 a40,40 0 1,0 -80,0 Z" />,
    WaxingCrescent: () => <MoonIconSvg defs={moonDefs} path="M50,10 a40,40 0 1,0 0,80 a25,40 0 0,0 0-80 Z" />,
    FirstQuarter: () => <MoonIconSvg defs={moonDefs} path="M50,10 a40,40 0 0,0 0,80 V10 Z" />,
    WaxingGibbous: () => <MoonIconSvg defs={moonDefs} path="M50,10 a40,40 0 1,1 0,80 a25,40 0 0,0 0-80 Z" />,
    FullMoon: () => <MoonIconSvg defs={moonDefs} path="M50,10 a40,40 0 1,0 0,80 a40,40 0 1,0 0-80 Z" />,
    WaningGibbous: () => <MoonIconSvg defs={moonDefs} path="M50,10 a40,40 0 1,0 0,80 a25,40 0 0,1 0-80 Z" />,
    LastQuarter: () => <MoonIconSvg defs={moonDefs} path="M50,10 a40,40 0 0,1 0,80 V10 Z" />,
    WaningCrescent: () => <MoonIconSvg defs={moonDefs} path="M50,10 a40,40 0 1,1 0,80 a25,40 0 0,1 0-80 Z" />,
};

type MoonIconKeys = 'NewMoon' | 'WaxingCrescent' | 'FirstQuarter' | 'WaxingGibbous' | 'FullMoon' | 'WaningGibbous' | 'LastQuarter' | 'WaningCrescent';

export const MoonIcon: React.FC<{ iconKey: MoonIconKeys } & React.HTMLAttributes<HTMLDivElement>> = ({ iconKey, ...props }) => {
    const IconComponent = MoonIcons[iconKey];
    return (
        <div {...props}>
             <div className="w-full h-full" style={{ fill: 'url(#moonTexture)', color: '#a855f7' }}>
                 {IconComponent ? <IconComponent /> : null}
            </div>
        </div>
    );
};

export const LockIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
    </svg>
);

export const ShareIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M15.75 4.5a3 3 0 013 3v10.5a3 3 0 01-3 3h-9a3 3 0 01-3-3V7.5a3 3 0 013-3h9zm-9 3.75A.75.75 0 016 9v8.25a.75.75 0 01-.75.75h-.008a.75.75 0 01-.75-.75V9A.75.75 0 016 8.25h.75zM16.5 9a.75.75 0 00-.75-.75h-1.5a.75.75 0 000 1.5h1.5a.75.75 0 00.75-.75z" clipRule="evenodd" />
  </svg>
);

export const CopyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M11.03 2.59a1.5 1.5 0 011.94 0l7.5 6.363a1.5 1.5 0 01.53 1.144V18a1.5 1.5 0 01-1.5 1.5h-2.25a.75.75 0 010-1.5h2.25V10.5H12v8.25a.75.75 0 01-1.5 0V10.5H3.75v7.5h2.25a.75.75 0 010 1.5H3.75A1.5 1.5 0 012.25 18V10.097a1.5 1.5 0 01.53-1.144l7.5-6.363zM12 7.5a1.5 1.5 0 011.5 1.5v3a1.5 1.5 0 11-3 0v-3a1.5 1.5 0 011.5-1.5z" clipRule="evenodd" />
  </svg>
);
