// Custom script to initialize Prism features
document.addEventListener('DOMContentLoaded', (event) => {
  // Configure Autoloader to use CDN
  if (Prism && Prism.plugins && Prism.plugins.autoloader) {
    Prism.plugins.autoloader.languages_path = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/';
  }

  // Add 'line-numbers' class to all pre tags that are children of code blocks or standalone
  // Kramdown with disable syntax highlighting usually produces <pre><code class="language-...">
  
  var preTags = document.querySelectorAll('pre');
  preTags.forEach(function(pre) {
    if (!pre.classList.contains('line-numbers')) {
       pre.classList.add('line-numbers');
    }
  });

  // Re-run highlight if needed (usually Autoloader handles this)
  if (typeof Prism !== 'undefined') {
      Prism.highlightAll();
  }
});
