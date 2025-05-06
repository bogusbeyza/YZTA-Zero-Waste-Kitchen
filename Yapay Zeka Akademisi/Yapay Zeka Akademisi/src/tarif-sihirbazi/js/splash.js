document.addEventListener("DOMContentLoaded", function () {
    const splashScreen = document.getElementById("splash-screen");
    const mainContent = document.getElementById("main-content");
    const splashDuration = 2000;
  

    setTimeout(function () {
      splashScreen.classList.add('hidden');
  
      splashScreen.addEventListener('transitionend', function handleTransitionEnd() {
          splashScreen.style.display = "none";
          mainContent.style.display = "block";
          splashScreen.removeEventListener('transitionend', handleTransitionEnd); // Event listener'ı kaldır
      }, { once: true });
  
    }, splashDuration);
  });