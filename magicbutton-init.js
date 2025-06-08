/**
 * Magic Button Player V2 - Quick Start Script
 * 
 * Add this script to your website to enable Magic Button Player integration.
 * Configure with window.MagicButtonConfig before including this script.
 */
(function() {
  'use strict';
  
  // Auto-detection and initialization
  if (typeof window !== 'undefined' && !window.MagicButton) {
    // Set auto-init flag
    window.MagicButtonAutoInit = true;
    
    // Load the main SDK
    var script = document.createElement('script');
    script.src = 'https://cdn.magicbutton.cloud/sdk/v2/magicbutton-sdk.umd.js';
    script.async = true;
    script.onload = function() {
      console.log('[MagicButton] SDK loaded and ready');
    };
    script.onerror = function() {
      console.warn('[MagicButton] Failed to load SDK');
    };
    document.head.appendChild(script);
  }
})();