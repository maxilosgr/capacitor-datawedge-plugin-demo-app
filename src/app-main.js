// Import Capacitor from the global window object since it's loaded by the framework
const Capacitor = window.Capacitor;

async function initializePlugin() {
    try {
        // Try to load the plugin - it should be registered with Capacitor
        const module = await import('capacitor-datawedge-plugin');
        window.DataWedge = module.DataWedge;
        
        await setupEventListeners();
        await window.getVersionInfo();
        await window.getDatawedgeStatus();
        await window.getProfilesList();
        await window.enumerateScanners();
        
        window.log('DataWedge plugin initialized successfully');
        
        // Define all the remaining complex functions
        defineComplexFunctions();
    } catch (error) {
        window.log(`Failed to initialize plugin: ${error.message}`, 'error');
    }
}

async function setupEventListeners() {
    window.DataWedge.addListener('scanReceived', (event) => {
        const scanDisplay = document.getElementById('scan-data');
        const scanResult = document.getElementById('scan-result');
        
        scanResult.innerHTML = `
            <h3>Scan Result</h3>
            <p><strong>Data:</strong> ${event.data}</p>
            <p><strong>Type:</strong> ${event.labelType}</p>
            <p><strong>Time:</strong> ${new Date(event.timestamp).toLocaleTimeString()}</p>
        `;
        
        scanDisplay.innerHTML = `<pre>${JSON.stringify(event, null, 2)}</pre>`;
        window.log(`Scan received: ${event.data} (${event.labelType})`);
    });
    
    window.DataWedge.addListener('notificationReceived', (event) => {
        const notificationMessages = document.getElementById('notification-messages');
        const message = `
            <div class="notification-item">
                <strong>${event.type}</strong>: ${JSON.stringify(event.data)}
                <span class="timestamp">${new Date().toLocaleTimeString()}</span>
            </div>
        `;
        notificationMessages.insertAdjacentHTML('afterbegin', message);
        window.log(`Notification: ${event.type}`);
    });
}

function defineComplexFunctions() {
    // Profile management functions
    window.createProfile = async function() {
        const profileName = document.getElementById('profile-name').value;
        if (!profileName) {
            window.log('Please enter a profile name', 'error');
            return;
        }
        
        try {
            await window.DataWedge.createProfile({ profileName });
            window.log(`Profile '${profileName}' created`);
            await window.getProfilesList();
        } catch (error) {
            window.log(`Failed to create profile: ${error.message}`, 'error');
        }
    };

    window.cloneProfile = async function() {
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
    };

    window.renameProfile = async function() {
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
    };

    window.deleteProfile = async function() {
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
    };

    window.setConfig = async function() {
        const profileName = document.getElementById('profile-list').value;
        if (!profileName) {
            window.log('Please select a profile', 'error');
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
            await window.DataWedge.setConfig({ config });
            window.log(`Configuration updated for '${profileName}'`);
        } catch (error) {
            window.log(`Failed to set config: ${error.message}`, 'error');
        }
    };

    window.getConfig = async function() {
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
    };

    // Define all other complex functions
    window.importConfig = async function() {
        const filePath = "/sdcard/Download/datawedge_config.db";
        const config = {
            PROFILE_NAME: "ImportedProfile",
            CONFIG_MODE: "IMPORT",
            FILE_PATH: filePath
        };
        
        try {
            await window.DataWedge.importConfig({ config });
            window.log(`Configuration imported from ${filePath}`);
            await window.getProfilesList();
        } catch (error) {
            window.log(`Failed to import config: ${error.message}`, 'error');
        }
    };

    window.restoreConfig = async function() {
        if (!confirm('This will restore DataWedge to factory defaults. Continue?')) return;
        
        try {
            await window.DataWedge.restoreConfig();
            window.log('DataWedge restored to factory defaults');
            await window.getProfilesList();
        } catch (error) {
            window.log(`Failed to restore config: ${error.message}`, 'error');
        }
    };

    window.resetDefaultProfile = async function() {
        try {
            await window.DataWedge.resetDefaultProfile();
            window.log('Default profile reset');
        } catch (error) {
            window.log(`Failed to reset default profile: ${error.message}`, 'error');
        }
    };

    window.setDefaultProfile = async function() {
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
    };

    window.setDisabledAppList = async function() {
        const packageName = document.getElementById('app-package').value;
        if (!packageName) {
            window.log('Please enter a package name', 'error');
            return;
        }
        
        const config = {
            DISABLED_APP_LIST: [
                { PACKAGE_NAME: packageName, ACTIVITY_LIST: ["*"] }
            ]
        };
        
        try {
            await window.DataWedge.setDisabledAppList({ config });
            window.log(`Disabled apps list updated with '${packageName}'`);
        } catch (error) {
            window.log(`Failed to set disabled apps: ${error.message}`, 'error');
        }
    };

    window.getDisabledAppList = async function() {
        try {
            const result = await window.DataWedge.getDisabledAppList();
            document.getElementById('query-result').innerHTML = 
                `<h3>Disabled Apps</h3><pre>${JSON.stringify(result, null, 2)}</pre>`;
            window.log('Retrieved disabled apps list');
        } catch (error) {
            window.log(`Failed to get disabled apps: ${error.message}`, 'error');
        }
    };

    window.setIgnoreDisabledProfiles = async function() {
        try {
            await window.DataWedge.setIgnoreDisabledProfiles({ ignoreDisabledProfiles: true });
            window.log('Ignore disabled profiles setting toggled');
        } catch (error) {
            window.log(`Failed to set ignore disabled profiles: ${error.message}`, 'error');
        }
    };

    window.getIgnoreDisabledProfiles = async function() {
        try {
            const result = await window.DataWedge.getIgnoreDisabledProfiles();
            document.getElementById('query-result').innerHTML = 
                `<h3>Ignore Disabled Profiles</h3><p>${result.ignoreDisabledProfiles ? 'Enabled' : 'Disabled'}</p>`;
            window.log(`Ignore disabled profiles: ${result.ignoreDisabledProfiles}`);
        } catch (error) {
            window.log(`Failed to get ignore status: ${error.message}`, 'error');
        }
    };

    window.enumerateTriggers = async function() {
        if (!window.DataWedge) {
            window.log('DataWedge plugin not ready', 'error');
            return;
        }
        try {
            const result = await window.DataWedge.enumerateTriggers();
            document.getElementById('query-result').innerHTML = 
                `<h3>Available Triggers</h3><pre>${JSON.stringify(result, null, 2)}</pre>`;
            window.log('Triggers enumerated');
        } catch (error) {
            window.log(`Failed to enumerate triggers: ${error.message}`, 'error');
        }
    };

    window.getAssociatedApps = async function() {
        if (!window.DataWedge) {
            window.log('DataWedge plugin not ready', 'error');
            return;
        }
        const profileName = document.getElementById('profile-list').value;
        if (!profileName) {
            window.log('Please select a profile', 'error');
            return;
        }
        
        try {
            const result = await window.DataWedge.getAssociatedApps({ profileName });
            document.getElementById('query-result').innerHTML = 
                `<h3>Associated Apps for ${profileName}</h3><pre>${JSON.stringify(result, null, 2)}</pre>`;
            window.log(`Retrieved associated apps for '${profileName}'`);
        } catch (error) {
            window.log(`Failed to get associated apps: ${error.message}`, 'error');
        }
    };

    window.enableDatawedge = async function() {
        try {
            await window.DataWedge.enableDatawedge();
            window.log('DataWedge enabled');
            await window.getDatawedgeStatus();
        } catch (error) {
            window.log(`Failed to enable DataWedge: ${error.message}`, 'error');
        }
    };

    window.disableDatawedge = async function() {
        try {
            await window.DataWedge.disableDatawedge();
            window.log('DataWedge disabled');
            await window.getDatawedgeStatus();
        } catch (error) {
            window.log(`Failed to disable DataWedge: ${error.message}`, 'error');
        }
    };

    window.switchToProfile = async function() {
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
    };

    window.switchScanner = async function() {
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
            await window.DataWedge.switchScannerParams({ params });
            window.log('Scanner parameters updated');
        } catch (error) {
            window.log(`Failed to update scanner params: ${error.message}`, 'error');
        }
    };

    window.setReportingOptions = async function() {
        const options = {
            enabled: "true",
            autoEnter: "true",
            intentDelivery: "2"
        };
        
        try {
            await window.DataWedge.setReportingOptions({ options });
            window.log('Reporting options updated');
        } catch (error) {
            window.log(`Failed to set reporting options: ${error.message}`, 'error');
        }
    };

    window.notify = async function() {
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
    };

    window.registerForNotification = async function() {
        const types = [
            'SCANNER_STATUS',
            'PROFILE_SWITCH',
            'CONFIGURATION_UPDATE',
            'WORKFLOW_STATUS'
        ];
        
        try {
            await window.DataWedge.registerForNotification({ types });
            window.log('Registered for notifications');
        } catch (error) {
            window.log(`Failed to register for notifications: ${error.message}`, 'error');
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
            await window.DataWedge.unRegisterForNotification({ types });
            window.log('Unregistered from notifications');
        } catch (error) {
            window.log(`Failed to unregister from notifications: ${error.message}`, 'error');
        }
    };
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    initializePlugin();
});