/**
 * External Links Handler
 * - Adds target="_blank" and rel="noopener noreferrer" to all external links
 * - Adds external link icon to external links (except image-only links)
 */

(function() {
  'use strict';

  function isExternalLink(link) {
    // Get the current domain
    const currentDomain = window.location.hostname;

    // Parse the link's hostname
    try {
      const linkUrl = new URL(link.href);
      return linkUrl.hostname !== currentDomain;
    } catch (e) {
      // If URL parsing fails, it's likely a relative link
      return false;
    }
  }

  function shouldExcludeIcon(link) {
    // Skip if link contains an image (avatar, logo, etc.)
    if (link.querySelector('img')) {
      return true;
    }

    // Skip if link is an image itself
    if (link.classList.contains('navbar-brand') ||
        link.classList.contains('avatar-img') ||
        link.hasAttribute('data-no-external-icon')) {
      return true;
    }

    // Skip social share buttons
    if (link.closest('.social-share, .share-button, .social-networks-links')) {
      return true;
    }

    // Skip if already has an icon
    if (link.querySelector('.external-link-icon')) {
      return true;
    }

    return false;
  }

  function addExternalLinkAttributes() {
    // Get all links on the page
    const links = document.querySelectorAll('a[href]');

    links.forEach(function(link) {
      // Skip if it's not an external link
      if (!isExternalLink(link)) {
        return;
      }

      // Add target="_blank" and security attributes
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');

      // Skip adding icon if should be excluded
      if (shouldExcludeIcon(link)) {
        return;
      }

      // Add external link icon
      const icon = document.createElement('i');
      icon.className = 'fa-solid fa-arrow-up-right-from-square external-link-icon';
      icon.style.fontSize = '0.75em';
      icon.style.marginLeft = '3px';
      icon.style.opacity = '0.6';
      icon.style.verticalAlign = 'super';
      icon.style.display = 'inline-block';

      // Add different styling for navigation vs content links
      // if (link.closest('.navbar-nav, .navbar-custom, nav')) {
      //   icon.style.fontSize = '0.5em';
      //   icon.style.marginLeft = '1px';
      //   icon.style.opacity = '0.7';
      // }

      link.appendChild(icon);
    });
  }

  // Run on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addExternalLinkAttributes);
  } else {
    addExternalLinkAttributes();
  }

  // Also run on window load as fallback
  window.addEventListener('load', addExternalLinkAttributes);

  // Observe for dynamically added links
  if (typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver(function(mutations) {
      let shouldUpdate = false;

      mutations.forEach(function(mutation) {
        if (mutation.addedNodes.length) {
          mutation.addedNodes.forEach(function(node) {
            if (node.nodeType === 1) { // Element node
              // Check if the node itself is a link or contains links
              if (node.tagName === 'A' || node.querySelectorAll('a[href]').length > 0) {
                shouldUpdate = true;
              }
            }
          });
        }
      });

      if (shouldUpdate) {
        addExternalLinkAttributes();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
})();
