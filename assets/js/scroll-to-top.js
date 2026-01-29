/**
 * Scroll to Top Button
 * Shows a button in the bottom right when page is longer than viewport
 */

(function() {
  'use strict';

  // Create the button
  const button = document.createElement('button');
  button.id = 'scroll-to-top';
  button.className = 'scroll-to-top-btn';
  button.setAttribute('aria-label', 'Scroll to top');
  button.innerHTML = '<i class="fas fa-arrow-up"></i>';

  // Add button to page
  document.body.appendChild(button);

  // Show/hide button based on scroll position
  function toggleButtonVisibility() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    // Show button if page is longer than viewport and user has scrolled down
    if (documentHeight > windowHeight && scrollTop > 300) {
      button.classList.add('visible');
    } else {
      button.classList.remove('visible');
    }
  }

  // Scroll to top smoothly
  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  // Event listeners
  button.addEventListener('click', scrollToTop);
  window.addEventListener('scroll', toggleButtonVisibility);
  window.addEventListener('resize', toggleButtonVisibility);

  // Initial check
  toggleButtonVisibility();
})();
