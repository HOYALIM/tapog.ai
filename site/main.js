(() => {
  const logoStage = document.getElementById("logoStage");
  const worldLogo = document.getElementById("worldLogo");

  const setWorldLogoTransform = () => {
    if (!worldLogo) {
      return;
    }

    const scrollY = window.scrollY || window.pageYOffset || 0;
    const driftY = scrollY * 0.12;
    const rotate = scrollY * 0.01;
    worldLogo.style.transform = `translate3d(-50%, calc(-50% + ${driftY.toFixed(2)}px), 0) rotate(${rotate.toFixed(2)}deg)`;
  };

  setWorldLogoTransform();
  window.addEventListener("scroll", setWorldLogoTransform, { passive: true });

  if (!logoStage) {
    return;
  }

  const maxTilt = 12;

  const reset = () => {
    logoStage.style.transform = "rotateX(0deg) rotateY(0deg)";
  };

  logoStage.addEventListener("pointermove", (event) => {
    const rect = logoStage.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    const rotateY = (x - 0.5) * (maxTilt * 2);
    const rotateX = (0.5 - y) * (maxTilt * 2);

    logoStage.style.transform = `rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
  });

  logoStage.addEventListener("pointerleave", reset);
  logoStage.addEventListener("pointercancel", reset);
})();
