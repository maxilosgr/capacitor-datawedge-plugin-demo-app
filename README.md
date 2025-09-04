# DataWedge Plugin Demo App

Comprehensive demonstration app for the Capacitor DataWedge Plugin, showcasing all 35+ API methods.

## Features

### 5-Tab Interface

1. **Scan Tab**
   - Real-time barcode/RFID scanning display
   - Soft scan trigger buttons
   - Live scan result formatting
   - Scan history console

2. **Config Tab**
   - Create, clone, rename, delete profiles
   - Import/export configurations
   - Set and get profile configurations
   - Auto-configure profiles for scanning

3. **Query Tab**
   - Get DataWedge version info
   - Check DataWedge and scanner status
   - List all profiles
   - Enumerate available scanners
   - View active profile

4. **Runtime Tab**
   - Enable/disable DataWedge
   - Enable/disable scanner input
   - Switch between profiles
   - Switch between scanners
   - Send notifications (beep/vibrate)

5. **Notify Tab**
   - Register for notifications
   - Display notification events
   - Monitor status changes
   - View configuration updates

## Setup

### Prerequisites
- Android device with DataWedge (Zebra/Symbol/Motorola)
- Node.js and npm
- Android SDK

### Installation

1. Clone or download this demo app
2. Install dependencies:
```bash
npm install
```

3. Copy web files and sync:
```bash
npm run build
```

4. Add Android platform (if not present):
```bash
npx cap add android
```

5. Sync with Android:
```bash
npx cap sync
```

## Running the App

### Using Android Studio
```bash
npm run android
```

### Using Command Line
```bash
# Build APK
npm run build:apk

# Install on device (update device ID in package.json)
npm run install:apk

# Or run directly
npm run run:android
```

## Usage

### First Time Setup

1. **Launch the app** - Plugin initializes automatically
2. **Check header** - Verify DataWedge version appears
3. **Create a profile** - Use "Create Profile" button in Config tab
4. **Name it** - Enter a profile name (e.g., "TestProfile")
5. **Auto-configure** - Profile is automatically configured for scanning

### Testing Scanning

1. **Physical scan** - Press hardware trigger on device
2. **Soft scan** - Tap "Soft Scan Trigger" button
3. **View results** - Scan data appears in Scan tab
4. **Check console** - Detailed logs in bottom console

### Profile Management

1. **List profiles** - Query tab shows all profiles
2. **Switch profile** - Select and switch in Runtime tab
3. **Configure profile** - Use Config tab for settings
4. **Clone profile** - Create copy with new name
5. **Delete profile** - Remove unwanted profiles

## DataWedge Configuration

The app automatically configures profiles with:
- Intent Action: `com.datawedge.demo.SCAN`
- Intent Delivery: Broadcast
- App Association: `com.datawedge.demo`
- Common decoders: EAN13, Code128, Code39, QR

## Project Structure

```
demo-app/
├── src/                    # Web source files
│   ├── index.html         # Main UI with 5 tabs
│   ├── styles.css         # Styling
│   ├── app-functions.js   # All DataWedge functions
│   ├── app-simple.js      # Plugin initialization
│   └── plugin-loader.js   # Plugin loading logic
├── android/               # Android platform files
├── www/                   # Built web assets
└── package.json          # Dependencies and scripts
```

## Troubleshooting

### Plugin Not Found
- Check console for initialization messages
- Verify plugin is installed: `ls node_modules/capacitor-datawedge-plugin`
- Run `npm install` and `npm run sync`

### No Scan Results
1. Check DataWedge is enabled (Query tab)
2. Verify scanner status shows "ENABLED"
3. Create and configure a profile
4. Ensure profile is associated with app
5. Check console for error messages

### Build Issues
- Clear and rebuild: `rm -rf node_modules android www`
- Reinstall: `npm install && npx cap add android`
- Check Android SDK path is set

## Scripts

- `npm run build` - Copy files and sync
- `npm run android` - Open in Android Studio
- `npm run sync` - Sync with Capacitor
- `npm run build:apk` - Build debug APK
- `npm run logs` - View device logs

## Requirements

- **Capacitor**: 7.0.0
- **Android**: API 22+ (5.1+)
- **DataWedge**: 6.0+ (11.4 recommended)

## Developer

Connect I.T - Gregorios Machairidis 2025

## License

MIT