// Performance monitoring script
(function() {
    'use strict';
    
    // Only run if performance API is available
    if (!window.performance) return;
    
    // Performance metrics collection
    const performanceMetrics = {
        pageLoadTime: 0,
        domContentLoaded: 0,
        firstPaint: 0,
        firstContentfulPaint: 0
    };
    
    // Measure page load time
    window.addEventListener('load', function() {
        const loadTime = performance.now();
        performanceMetrics.pageLoadTime = loadTime;
        
        // Log performance data (only in development)
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.log('Performance Metrics:', performanceMetrics);
        }
    });
    
    // Measure DOM content loaded
    document.addEventListener('DOMContentLoaded', function() {
        performanceMetrics.domContentLoaded = performance.now();
    });
    
    // Measure paint times if available
    if (window.performance.getEntriesByType) {
        const paintEntries = performance.getEntriesByType('paint');
        paintEntries.forEach(entry => {
            if (entry.name === 'first-paint') {
                performanceMetrics.firstPaint = entry.startTime;
            }
            if (entry.name === 'first-contentful-paint') {
                performanceMetrics.firstContentfulPaint = entry.startTime;
            }
        });
    }
    
    // Optimize scroll performance
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
        scrollTimeout = setTimeout(function() {
            // Handle scroll events efficiently
        }, 16); // ~60fps
    }, { passive: true });
    
    // Optimize resize performance
    let resizeTimeout;
    window.addEventListener('resize', function() {
        if (resizeTimeout) {
            clearTimeout(resizeTimeout);
        }
        resizeTimeout = setTimeout(function() {
            // Handle resize events efficiently
        }, 100);
    }, { passive: true });
    
})(); 