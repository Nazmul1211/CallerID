# Navigate to android directory
cd android

# Generate release APK
./gradlew assembleRelease

# The APK will be created at:
# CallerID/android/app/build/outputs/apk/release/




# Enable wireless debugging
adb tcpip 5555
adb connect <your-device-ip>:5555

# Now you can disconnect the USB cable
# To run your app wirelessly:
npx react-native run-android




# List available emulators
emulator -list-avds

# Start emulator
emulator -avd <avd-name>

# Run app on emulator
npx react-native run-android