export const gentleEase = [0.22, 1, 0.36, 1] as const;
export const pageVariants = {
  initial: { opacity: 0, y: 12, filter: 'blur(3px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.5, ease: gentleEase } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};
export const reveal = { initial: { opacity: 0, y: 18 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.15 }, transition: { duration: 0.65, ease: gentleEase } };
