import React, { useMemo } from 'react';

const Star: React.FC<{ style: React.CSSProperties }> = ({ style }) => (
    <div className="absolute rounded-full bg-white" style={style}></div>
);

const StarryBackground: React.FC = () => {
    const stars = useMemo(() => {
        return Array.from({ length: 100 }).map((_, i) => {
            const size = Math.random() * 1.5 + 0.5; // Star size between 0.5px and 2px
            const style = {
                width: `${size}px`,
                height: `${size}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationName: 'twinkle',
                animationDuration: `${Math.random() * 5 + 3}s`, // Duration between 3s and 8s
                animationDelay: `${Math.random() * 5}s`,
                animationIterationCount: 'infinite',
                opacity: Math.random() * 0.5 + 0.2, // Initial opacity
            };
            return <Star key={i} style={style} />;
        });
    }, []);

    return (
        <div className="fixed inset-0 -z-20 pointer-events-none">
            {stars}
        </div>
    );
};

export default StarryBackground;
