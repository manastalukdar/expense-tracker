# Android Development Environment Setup

This guide will help you set up the Android development environment required for building and running the Expense Tracker React Native mobile app on Linux.

## Prerequisites

- Linux operating system (Ubuntu/Debian recommended)
- At least 8GB RAM and 20GB free disk space
- Stable internet connection for downloads

## 1. Install Java Development Kit (JDK)

React Native requires Java 17 for optimal compatibility.

```bash
# Update package list
sudo apt update

# Install OpenJDK 17
sudo apt install openjdk-17-jdk

# Verify installation
java -version
javac -version
```

Expected output should show Java 17:

```plaintext
openjdk version "17.0.x" 2023-xx-xx
OpenJDK Runtime Environment (build 17.0.x+x-Ubuntu-xxxx)
OpenJDK 64-Bit Server VM (build 17.0.x+x-Ubuntu-xxxx, mixed mode, sharing)
```

## 2. Install Android Studio

### Method 1: Direct Download (Recommended)

1. Visit [Android Studio Download Page](https://developer.android.com/studio)
2. Download the Linux version (.tar.gz file)
3. Extract and install:

```bash
# Extract the downloaded file
tar -xzf android-studio-*-linux.tar.gz

# Move to /opt directory (optional but recommended)
sudo mv android-studio /opt/

# Create desktop shortcut
sudo ln -sf /opt/android-studio/bin/studio.sh /usr/local/bin/android-studio

# Launch Android Studio
android-studio
```

### Method 2: Using Snap

```bash
# Install via snap
sudo snap install android-studio --classic

# Launch
android-studio
```

## 3. Android Studio Initial Setup

1. **Launch Android Studio** and complete the setup wizard
2. **Accept licenses** when prompted
3. **Choose installation type**: Select "Standard" for typical setup
4. **Download components**: Let the wizard download required SDK components

## 4. Configure Android SDK

### Through Android Studio UI:

1. Open Android Studio
2. Go to **File → Settings** (or **Android Studio → Preferences** on some systems)
3. Navigate to **Appearance & Behavior → System Settings → Android SDK**

### SDK Platforms Tab:

Install the following API levels:

- ✅ **Android 14 (API Level 34)** - Current target
- ✅ **Android 13 (API Level 33)** - Fallback support
- ✅ **Android 12 (API Level 31)** - Wider compatibility

### SDK Tools Tab:

Ensure these tools are installed:

- ✅ **Android SDK Build-Tools** (latest version)
- ✅ **Android Emulator**
- ✅ **Android SDK Platform-Tools**
- ✅ **Android SDK Tools**
- ✅ **Intel x86 Emulator Accelerator (HAXM installer)** (for Intel processors)
- ✅ **Google Play services**

## 5. Set Environment Variables

Add the following to your shell profile (`~/.bashrc`, `~/.zshrc`, or `~/.profile`):

```bash
# Android SDK
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin

# Java Home
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64

# Add to PATH if not already there
export PATH=$PATH:$JAVA_HOME/bin
```

**Apply the changes:**

```bash
# Reload your shell configuration
source ~/.bashrc  # or ~/.zshrc or ~/.profile
```

**Verify environment variables:**

```bash
echo $ANDROID_HOME
echo $JAVA_HOME
which adb
which emulator
```

## 6. Create Android Virtual Device (AVD)

### Through Android Studio:

<https://developer.android.com/studio/run/managing-avds>

1. Open Android Studio
2. Go to **Tools → AVD Manager**
3. Click **Create Virtual Device**
4. **Choose hardware**: Select a device profile (e.g., "Pixel 6" or "Pixel 4")
5. **System Image**: 
   - Click "Download" next to a recommended system image
   - Choose **Android 13 (API Level 33)** or **Android 14 (API Level 34)**
   - Select an image with Google Play Store if needed
6. **AVD Configuration**:
   - Name: `ExpenseTracker_AVD`
   - Advanced Settings (optional):
     - RAM: 2048 MB or higher
     - Storage: 2 GB or higher
7. Click **Finish**

### Test the Emulator:

```bash
# List available AVDs
emulator -list-avds

# Start the emulator
emulator -avd ExpenseTracker_AVD
```

## 7. Alternative: Use Physical Android Device

If you prefer using a real device:

### Enable Developer Options:

1. Go to **Settings → About Phone**
2. Tap **Build Number** 7 times
3. Developer Options should now appear in Settings

### Enable USB Debugging:

1. Go to **Settings → Developer Options**
2. Enable **USB Debugging**
3. Enable **Install via USB** (if available)

### Connect Device:

```bash
# Connect your device via USB cable
# Accept any permission dialogs on the device

# Verify connection
adb devices
```

You should see your device listed:

```plaintext
List of devices attached
XXXXXXXXXXXXXXXX    device
```

## 8. Verify Complete Setup

Run these commands to ensure everything is working:

```bash
# Check Java
java -version

# Check Android SDK tools
adb version
emulator -version

# Check available AVDs
emulator -list-avds

# Check connected devices
adb devices
```

## 9. Test with Expense Tracker App

Now you can build and run the Expense Tracker app:

```bash
# Navigate to project root
cd /path/to/expense-tracker

# Install dependencies (if not already done)
npm install

# Start Metro bundler (in one terminal)
npm run mobile:start

# Build and run on Android (in another terminal)
npm run mobile:android
```

## Troubleshooting

### Common Issues:

#### ADB not found

```bash
# Add platform-tools to PATH
export PATH=$PATH:$ANDROID_HOME/platform-tools
source ~/.bashrc
```

#### Emulator won't start

```bash
# Check if virtualization is enabled
egrep -c '(vmx|svm)' /proc/cpuinfo

# For Intel processors, ensure HAXM is installed
# For AMD processors, ensure KVM is available
```

#### Gradle build fails

```bash
# Clear gradle cache
cd apps/mobile/android
./gradlew clean

# Or from project root
npm run mobile:android -- --reset-cache
```

#### Device not detected

```bash
# Restart ADB server
adb kill-server
adb start-server

# Check device permissions
lsusb  # Should show your device
```

#### Build errors with React Native

```bash
# Clean React Native cache
npx react-native start --reset-cache

# Clean node modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Performance Tips

1. **Allocate more RAM to emulator**: 4GB+ recommended for smooth performance
2. **Enable hardware acceleration**: Ensure HAXM (Intel) or KVM (AMD) is working
3. **Use physical device**: Generally faster than emulator for development
4. **Close unnecessary applications**: Android development is resource-intensive

## References

- [React Native Environment Setup](https://reactnative.dev/docs/environment-setup)
- [Android Studio User Guide](https://developer.android.com/studio/intro)
- [Android Emulator Documentation](https://developer.android.com/studio/run/emulator)
- [ADB Documentation](https://developer.android.com/studio/command-line/adb)

## Next Steps

After completing this setup:
1. Review the [Development Guide](./development.md) for project-specific workflows
2. Check [Testing Documentation](./testing.md) for running tests on Android
3. See [CI/CD Documentation](./ci-cd.md) for automated build processes

---

*Last updated: $(date +%Y-%m-%d)*
*Environment: Linux (Ubuntu/Debian)*
*React Native Version: 0.80.1*
