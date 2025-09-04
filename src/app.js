import { Capacitor } from '@capacitor/core';

async function initializePlugin() {
    try {
        const module = await import('capacitor-datawedge-plugin');
        window.DataWedge = module.DataWedge;
        
        await setupEventListeners();
        await window.getVersionInfo();
        await window.getDatawedgeStatus();
        await window.getProfilesList();
        await window.enumerateScanners();
        
        window.log('DataWedge plugin initialized successfully');
        
        // Now define all the remaining functions
        defineRemainingFunctions();
    } catch (error) {
        window.log(`Failed to initialize plugin: ${error.message}`, 'error');
    }
}

function checkPluginReady() {
    if (!pluginReady || !DataWedge) {
        log('DataWedge plugin not initialized yet. Please wait...', 'error');
        return false;
    }
    return true;
}

async function setupEventListeners() {
    DataWedge.addListener('scanReceived', (event) => {
        const scanDisplay = document.getElementById('scan-data');
        const scanResult = document.getElementById('scan-result');
        
        scanResult.innerHTML = `
            <h3>Scan Result</h3>
            <p><strong>Data:</strong> ${event.data}</p>
            <p><strong>Type:</strong> ${event.labelType}</p>
            <p><strong>Time:</strong> ${new Date(event.timestamp).toLocaleTimeString()}</p>
        `;
        
        scanDisplay.innerHTML = `<pre>${JSON.stringify(event, null, 2)}</pre>`;
        log(`Scan received: ${event.data} (${event.labelType})`);
    });
    
    DataWedge.addListener('notificationReceived', (event) => {
        const notificationMessages = document.getElementById('notification-messages');
        const message = `
            <div class="notification-item">
                <strong>${event.type}</strong>: ${JSON.stringify(event.data)}
                <span class="timestamp">${new Date().toLocaleTimeString()}</span>
            </div>
        `;
        notificationMessages.insertAdjacentHTML('afterbegin', message);
        log(`Notification: ${event.type}`);
    });
}

window.softScanTrigger = async function() {
    if (!checkPluginReady()) return;
    try {
        const result = await DataWedge.softScanTrigger({ action: 'START_SCANNING' });
        log('Soft scan triggered');
    } catch (error) {
        log(`Soft scan failed: ${error.message}`, 'error');
    }
};

window.softRfidTrigger = async function() {
    try {
        const result = await DataWedge.softRfidTrigger({ action: 'START_SCANNING' });
        log('RFID scan triggered');
    } catch (error) {
        log(`RFID scan failed: ${error.message}`, 'error');
    }
};

window.enableScannerInput = async function() {
    try {
        await DataWedge.enableScannerInput();
        log('Scanner input enabled');
        updateScannerStatus();
    } catch (error) {
        log(`Failed to enable scanner: ${error.message}`, 'error');
    }
};

window.disableScannerInput = async function() {
    try {
        await DataWedge.disableScannerInput();
        log('Scanner input disabled');
        updateScannerStatus();
    } catch (error) {
        log(`Failed to disable scanner: ${error.message}`, 'error');
    }
};

window.createProfile = async function() {
    const profileName = document.getElementById('profile-name').value;
    if (!profileName) {
        log('Please enter a profile name', 'error');
        return;
    }
    
    try {
        await DataWedge.createProfile({ profileName });
        log(`Profile '${profileName}' created`);
        await getProfilesList();
    } catch (error) {
        log(`Failed to create profile: ${error.message}`, 'error');
    }
};

window.cloneProfile = async function() {
    const sourceName = document.getElementById('profile-list').value;
    const destinationName = document.getElementById('profile-name').value;
    
    if (!sourceName || !destinationName) {
        log('Please select source profile and enter destination name', 'error');
        return;
    }
    
    try {
        await DataWedge.cloneProfile({ sourceName, destinationName });
        log(`Profile '${sourceName}' cloned to '${destinationName}'`);
        await getProfilesList();
    } catch (error) {
        log(`Failed to clone profile: ${error.message}`, 'error');
    }
};

window.renameProfile = async function() {
    const currentName = document.getElementById('profile-list').value;
    const newName = document.getElementById('profile-name').value;
    
    if (!currentName || !newName) {
        log('Please select profile and enter new name', 'error');
        return;
    }
    
    try {
        await DataWedge.renameProfile({ currentName, newName });
        log(`Profile renamed from '${currentName}' to '${newName}'`);
        await getProfilesList();
    } catch (error) {
        log(`Failed to rename profile: ${error.message}`, 'error');
    }
};

window.deleteProfile = async function() {
    const profileName = document.getElementById('profile-list').value;
    if (!profileName) {
        log('Please select a profile to delete', 'error');
        return;
    }
    
    if (!confirm(`Delete profile '${profileName}'?`)) return;
    
    try {
        await DataWedge.deleteProfile({ profileName });
        log(`Profile '${profileName}' deleted`);
        await getProfilesList();
    } catch (error) {
        log(`Failed to delete profile: ${error.message}`, 'error');
    }
};

window.setConfig = async function() {
    const profileName = document.getElementById('profile-list').value;
    if (!profileName) {
        log('Please select a profile', 'error');
        return;
    }
    
    const config = {
        PROFILE_NAME: profileName,
        PROFILE_ENABLED: "true",
        CONFIG_MODE: "UPDATE",
        PLUGIN_CONFIG: {
            PLUGIN_NAME: "BARCODE",
            PARAM_LIST: {
                scanner_selection: "auto",
                decoder_ean13: "true",
                decoder_code128: "true",
                decoder_qrcode: "true"
            }
        },
        APP_LIST: [{
            PACKAGE_NAME: "com.datawedge.demo",
            ACTIVITY_LIST: ["*"]
        }]
    };
    
    try {
        await DataWedge.setConfig({ config });
        log(`Configuration updated for '${profileName}'`);
    } catch (error) {
        log(`Failed to set config: ${error.message}`, 'error');
    }
};

window.getConfig = async function() {
    const profileName = document.getElementById('profile-list').value;
    if (!profileName) {
        log('Please select a profile', 'error');
        return;
    }
    
    try {
        const result = await DataWedge.getConfig({ profileName });
        document.getElementById('query-result').innerHTML = 
            `<h3>Profile Config: ${profileName}</h3><pre>${JSON.stringify(result, null, 2)}</pre>`;
        log(`Retrieved config for '${profileName}'`);
    } catch (error) {
        log(`Failed to get config: ${error.message}`, 'error');
    }
};

window.importConfig = async function() {
    const filePath = "/sdcard/Download/datawedge_config.db";
    const config = {
        PROFILE_NAME: "ImportedProfile",
        CONFIG_MODE: "IMPORT",
        FILE_PATH: filePath
    };
    
    try {
        await DataWedge.importConfig({ config });
        log(`Configuration imported from ${filePath}`);
        await getProfilesList();
    } catch (error) {
        log(`Failed to import config: ${error.message}`, 'error');
    }
};

window.restoreConfig = async function() {
    if (!confirm('This will restore DataWedge to factory defaults. Continue?')) return;
    
    try {
        await DataWedge.restoreConfig();
        log('DataWedge restored to factory defaults');
        await getProfilesList();
    } catch (error) {
        log(`Failed to restore config: ${error.message}`, 'error');
    }
};

window.resetDefaultProfile = async function() {
    try {
        await DataWedge.resetDefaultProfile();
        log('Default profile reset');
    } catch (error) {
        log(`Failed to reset default profile: ${error.message}`, 'error');
    }
};

window.setDefaultProfile = async function() {
    const profileName = document.getElementById('profile-list').value;
    if (!profileName) {
        log('Please select a profile', 'error');
        return;
    }
    
    try {
        await DataWedge.setDefaultProfile({ profileName });
        log(`Default profile set to '${profileName}'`);
    } catch (error) {
        log(`Failed to set default profile: ${error.message}`, 'error');
    }
};

window.setDisabledAppList = async function() {
    const packageName = document.getElementById('app-package').value;
    if (!packageName) {
        log('Please enter a package name', 'error');
        return;
    }
    
    const config = {
        DISABLED_APP_LIST: [
            { PACKAGE_NAME: packageName, ACTIVITY_LIST: ["*"] }
        ]
    };
    
    try {
        await DataWedge.setDisabledAppList({ config });
        log(`Disabled apps list updated with '${packageName}'`);
    } catch (error) {
        log(`Failed to set disabled apps: ${error.message}`, 'error');
    }
};

window.getDisabledAppList = async function() {
    try {
        const result = await DataWedge.getDisabledAppList();
        document.getElementById('query-result').innerHTML = 
            `<h3>Disabled Apps</h3><pre>${JSON.stringify(result, null, 2)}</pre>`;
        log('Retrieved disabled apps list');
    } catch (error) {
        log(`Failed to get disabled apps: ${error.message}`, 'error');
    }
};

window.setIgnoreDisabledProfiles = async function() {
    try {
        await DataWedge.setIgnoreDisabledProfiles({ ignoreDisabledProfiles: true });
        log('Ignore disabled profiles setting toggled');
    } catch (error) {
        log(`Failed to set ignore disabled profiles: ${error.message}`, 'error');
    }
};

window.getIgnoreDisabledProfiles = async function() {
    try {
        const result = await DataWedge.getIgnoreDisabledProfiles();
        document.getElementById('query-result').innerHTML = 
            `<h3>Ignore Disabled Profiles</h3><p>${result.ignoreDisabledProfiles ? 'Enabled' : 'Disabled'}</p>`;
        log(`Ignore disabled profiles: ${result.ignoreDisabledProfiles}`);
    } catch (error) {
        log(`Failed to get ignore status: ${error.message}`, 'error');
    }
};

window.getVersionInfo = async function() {
    try {
        const result = await DataWedge.getVersionInfo();
        document.getElementById('version-info').innerHTML = 
            `DataWedge v${result.datawedgeVersion} | Scanner: ${result.scannerFirmware}`;
        document.getElementById('query-result').innerHTML = 
            `<h3>Version Info</h3><pre>${JSON.stringify(result, null, 2)}</pre>`;
        log('Version info retrieved');
    } catch (error) {
        log(`Failed to get version info: ${error.message}`, 'error');
    }
};

window.getDatawedgeStatus = async function() {
    try {
        const result = await DataWedge.getDatawedgeStatus();
        const status = result.enabled ? 'Enabled' : 'Disabled';
        document.getElementById('query-result').innerHTML = 
            `<h3>DataWedge Status</h3><p>${status}</p>`;
        log(`DataWedge status: ${status}`);
    } catch (error) {
        log(`Failed to get DataWedge status: ${error.message}`, 'error');
    }
};

window.getScannerStatus = async function() {
    try {
        const result = await DataWedge.getScannerStatus();
        document.getElementById('scanner-status').innerHTML = 
            `Scanner: ${result.status}`;
        document.getElementById('query-result').innerHTML = 
            `<h3>Scanner Status</h3><p>${result.status}</p>`;
        log(`Scanner status: ${result.status}`);
    } catch (error) {
        log(`Failed to get scanner status: ${error.message}`, 'error');
    }
};

async function updateScannerStatus() {
    try {
        const result = await DataWedge.getScannerStatus();
        document.getElementById('scanner-status').innerHTML = 
            `Scanner: ${result.status}`;
    } catch (error) {
        console.error('Failed to update scanner status');
    }
}

window.getActiveProfile = async function() {
    try {
        const result = await DataWedge.getActiveProfile();
        currentProfile = result.profileName;
        document.getElementById('query-result').innerHTML = 
            `<h3>Active Profile</h3><p>${result.profileName}</p>`;
        log(`Active profile: ${result.profileName}`);
    } catch (error) {
        log(`Failed to get active profile: ${error.message}`, 'error');
    }
};

window.getProfilesList = async function() {
    try {
        const result = await DataWedge.getProfilesList();
        profiles = result.profiles || [];
        
        const select = document.getElementById('profile-list');
        select.innerHTML = profiles.map(p => `<option value="${p}">${p}</option>`).join('');
        
        document.getElementById('query-result').innerHTML = 
            `<h3>Profiles List</h3><ul>${profiles.map(p => `<li>${p}</li>`).join('')}</ul>`;
        log(`Found ${profiles.length} profiles`);
    } catch (error) {
        log(`Failed to get profiles: ${error.message}`, 'error');
    }
};

window.enumerateScanners = async function() {
    try {
        const result = await DataWedge.enumerateScanners();
        scanners = result.scanners || [];
        
        const select = document.getElementById('scanner-list');
        select.innerHTML = scanners.map(s => 
            `<option value="${s.index}">${s.name} (${s.connected ? 'Connected' : 'Disconnected'})</option>`
        ).join('');
        
        document.getElementById('query-result').innerHTML = 
            `<h3>Available Scanners</h3><pre>${JSON.stringify(scanners, null, 2)}</pre>`;
        log(`Found ${scanners.length} scanners`);
    } catch (error) {
        log(`Failed to enumerate scanners: ${error.message}`, 'error');
    }
};

window.enumerateTriggers = async function() {
    try {
        const result = await DataWedge.enumerateTriggers();
        document.getElementById('query-result').innerHTML = 
            `<h3>Available Triggers</h3><pre>${JSON.stringify(result, null, 2)}</pre>`;
        log('Triggers enumerated');
    } catch (error) {
        log(`Failed to enumerate triggers: ${error.message}`, 'error');
    }
};

window.getAssociatedApps = async function() {
    const profileName = document.getElementById('profile-list').value;
    if (!profileName) {
        log('Please select a profile', 'error');
        return;
    }
    
    try {
        const result = await DataWedge.getAssociatedApps({ profileName });
        document.getElementById('query-result').innerHTML = 
            `<h3>Associated Apps for ${profileName}</h3><pre>${JSON.stringify(result, null, 2)}</pre>`;
        log(`Retrieved associated apps for '${profileName}'`);
    } catch (error) {
        log(`Failed to get associated apps: ${error.message}`, 'error');
    }
};

window.enableDatawedge = async function() {
    try {
        await DataWedge.enableDatawedge();
        log('DataWedge enabled');
        await getDatawedgeStatus();
    } catch (error) {
        log(`Failed to enable DataWedge: ${error.message}`, 'error');
    }
};

window.disableDatawedge = async function() {
    try {
        await DataWedge.disableDatawedge();
        log('DataWedge disabled');
        await getDatawedgeStatus();
    } catch (error) {
        log(`Failed to disable DataWedge: ${error.message}`, 'error');
    }
};

window.switchToProfile = async function() {
    const profileName = document.getElementById('profile-list').value;
    if (!profileName) {
        log('Please select a profile', 'error');
        return;
    }
    
    try {
        await DataWedge.switchToProfile({ profileName });
        log(`Switched to profile '${profileName}'`);
        await getActiveProfile();
    } catch (error) {
        log(`Failed to switch profile: ${error.message}`, 'error');
    }
};

window.switchScanner = async function() {
    const scannerIndex = document.getElementById('scanner-list').value;
    if (!scannerIndex) {
        log('Please select a scanner', 'error');
        return;
    }
    
    try {
        await DataWedge.switchScanner({ scannerIndex: parseInt(scannerIndex) });
        log(`Switched to scanner index ${scannerIndex}`);
    } catch (error) {
        log(`Failed to switch scanner: ${error.message}`, 'error');
    }
};

window.switchScannerParams = async function() {
    const params = {
        scannerIndex: 0,
        decoderParams: {
            decoder_ean13: "true",
            decoder_code128: "true",
            decoder_qrcode: "true"
        }
    };
    
    try {
        await DataWedge.switchScannerParams({ params });
        log('Scanner parameters updated');
    } catch (error) {
        log(`Failed to update scanner params: ${error.message}`, 'error');
    }
};

window.setReportingOptions = async function() {
    const options = {
        enabled: "true",
        autoEnter: "true",
        intentDelivery: "2"
    };
    
    try {
        await DataWedge.setReportingOptions({ options });
        log('Reporting options updated');
    } catch (error) {
        log(`Failed to set reporting options: ${error.message}`, 'error');
    }
};

window.notify = async function() {
    const options = {
        notificationType: "BEEP",
        duration: 1000
    };
    
    try {
        await DataWedge.notify({ options });
        log('Notification sent (beep)');
    } catch (error) {
        log(`Failed to send notification: ${error.message}`, 'error');
    }
};

window.registerForNotification = async function() {
    const types = [
        'SCANNER_STATUS',
        'PROFILE_SWITCH',
        'CONFIGURATION_UPDATE',
        'WORKFLOW_STATUS'
    ];
    
    try {
        await DataWedge.registerForNotification({ types });
        log('Registered for notifications');
    } catch (error) {
        log(`Failed to register for notifications: ${error.message}`, 'error');
    }
};

window.unRegisterForNotification = async function() {
    const types = [
        'SCANNER_STATUS',
        'PROFILE_SWITCH',
        'CONFIGURATION_UPDATE',
        'WORKFLOW_STATUS'
    ];
    
    try {
        await DataWedge.unRegisterForNotification({ types });
        log('Unregistered from notifications');
    } catch (error) {
        log(`Failed to unregister from notifications: ${error.message}`, 'error');
    }
};

// showTab is now defined in index.html inline script

function log(message, type = 'info') {
    const consoleMessages = document.getElementById('console-messages');
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
}

// clearConsole is now defined in index.html inline script
// Enhance it with logging
const originalClearConsole = window.clearConsole;
window.clearConsole = function() {
    originalClearConsole();
    log('Console cleared');
};

// Functions are already defined on window object above

document.addEventListener('DOMContentLoaded', () => {
    initializePlugin();
});