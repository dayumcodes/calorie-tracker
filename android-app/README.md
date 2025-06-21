# Calorie Tracker Android App

This is a React Native wrapper for the Calorie Tracker web application that allows you to publish it to the Google Play Store.

## Development Setup

1. Make sure you have Node.js and npm installed.
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm start
   ```
4. Use the Expo Go app on your Android device to scan the QR code or run in an emulator.

## Building for Google Play Store

### 1. Update the APP_URL

Before building, make sure to update the `APP_URL` in `app/(tabs)/index.tsx` to point to your deployed Next.js application.

### 2. Configure app.json

Ensure your `app.json` has the correct package name and version information.

### 3. Generate a Keystore

Generate a keystore for signing your app:

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore calorie-tracker-keystore.p12 -alias calorie-tracker -keyalg RSA -keysize 2048 -validity 10000
```

Keep this keystore file safe, as you'll need it for all future updates.

### 4. Build the Android App Bundle

```bash
eas build --platform android --profile production
```

This will generate an AAB (Android App Bundle) file that you can upload to the Google Play Store.

If you haven't set up EAS (Expo Application Services), you'll need to:

```bash
npm install -g eas-cli
eas login
eas build:configure
```

### 5. Configure eas.json

Create an `eas.json` file with the following content:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

### 6. Submit to Google Play Store

1. Create a Google Play Developer account (if you don't have one already)
2. Create a new application
3. Upload the AAB file generated in step 4
4. Provide required information:
   - App icon
   - Feature graphic
   - Screenshots
   - Privacy policy URL
   - App description
   - Contact information

### 7. Publish to Production

After testing your app in the internal testing track, you can promote it to production in the Google Play Console.

## Updating Your App

When you need to update your app:

1. Update your Next.js web app
2. Update the version in `app.json`
3. Build a new bundle with `eas build`
4. Upload the new bundle to Google Play Console

## Troubleshooting

- If you experience issues with the WebView, make sure your website works well on mobile browsers
- Check that you have the proper permissions in the `app.json` file
- Ensure your app meets all Google Play Store requirements
