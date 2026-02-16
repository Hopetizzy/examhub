import React, { useEffect, useRef, useState } from 'react';

interface ScrollAnimationProps {
    children: React.ReactNode;
    animation?: 'fade-in' | 'slide-up' | 'slide-left' | 'slide-right' | 'scale-up';
    duration?: number;
    delay?: number;
    className?: string;
    threshold?: number; // 0 to 1 (percentage of visibility to trigger)
}

export const ScrollAnimation: React.FC<ScrollAnimationProps> = ({
    children,
    animation = 'slide-up',
    duration = 0.6,
    delay = 0,
    className = '',
    threshold = 0.1
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const domRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    // Optional: Unobserve after triggering if you only want it once
                    // if (domRef.current) observer.unobserve(domRef.current);
                }
            });
        }, { threshold });

        const currentRef = domRef.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [threshold]);

    const getAnimationClass = () => {
        if (!isVisible) return 'opacity-0 translate-y-8'; // Initial state (hidden & shifted)

        // Final state (visible & reset)
        return `opacity-100 translate-y-0 transition-all ease-out`;
    };

    return (
        <div
            ref={domRef}
            className={`${getAnimationClass()} ${className}`}
            style={{
                transitionDuration: `${duration}s`,
                transitionDelay: `${delay}s`
            }}
        >
            {children}
        </div>
    );
};
