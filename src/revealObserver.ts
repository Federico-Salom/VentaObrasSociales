const observedElements = new Set<Element>();

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

export const observeRevealElements = () => {
  if (typeof window === 'undefined') return;
  observedElements.forEach((el) => observer.unobserve(el));
  observedElements.clear();
  document.querySelectorAll('.reveal').forEach((el) => {
    observer.observe(el);
    observedElements.add(el);
  });
};