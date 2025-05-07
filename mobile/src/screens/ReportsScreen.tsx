import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { LineChart } from 'react-native-chart-kit';
import { RootState } from '../types';

const ReportsScreen = () => {
  const expenses = useSelector((state: RootState) => state.expenses.expenses);

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const expensesByCategory = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});

  const chartData = {
    labels: Object.keys(expensesByCategory),
    datasets: [
      {
        data: Object.values(expensesByCategory),
      },
    ],
  };

  return (
    <View style={styles.container}>
      <Text style={styles.totalText}>
        Total Expenses: ${totalExpenses.toFixed(2)}
      </Text>

      {Object.keys(expensesByCategory).length > 0 && (
        <LineChart
          data={chartData}
          width={Dimensions.get('window').width - 32}
          height={220}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
          }}
          style={styles.chart}
        />
      )}

      <View style={styles.categoryList}>
        {Object.entries(expensesByCategory).map(([category, amount]) => (
          <Text key={category} style={styles.categoryItem}>
            {category}: ${amount.toFixed(2)}
          </Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  totalText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  categoryList: {
    marginTop: 20,
  },
  categoryItem: {
    fontSize: 16,
    marginBottom: 8,
  },
});

export default ReportsScreen;
