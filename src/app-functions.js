// This file defines all DataWedge functions with plugin ready checks

function createPluginFunction(fn) {
    return async function(...args) {
        if (!window.DataWedge) {
            console.log('DataWedge plugin not initialized yet. Please wait...');
            return;
        }
        return fn.apply(this, args);
    };
}

// Define all functions globally immediately
window.softScanTrigger = createPluginFunction(async function() {
    try {
        const result = await window.DataWedge.softScanTrigger({ action: 'START_SCANNING' });
        window.log('Soft scan triggered');
    } catch (error) {
        window.log(`Soft scan failed: ${error.message}`, 'error');
    }
});

window.softRfidTrigger = createPluginFunction(async function() {
    try {
        const result = await window.DataWedge.softRfidTrigger({ action: 'START_SCANNING' });
        window.log('RFID scan triggered');
    } catch (error) {
        window.log(`RFID scan failed: ${error.message}`, 'error');
    }
});

window.enableScannerInput = createPluginFunction(async function() {
    try {
        await window.DataWedge.enableScannerInput();
        window.log('Scanner input enabled');
        await window.getScannerStatus();
    } catch (error) {
        window.log(`Failed to enable scanner: ${error.message}`, 'error');
    }
});

window.disableScannerInput = createPluginFunction(async function() {
    try {
        await window.DataWedge.disableScannerInput();
        window.log('Scanner input disabled');
        await window.getScannerStatus();
    } catch (error) {
        window.log(`Failed to disable scanner: ${error.message}`, 'error');
    }
});

window.getVersionInfo = createPluginFunction(async function() {
    try {
        const result = await window.DataWedge.getVersionInfo();
        document.getElementById('version-info').innerHTML = 
            `DataWedge v${result.datawedgeVersion} | Scanner: ${result.scannerFirmware}`;
        document.getElementById('query-result').innerHTML = 
            `<h3>Version Info</h3><pre>${JSON.stringify(result, null, 2)}</pre>`;
        window.log('Version info retrieved');
    } catch (error) {
        window.log(`Failed to get version info: ${error.message}`, 'error');
    }
});

window.getDatawedgeStatus = createPluginFunction(async function() {
    try {
        const result = await window.DataWedge.getDatawedgeStatus();
        const status = result.enabled ? 'Enabled' : 'Disabled';
        // Update header status
        const statusElement = document.getElementById('scanner-status');
        if (statusElement) {
            statusElement.innerHTML = `DataWedge: ${status}`;
        }
        document.getElementById('query-result').innerHTML = 
            `<h3>DataWedge Status</h3><p>${status}</p>`;
        window.log(`DataWedge status: ${status}`);
    } catch (error) {
        window.log(`Failed to get DataWedge status: ${error.message}`, 'error');
    }
});

window.getScannerStatus = createPluginFunction(async function() {
    try {
        const result = await window.DataWedge.getScannerStatus();
        // Don't overwrite the DataWedge status, append scanner status
        const statusElement = document.getElementById('scanner-status');
        if (statusElement) {
            const currentText = statusElement.innerHTML;
            if (currentText.includes('DataWedge:')) {
                statusElement.innerHTML = `${currentText} | Scanner: ${result.status}`;
            } else {
                statusElement.innerHTML = `Scanner: ${result.status}`;
            }
        }
        document.getElementById('query-result').innerHTML = 
            `<h3>Scanner Status</h3><p>${result.status}</p>`;
        window.log(`Scanner status: ${result.status}`);
    } catch (error) {
        window.log(`Failed to get scanner status: ${error.message}`, 'error');
    }
});

window.getActiveProfile = createPluginFunction(async function() {
    try {
        const result = await window.DataWedge.getActiveProfile();
        window.currentProfile = result.profileName;
        document.getElementById('query-result').innerHTML = 
            `<h3>Active Profile</h3><p>${result.profileName}</p>`;
        window.log(`Active profile: ${result.profileName}`);
    } catch (error) {
        window.log(`Failed to get active profile: ${error.message}`, 'error');
    }
});

window.getProfilesList = createPluginFunction(async function() {
    try {
        const result = await window.DataWedge.getProfilesList();
        window.profiles = result.profiles || [];
        
        const select = document.getElementById('profile-list');
        select.innerHTML = window.profiles.map(p => `<option value="${p}">${p}</option>`).join('');
        
        document.getElementById('query-result').innerHTML = 
            `<h3>Profiles List</h3><ul>${window.profiles.map(p => `<li>${p}</li>`).join('')}</ul>`;
        window.log(`Found ${window.profiles.length} profiles`);
    } catch (error) {
        window.log(`Failed to get profiles: ${error.message}`, 'error');
    }
});

window.enumerateScanners = createPluginFunction(async function() {
    try {
        const result = await window.DataWedge.enumerateScanners();
        window.scanners = result.scanners || [];
        
        const select = document.getElementById('scanner-list');
        select.innerHTML = window.scanners.map(s => 
            `<option value="${s.index}">${s.name} (${s.connected ? 'Connected' : 'Disconnected'})</option>`
        ).join('');
        
        document.getElementById('query-result').innerHTML = 
            `<h3>Available Scanners</h3><pre>${JSON.stringify(window.scanners, null, 2)}</pre>`;
        window.log(`Found ${window.scanners.length} scanners`);
    } catch (error) {
        window.log(`Failed to enumerate scanners: ${error.message}`, 'error');
    }
});

// Define all remaining DataWedge functions with plugin check
window.createProfile = createPluginFunction(async function() {
    const profileName = document.getElementById('profile-name').value;
    if (!profileName) {
        window.log('Please enter a profile name', 'error');
        return;
    }
    
    try {
        await window.DataWedge.createProfile({ profileName });
        window.log(`Profile '${profileName}' created`);
        await window.getProfilesList();
        
        // Auto-configure the profile for scanning
        window.log('Auto-configuring profile for scanning...');
        
        // Set the new profile as selected
        document.getElementById('profile-list').value = profileName;
        
        // Configure it for scanning
        await window.setConfig();
        
    } catch (error) {
        window.log(`Failed to create profile: ${error.message}`, 'error');
    }
});

window.cloneProfile = createPluginFunction(async function() {
    const sourceName = document.getElementById('profile-list').value;
    const destinationName = document.getElementById('profile-name').value;
    
    if (!sourceName || !destinationName) {
        window.log('Please select source profile and enter destination name', 'error');
        return;
    }
    
    try {
        await window.DataWedge.cloneProfile({ sourceName, destinationName });
        window.log(`Profile '${sourceName}' cloned to '${destinationName}'`);
        await window.getProfilesList();
    } catch (error) {
        window.log(`Failed to clone profile: ${error.message}`, 'error');
    }
});

window.renameProfile = createPluginFunction(async function() {
    const currentName = document.getElementById('profile-list').value;
    const newName = document.getElementById('profile-name').value;
    
    if (!currentName || !newName) {
        window.log('Please select profile and enter new name', 'error');
        return;
    }
    
    try {
        await window.DataWedge.renameProfile({ currentName, newName });
        window.log(`Profile renamed from '${currentName}' to '${newName}'`);
        await window.getProfilesList();
    } catch (error) {
        window.log(`Failed to rename profile: ${error.message}`, 'error');
    }
});

window.deleteProfile = createPluginFunction(async function() {
    const profileName = document.getElementById('profile-list').value;
    if (!profileName) {
        window.log('Please select a profile to delete', 'error');
        return;
    }
    
    if (!confirm(`Delete profile '${profileName}'?`)) return;
    
    try {
        await window.DataWedge.deleteProfile({ profileName });
        window.log(`Profile '${profileName}' deleted`);
        await window.getProfilesList();
    } catch (error) {
        window.log(`Failed to delete profile: ${error.message}`, 'error');
    }
});

window.setConfig = createPluginFunction(async function() {
    const profileName = document.getElementById('profile-list').value;
    if (!profileName) {
        window.log('Please select a profile', 'error');
        return;
    }
    
    try {
        // Step 1: Configure Intent output
        window.log(`Configuring profile '${profileName}'...`);
        
        const intentConfig = {
            PLUGIN_CONFIG: {
                PLUGIN_NAME: "INTENT",
                RESET_CONFIG: "false",
                PARAM_LIST: {
                    intent_output_enabled: "true",
                    intent_action: "com.sapstockcount.mobile.SCAN",
                    intent_delivery: "2"  // Broadcast
                }
            }
        };
        
        await window.DataWedge.setConfig({ 
            profileName: profileName,
            profileEnabled: true,
            configMode: "UPDATE",
            config: intentConfig
        });
        window.log('Intent output configured');
        
        // Step 2: Configure app association
        const appConfig = {
            APP_LIST: [{
                packageName: "com.datawedge.demo",
                activityList: ["*"]
            }]
        };
        
        await window.DataWedge.setConfig({ 
            profileName: profileName,
            configMode: "UPDATE",
            config: appConfig
        });
        window.log('App association configured: com.datawedge.demo');
        
        // Step 3: Configure barcode decoders
        const barcodeConfig = {
            PLUGIN_CONFIG: {
                PLUGIN_NAME: "BARCODE",
                RESET_CONFIG: "false", 
                PARAM_LIST: {
                    scanner_selection: "auto",
                    decoder_ean13: "true",
                    decoder_code128: "true",
                    decoder_code39: "true",
                    decoder_qrcode: "true"
                }
            }
        };
        
        await window.DataWedge.setConfig({ 
            profileName: profileName,
            configMode: "UPDATE",
            config: barcodeConfig
        });
        window.log('Barcode decoders configured');
        
        // Switch to this profile
        await window.DataWedge.switchToProfile({ profileName });
        window.log(`Switched to profile '${profileName}'`);
        window.log('Profile fully configured for scanning!');
        
    } catch (error) {
        window.log(`Failed to set config: ${error.message}`, 'error');
    }
});

window.getConfig = createPluginFunction(async function() {
    const profileName = document.getElementById('profile-list').value;
    if (!profileName) {
        window.log('Please select a profile', 'error');
        return;
    }
    
    try {
        const result = await window.DataWedge.getConfig({ profileName });
        document.getElementById('query-result').innerHTML = 
            `<h3>Profile Config: ${profileName}</h3><pre>${JSON.stringify(result, null, 2)}</pre>`;
        window.log(`Retrieved config for '${profileName}'`);
    } catch (error) {
        window.log(`Failed to get config: ${error.message}`, 'error');
    }
});

window.enableDatawedge = createPluginFunction(async function() {
    try {
        await window.DataWedge.enableDatawedge();
        window.log('DataWedge enabled');
        await window.getDatawedgeStatus();
        await window.getScannerStatus();
    } catch (error) {
        window.log(`Failed to enable DataWedge: ${error.message}`, 'error');
    }
});

window.disableDatawedge = createPluginFunction(async function() {
    try {
        await window.DataWedge.disableDatawedge();
        window.log('DataWedge disabled');
        await window.getDatawedgeStatus();
        await window.getScannerStatus();
    } catch (error) {
        window.log(`Failed to disable DataWedge: ${error.message}`, 'error');
    }
});

window.switchToProfile = createPluginFunction(async function() {
    const profileName = document.getElementById('profile-list').value;
    if (!profileName) {
        window.log('Please select a profile', 'error');
        return;
    }
    
    try {
        await window.DataWedge.switchToProfile({ profileName });
        window.log(`Switched to profile '${profileName}'`);
        await window.getActiveProfile();
    } catch (error) {
        window.log(`Failed to switch profile: ${error.message}`, 'error');
    }
});

// Add all remaining functions
window.setDefaultProfile = createPluginFunction(async function() {
    const profileName = document.getElementById('profile-list').value;
    if (!profileName) {
        window.log('Please select a profile', 'error');
        return;
    }
    
    try {
        await window.DataWedge.setDefaultProfile({ profileName });
        window.log(`Default profile set to '${profileName}'`);
    } catch (error) {
        window.log(`Failed to set default profile: ${error.message}`, 'error');
    }
});

window.resetDefaultProfile = createPluginFunction(async function() {
    try {
        await window.DataWedge.resetDefaultProfile();
        window.log('Default profile reset');
    } catch (error) {
        window.log(`Failed to reset default profile: ${error.message}`, 'error');
    }
});

window.switchScanner = createPluginFunction(async function() {
    const scannerIndex = document.getElementById('scanner-list').value;
    if (!scannerIndex) {
        window.log('Please select a scanner', 'error');
        return;
    }
    
    try {
        await window.DataWedge.switchScanner({ scannerIndex: parseInt(scannerIndex) });
        window.log(`Switched to scanner index ${scannerIndex}`);
    } catch (error) {
        window.log(`Failed to switch scanner: ${error.message}`, 'error');
    }
});

window.notify = createPluginFunction(async function() {
    const options = {
        notificationType: "BEEP",
        duration: 1000
    };
    
    try {
        await window.DataWedge.notify({ options });
        window.log('Notification sent (beep)');
    } catch (error) {
        window.log(`Failed to send notification: ${error.message}`, 'error');
    }
});

// Initialize remaining stub functions
const remainingMethods = [
    'importConfig', 'restoreConfig', 'setDisabledAppList', 'getDisabledAppList', 
    'setIgnoreDisabledProfiles', 'getIgnoreDisabledProfiles', 'enumerateTriggers', 
    'getAssociatedApps', 'switchScannerParams', 'setReportingOptions',
    'registerForNotification', 'unRegisterForNotification'
];

remainingMethods.forEach(method => {
    if (!window[method]) {
        window[method] = function() {
            console.log(`${method} - waiting for plugin initialization...`);
        };
    }
});

// Helper functions
window.log = function(message, type = 'info') {
    const consoleMessages = document.getElementById('console-messages');
    if (!consoleMessages) return;
    
    const timestamp = new Date().toLocaleTimeString();
    const className = type === 'error' ? 'error' : 'info';
    
    const messageHtml = `
        <div class="console-message ${className}">
            <span class="timestamp">[${timestamp}]</span> ${message}
        </div>
    `;
    
    consoleMessages.insertAdjacentHTML('afterbegin', messageHtml);
    
    if (consoleMessages.children.length > 100) {
        consoleMessages.removeChild(consoleMessages.lastChild);
    }
    
    console.log(`[${timestamp}] ${message}`);
};

window.updateScannerStatus = async function() {
    if (!window.DataWedge) return;
    try {
        const result = await window.DataWedge.getScannerStatus();
        document.getElementById('scanner-status').innerHTML = 
            `Scanner: ${result.status}`;
    } catch (error) {
        console.error('Failed to update scanner status');
    }
};