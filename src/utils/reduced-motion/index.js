let forced = false;

// Check if the user prefers reduced motion settings
const reducedMotion = () => {
  return (
    window.matchMedia('(prefers-reduced-motion: reduce)').matches || forced
  );
};

// override, mainly for testing
// possible for user settings if we need that at some point
reducedMotion.force = () => (forced = true);

export default reducedMotion;
