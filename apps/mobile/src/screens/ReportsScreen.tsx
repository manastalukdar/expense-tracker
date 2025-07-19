import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { Text, Header, Card } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { useExpenseStore } from '../store';
import { formatCurrency, groupExpensesByCategory, calculateTotal } from '@expense-tracker/shared';

const ReportsScreen = () => {
  const navigation = useNavigation();
  const { expenses, userPreferences } = useExpenseStore();

  const defaultCurrency = userPreferences?.defaultCurrency || { code: 'USD', symbol: '$', name: 'US Dollar' };
  const totalExpenses = calculateTotal(expenses);
  const expensesByCategory = groupExpensesByCategory(expenses);

  const categoryStats = useMemo(() => {
    return Object.entries(expensesByCategory).map(([categoryId, categoryExpenses]) => {
      const category = categoryExpenses[0]?.category;
      const total = calculateTotal(categoryExpenses);
      const percentage = totalExpenses > 0 ? (total / totalExpenses) * 100 : 0;
      
      return {
        categoryId,
        category,
        total,
        percentage,
        count: categoryExpenses.length,
      };
    }).sort((a, b) => b.total - a.total);
  }, [expensesByCategory, totalExpenses]);

  const pieChartData = categoryStats.map((stat, index) => ({
    name: stat.category?.name || 'Unknown',
    amount: stat.total,
    color: stat.category?.color || `#${Math.floor(Math.random()*16777215).toString(16)}`,
    legendFontColor: '#333',
    legendFontSize: 14,
  }));

  const lineChartData = {
    labels: categoryStats.slice(0, 5).map(stat => stat.category?.name.substring(0, 8) || 'Unknown'),
    datasets: [
      {
        data: categoryStats.slice(0, 5).map(stat => stat.total),
        color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#007AFF',
    },
  };

  return (
    <ScrollView style={styles.container}>
      <Header
        leftComponent={{ 
          icon: 'arrow-back', 
          color: '#fff', 
          onPress: () => navigation.goBack() 
        }}
        centerComponent={{ 
          text: 'Reports', 
          style: { color: '#fff', fontSize: 18, fontWeight: 'bold' } 
        }}
        backgroundColor="#007AFF"
      />

      {/* Summary Card */}
      <Card containerStyle={styles.summaryCard}>
        <Text style={styles.cardTitle}>Expense Summary</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Spent</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(totalExpenses, defaultCurrency)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Expenses</Text>
            <Text style={styles.summaryValue}>{expenses.length}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Categories</Text>
            <Text style={styles.summaryValue}>{categoryStats.length}</Text>
          </View>
        </View>
      </Card>

      {/* Pie Chart */}
      {categoryStats.length > 0 && (
        <Card containerStyle={styles.chartCard}>
          <Text style={styles.cardTitle}>Expenses by Category</Text>
          <PieChart
            data={pieChartData}
            width={Dimensions.get('window').width - 64}
            height={220}
            chartConfig={chartConfig}
            accessor="amount"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </Card>
      )}

      {/* Line Chart */}
      {categoryStats.length > 0 && (
        <Card containerStyle={styles.chartCard}>
          <Text style={styles.cardTitle}>Top Categories Trend</Text>
          <LineChart
            data={lineChartData}
            width={Dimensions.get('window').width - 64}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </Card>
      )}

      {/* Category Breakdown */}
      <Card containerStyle={styles.categoryCard}>
        <Text style={styles.cardTitle}>Category Breakdown</Text>
        {categoryStats.map((stat) => (
          <View key={stat.categoryId} style={styles.categoryRow}>
            <View style={styles.categoryLeft}>
              <View 
                style={[styles.categoryIndicator, { backgroundColor: stat.category?.color }]} 
              />
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{stat.category?.name}</Text>
                <Text style={styles.categoryCount}>{stat.count} expenses</Text>
              </View>
            </View>
            <View style={styles.categoryRight}>
              <Text style={styles.categoryAmount}>
                {formatCurrency(stat.total, defaultCurrency)}
              </Text>
              <Text style={styles.categoryPercentage}>
                {stat.percentage.toFixed(1)}%
              </Text>
            </View>
          </View>
        ))}
      </Card>

      {expenses.length === 0 && (
        <Card containerStyle={styles.emptyCard}>
          <Text style={styles.emptyText}>
            No expenses to analyze yet. Start adding expenses to see your spending reports!
          </Text>
        </Card>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  summaryCard: {
    margin: 16,
    borderRadius: 12,
  },
  chartCard: {
    margin: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  categoryCard: {
    margin: 16,
    borderRadius: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  categoryCount: {
    fontSize: 14,
    color: '#666',
  },
  categoryRight: {
    alignItems: 'flex-end',
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  categoryPercentage: {
    fontSize: 14,
    color: '#666',
  },
  emptyCard: {
    margin: 32,
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default ReportsScreen;
