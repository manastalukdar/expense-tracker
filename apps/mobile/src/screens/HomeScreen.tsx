import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, Card, Text, Header, Icon } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import { useExpenseStore } from '../store';
import { formatCurrency, calculateTotal } from '@expense-tracker/shared';

const HomeScreen = () => {
  const navigation = useNavigation();
  const { expenses, userPreferences } = useExpenseStore();

  const totalExpenses = calculateTotal(expenses);
  const expenseCount = expenses.length;
  const defaultCurrency = userPreferences?.defaultCurrency || { code: 'USD', symbol: '$', name: 'US Dollar' };

  return (
    <ScrollView style={styles.container}>
      <Header
        centerComponent={{ text: 'Expense Tracker', style: { color: '#fff', fontSize: 20, fontWeight: 'bold' } }}
        backgroundColor="#007AFF"
      />
      
      {/* Summary Card */}
      <Card containerStyle={styles.summaryCard}>
        <Text style={styles.summaryTitle}>This Month's Summary</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Spent</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(totalExpenses, defaultCurrency)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Expenses</Text>
            <Text style={styles.summaryValue}>{expenseCount}</Text>
          </View>
        </View>
      </Card>

      {/* Quick Actions */}
      <Card containerStyle={styles.actionsCard}>
        <Text style={styles.cardTitle}>Quick Actions</Text>
        
        <Button
          title="Add New Expense"
          icon={<Icon name="add" color="#fff" style={{ marginRight: 8 }} />}
          buttonStyle={[styles.actionButton, styles.primaryButton]}
          onPress={() => navigation.navigate('AddExpense')}
        />
        
        <Button
          title="View All Expenses"
          icon={<Icon name="list" color="#007AFF" style={{ marginRight: 8 }} />}
          buttonStyle={[styles.actionButton, styles.secondaryButton]}
          titleStyle={styles.secondaryButtonText}
          onPress={() => navigation.navigate('ExpenseList')}
        />
        
        <Button
          title="View Reports"
          icon={<Icon name="bar-chart" color="#007AFF" style={{ marginRight: 8 }} />}
          buttonStyle={[styles.actionButton, styles.secondaryButton]}
          titleStyle={styles.secondaryButtonText}
          onPress={() => navigation.navigate('Reports')}
        />
        
        <Button
          title="Manage Settings"
          icon={<Icon name="settings" color="#007AFF" style={{ marginRight: 8 }} />}
          buttonStyle={[styles.actionButton, styles.secondaryButton]}
          titleStyle={styles.secondaryButtonText}
          onPress={() => navigation.navigate('ManagementMenu')}
        />
      </Card>

      {/* Recent Expenses */}
      {expenses.length > 0 && (
        <Card containerStyle={styles.recentCard}>
          <Text style={styles.cardTitle}>Recent Expenses</Text>
          {expenses.slice(0, 3).map((expense) => (
            <View key={expense.id} style={styles.expenseItem}>
              <View style={styles.expenseLeft}>
                <Text style={styles.expenseDescription}>{expense.description}</Text>
                <Text style={styles.expenseCategory}>{expense.category.name}</Text>
              </View>
              <Text style={styles.expenseAmount}>
                {formatCurrency(expense.amount, expense.currency)}
              </Text>
            </View>
          ))}
          <Button
            title="View All"
            type="clear"
            titleStyle={styles.viewAllText}
            onPress={() => navigation.navigate('ExpenseList')}
          />
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
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  actionsCard: {
    margin: 16,
    borderRadius: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  actionButton: {
    borderRadius: 8,
    paddingVertical: 12,
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  secondaryButtonText: {
    color: '#007AFF',
  },
  recentCard: {
    margin: 16,
    borderRadius: 12,
  },
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  expenseLeft: {
    flex: 1,
  },
  expenseDescription: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  expenseCategory: {
    fontSize: 14,
    color: '#666',
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF3B30',
  },
  viewAllText: {
    color: '#007AFF',
    fontSize: 16,
  },
});

export default HomeScreen;
