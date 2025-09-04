// Plugin loader for DataWedge
(function() {
    'use strict';
    
    console.log('DataWedge plugin loader starting...');
    console.log('Capacitor available:', !!window.Capacitor);
    
    // Register the plugin with Capacitor
    if (window.Capacitor) {
        console.log('Capacitor.Plugins:', window.Capacitor.Plugins);
        console.log('Available plugins:', Object.keys(window.Capacitor.Plugins || {}));
        
        // The plugin should be available through Capacitor.Plugins after native registration
        const checkPlugin = () => {
            // Check if plugin is registered natively
            if (window.Capacitor.Plugins && window.Capacitor.Plugins.DataWedge) {
                window.DataWedge = window.Capacitor.Plugins.DataWedge;
                console.log('DataWedge plugin found in Capacitor.Plugins');
                console.log('DataWedge methods:', Object.keys(window.DataWedge));
                window.dispatchEvent(new Event('datawedge-ready'));
                return true;
            }
            
            // Try to register it manually if available
            if (window.Capacitor.registerPlugin) {
                try {
                    window.DataWedge = window.Capacitor.registerPlugin('DataWedge');
                    console.log('DataWedge plugin registered manually');
                    console.log('DataWedge methods:', Object.keys(window.DataWedge || {}));
                    window.dispatchEvent(new Event('datawedge-ready'));
                    return true;
                } catch (e) {
                    console.log('Failed to register plugin:', e);
                }
            }
            
            return false;
        };
        
        // Try immediately
        if (!checkPlugin()) {
            // Retry a few times
            let retries = 0;
            const interval = setInterval(() => {
                if (checkPlugin() || retries++ > 10) {
                    clearInterval(interval);
                    if (retries > 10) {
                        console.error('DataWedge plugin could not be loaded after 10 retries');
                    }
                }
            }, 500);
        }
    } else {
        console.error('Capacitor not found');
    }
})();