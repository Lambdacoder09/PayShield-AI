import { useEffect, useRef } from 'react';
import { animate } from 'animejs';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export default function AnimatedCounter({
  value,
  duration = 800,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
}: AnimatedCounterProps) {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const prevValRef = useRef<number>(0);

  useEffect(() => {
    if (!nodeRef.current) return;
    const obj = { val: prevValRef.current };

    animate(obj, {
      val: value,
      duration: duration,
      ease: 'outExpo',
      onUpdate: () => {
        if (nodeRef.current) {
          const formatted = decimals > 0 ? obj.val.toFixed(decimals) : Math.round(obj.val).toLocaleString();
          nodeRef.current.textContent = `${prefix}${formatted}${suffix}`;
        }
      },
    });

    prevValRef.current = value;
  }, [value, duration, decimals, prefix, suffix]);

  return <span ref={nodeRef} className={className}>{prefix}{value}{suffix}</span>;
}
