// NOTE: You need to install @react-native-community/datetimepicker for this to work:
// npm install @react-native-community/datetimepicker
import React, { useState } from 'react';
import { View, Text, Button, Switch, StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNotifications } from '../../hooks/useNotifications';

export default function RemindersScreen() {
  const {
    permissionStatus,
    settings,
    loading,
    saveSettings,
    testNotification,
    error,
  } = useNotifications();

  // Local state for time pickers
  const [logMealsTime, setLogMealsTime] = useState(settings?.logMealsTime || '19:00');
  const [showLogMealsPicker, setShowLogMealsPicker] = useState(false);
  const [drinkWater, setDrinkWater] = useState(settings?.drinkWater || false);
  const [logMeals, setLogMeals] = useState(settings?.logMeals || false);

  // Parse time string to Date
  const parseTime = (time: string) => {
    const [hour, minute] = time.split(':').map(Number);
    const now = new Date();
    now.setHours(hour, minute, 0, 0);
    return now;
  };

  // Format Date to HH:mm
  const formatTime = (date: Date) => {
    return date.toTimeString().slice(0, 5);
  };

  // Handle time picker change
  const onLogMealsTimeChange = (event: any, selectedDate?: Date) => {
    setShowLogMealsPicker(false);
    if (selectedDate) {
      setLogMealsTime(formatTime(selectedDate));
    }
  };

  // Save settings
  const handleSave = () => {
    saveSettings({
      logMeals,
      logMealsTime,
      drinkWater,
      drinkWaterFrequency: settings?.drinkWaterFrequency || 'every_2_hours',
      weighIn: settings?.weighIn || false,
      weighInDay: settings?.weighInDay || 'monday',
      weighInTime: settings?.weighInTime || '08:00',
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reminders & Notifications</Text>
      <Text>Status: {permissionStatus}</Text>
      {error && <Text style={styles.error}>{error}</Text>}
      <View style={styles.row}>
        <Text>Enable Meal Reminder</Text>
        <Switch value={logMeals} onValueChange={setLogMeals} />
      </View>
      {logMeals && (
        <View style={styles.row}>
          <Text>Meal Reminder Time</Text>
          <Button title={logMealsTime} onPress={() => setShowLogMealsPicker(true)} />
          {showLogMealsPicker && (
            <DateTimePicker
              value={parseTime(logMealsTime)}
              mode="time"
              is24Hour={true}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onLogMealsTimeChange}
            />
          )}
        </View>
      )}
      <View style={styles.row}>
        <Text>Enable Hydration Reminder</Text>
        <Switch value={drinkWater} onValueChange={setDrinkWater} />
      </View>
      <Button title="Save Reminders" onPress={handleSave} disabled={loading} />
      <Button title="Test Notification" onPress={testNotification} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  error: {
    color: 'red',
    marginBottom: 8,
  },
}); 