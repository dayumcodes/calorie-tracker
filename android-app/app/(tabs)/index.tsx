import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, ActivityIndicator, Text, BackHandler, Platform, StatusBar as RNStatusBar, SafeAreaView } from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// You'll need to replace this with your actual hosted Next.js app URL
// For development, you can use your local network IP address and port
// For production, use your deployed URL
const APP_URL = 'https://calorietracker.in'; // Replace with your actual URL

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const webViewRef = useRef<WebView>(null);
  const insets = useSafeAreaInsets();

  // Handle back button press for navigation within WebView
  useEffect(() => {
    const backAction = () => {
      if (webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, []);

  const handleWebViewNavigationStateChange = (newNavState: WebViewNavigation) => {
    // Update loading state
    setLoading(newNavState.loading);
  };

  const statusBarHeight = Platform.OS === 'android' ? RNStatusBar.currentHeight || 0 : 0;

  return (
    <View 
      style={[
        styles.container, 
        { 
          paddingTop: statusBarHeight,
          paddingBottom: insets.bottom || 10 // Use insets if available, otherwise use a small default
        }
      ]}
    >
      <StatusBar style="auto" />
      
      <WebView
        ref={webViewRef}
        source={{ uri: APP_URL }}
        style={styles.webview}
        onNavigationStateChange={handleWebViewNavigationStateChange}
        onError={() => setError(true)}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        onHttpError={() => setError(true)}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text style={styles.loadingText}>Loading Calorie Tracker...</Text>
          </View>
        )}
      />

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Unable to connect to the Calorie Tracker.
            Please check your internet connection.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: Platform.OS === 'android' ? Constants.statusBarHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    color: 'red',
  },
});
