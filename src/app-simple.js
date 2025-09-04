// Simple approach without ES6 modules - all in one file
(function() {
    'use strict';
    
    // Wait for the plugin to be ready
    window.addEventListener('datawedge-ready', async () => {
        console.log('DataWedge ready event received');
        await initializePlugin();
    });
    
    // Also try on DOM ready as fallback
    document.addEventListener('DOMContentLoaded', async () => {
        // Give plugin loader time to work
        setTimeout(async () => {
            if (window.DataWedge) {
                await initializePlugin();
            }
        }, 1000);
    });
    
    let initialized = false;
    
    async function initializePlugin() {
        if (initialized) return;
        
        try {
            if (!window.DataWedge) {
                window.log('DataWedge plugin not available yet', 'error');
                return;
            }
            
            initialized = true;
            
            await setupEventListeners();
            await loadInitialData();
            defineAllFunctions();
            
            window.log('DataWedge plugin initialized successfully');
        } catch (error) {
            window.log(`Failed to initialize plugin: ${error.message}`, 'error');
            setTimeout(initializePlugin, 1000);
        }
    }
    
    async function setupEventListeners() {
        if (!window.DataWedge || !window.DataWedge.addListener) return;
        
        // Register scan listener to enable broadcast receiver
        if (window.DataWedge.registerScanListener) {
            await window.DataWedge.registerScanListener();
            window.log('Scan listener registered');
        }
        
        window.DataWedge.addListener('scanReceived', (event) => {
            const scanDisplay = document.getElementById('scan-data');
            const scanResult = document.getElementById('scan-result');
            
            if (scanResult) {
                scanResult.innerHTML = `
                    <h3>Scan Result</h3>
                    <p><strong>Data:</strong> ${event.data}</p>
                    <p><strong>Type:</strong> ${event.labelType}</p>
                    <p><strong>Time:</strong> ${new Date(event.timestamp).toLocaleTimeString()}</p>
                `;
            }
            
            if (scanDisplay) {
                scanDisplay.innerHTML = `<pre>${JSON.stringify(event, null, 2)}</pre>`;
            }
            
            window.log(`Scan received: ${event.data} (${event.labelType})`);
        });
        
        window.DataWedge.addListener('notificationReceived', (event) => {
            const notificationMessages = document.getElementById('notification-messages');
            if (notificationMessages) {
                const message = `
                    <div class="notification-item">
                        <strong>${event.type}</strong>: ${JSON.stringify(event.data)}
                        <span class="timestamp">${new Date().toLocaleTimeString()}</span>
                    </div>
                `;
                notificationMessages.insertAdjacentHTML('afterbegin', message);
            }
            window.log(`Notification: ${event.type}`);
        });
    }
    
    async function loadInitialData() {
        try {
            // First register the scan listener to enable broadcast receiver
            if (window.DataWedge.registerScanListener) {
                await window.DataWedge.registerScanListener();
                console.log('Scan listener registered for broadcasts');
            }
            
            await window.getVersionInfo();
            await window.getDatawedgeStatus();
            await window.getScannerStatus();
            await window.getProfilesList();
            await window.enumerateScanners();
        } catch (error) {
            console.error('Error loading initial data:', error);
        }
    }
    
    function defineAllFunctions() {
        // Now redefine all functions with full implementation
        const functions = window.functionDefinitions || {};
        
        // Copy all pre-defined functions from app-functions.js
        Object.keys(functions).forEach(key => {
            if (typeof functions[key] === 'function') {
                window[key] = functions[key];
            }
        });
    }
})();