import { motion } from 'framer-motion';

interface BlobProps {
  className?: string;
  color: string;
  delay?: number;
  duration?: number;
}

const Blob = ({ className = '', color, delay = 0, duration = 20 }: BlobProps) => (
  <motion.svg
    initial={{ opacity: 0, scale: 0.8 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 1.2, delay: delay * 0.2 }}
    className={`absolute pointer-events-none ${className}`}
    viewBox="0 0 200 200"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill={`hsl(var(--${color}) / 0.08)`}
      d="M44.7,-76.4C58.8,-69.2,71.8,-58.9,80.1,-45.5C88.5,-32.1,92.2,-15.5,90.6,-0.9C89,13.7,82.1,27.4,73.3,39.6C64.5,51.8,53.8,62.5,41,70.3C28.2,78.1,13.4,83,-1.8,86C-17,89,-34.7,90.1,-47.3,82.3C-59.9,74.5,-67.4,57.8,-74.2,42C-81,26.2,-87.1,11.4,-86.5,-3.1C-85.9,-17.6,-78.6,-31.8,-68.9,-43.5C-59.2,-55.2,-47.1,-64.4,-34,-71.3C-20.9,-78.2,-6.8,-82.8,5.8,-82.3C18.4,-81.8,30.6,-83.6,44.7,-76.4Z"
      transform="translate(100 100)"
    >
      <animateTransform
        attributeName="transform"
        type="rotate"
        from="0 100 100"
        to="360 100 100"
        dur={`${duration}s`}
        repeatCount="indefinite"
      />
    </path>
  </motion.svg>
);

const Blob2 = ({ className = '', color, delay = 0, duration = 25 }: BlobProps) => (
  <motion.svg
    initial={{ opacity: 0, scale: 0.8 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 1.2, delay: delay * 0.2 }}
    className={`absolute pointer-events-none ${className}`}
    viewBox="0 0 200 200"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill={`hsl(var(--${color}) / 0.06)`}
      d="M39.9,-65.7C53.4,-60.5,67,-52.3,74.8,-40.2C82.6,-28.1,84.6,-12.1,82.3,2.8C80,17.7,73.4,31.5,64.1,42.7C54.8,53.9,42.8,62.5,29.6,68.5C16.4,74.5,2,77.9,-13.1,77.6C-28.2,77.3,-44,73.3,-55.6,64C-67.2,54.7,-74.6,40.1,-78.6,24.8C-82.6,9.5,-83.2,-6.5,-78.5,-20.5C-73.8,-34.5,-63.8,-46.5,-51.3,-52.3C-38.8,-58.1,-23.8,-57.7,-10.3,-60.5C3.2,-63.3,26.4,-70.9,39.9,-65.7Z"
      transform="translate(100 100)"
    >
      <animateTransform
        attributeName="transform"
        type="rotate"
        from="360 100 100"
        to="0 100 100"
        dur={`${duration}s`}
        repeatCount="indefinite"
      />
    </path>
  </motion.svg>
);

const Blob3 = ({ className = '', color, delay = 0, duration = 22 }: BlobProps) => (
  <motion.svg
    initial={{ opacity: 0, scale: 0.8 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 1.2, delay: delay * 0.2 }}
    className={`absolute pointer-events-none ${className}`}
    viewBox="0 0 200 200"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill={`hsl(var(--${color}) / 0.07)`}
      d="M47.7,-79.1C62.1,-72.2,74.2,-60.1,81.7,-45.7C89.2,-31.3,92.1,-14.7,89.8,-0.1C87.5,14.5,80,31,70.3,44.3C60.6,57.6,48.7,67.7,35.1,74.1C21.5,80.5,6.2,83.2,-8.7,81.7C-23.6,80.2,-38.1,74.5,-50.7,65.7C-63.3,56.9,-74,45,-80,31C-86,17,-87.3,0.9,-83.7,-13.4C-80.1,-27.7,-71.6,-40.2,-60.6,-48.8C-49.6,-57.4,-36.1,-62.1,-23.3,-70.1C-10.5,-78.1,1.6,-89.4,15.3,-91.5C29,-93.6,33.3,-86,47.7,-79.1Z"
      transform="translate(100 100)"
    >
      <animateTransform
        attributeName="transform"
        type="rotate"
        from="0 100 100"
        to="360 100 100"
        dur={`${duration}s`}
        repeatCount="indefinite"
      />
    </path>
  </motion.svg>
);

// Preset configurations for each section
export const FeatureBlobs = () => (
  <>
    <Blob color="pop-yellow" className="w-[500px] h-[500px] -top-40 -left-60" delay={0} duration={18} />
    <Blob2 color="pop-violet" className="w-[400px] h-[400px] top-1/3 -right-48" delay={1} duration={24} />
    <Blob3 color="pop-coral" className="w-[350px] h-[350px] -bottom-20 left-1/4" delay={2} duration={20} />
  </>
);

export const ComparisonBlobs = () => (
  <>
    <Blob2 color="pop-cyan" className="w-[450px] h-[450px] -top-32 -right-40" delay={0} duration={22} />
    <Blob color="pop-pink" className="w-[380px] h-[380px] bottom-0 -left-48" delay={1} duration={26} />
  </>
);

export const TestimonialBlobs = () => (
  <>
    <Blob3 color="pop-lime" className="w-[420px] h-[420px] -top-20 -left-40" delay={0} duration={19} />
    <Blob color="pop-coral" className="w-[350px] h-[350px] top-1/2 -right-32" delay={1} duration={23} />
    <Blob2 color="pop-violet" className="w-[300px] h-[300px] -bottom-24 left-1/3" delay={2} duration={28} />
  </>
);

export const PricingBlobs = () => (
  <>
    <Blob color="pop-yellow" className="w-[500px] h-[500px] -top-48 left-1/4" delay={0} duration={20} />
    <Blob3 color="pop-violet" className="w-[450px] h-[450px] -bottom-40 -right-32" delay={1} duration={25} />
    <Blob2 color="pop-cyan" className="w-[380px] h-[380px] top-1/3 -left-48" delay={2} duration={17} />
  </>
);

export const CtaBlobs = () => (
  <>
    <Blob2 color="pop-pink" className="w-[400px] h-[400px] -top-32 -left-32" delay={0} duration={21} />
    <Blob color="pop-yellow" className="w-[350px] h-[350px] -bottom-20 -right-24" delay={1} duration={18} />
  </>
);
