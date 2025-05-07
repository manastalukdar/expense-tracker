import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

const HomeScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Button mode="contained" onPress={() => navigation.navigate('AddExpense')}>
        Add Expense
      </Button>
      <Button mode="contained" onPress={() => navigation.navigate('ExpenseList')}>
        View Expenses
      </Button>
      <Button mode="contained" onPress={() => navigation.navigate('Reports')}>
        View Reports
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    gap: 16,
  },
});

export default HomeScreen;
