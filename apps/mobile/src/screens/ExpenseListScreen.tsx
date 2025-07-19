import React, { useState, useMemo } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import { ListItem, Text, Header, SearchBar, Button, Icon, Card } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import { useExpenseStore } from '../store';
import { formatCurrency, formatDate, ExpenseFilter } from '@expense-tracker/shared';

const ExpenseListScreen = () => {
  const navigation = useNavigation();
  const { 
    expenses, 
    isLoading, 
    loadExpenses, 
    deleteExpense, 
    setFilter, 
    filter 
  } = useExpenseStore();
  
  const [searchText, setSearchText] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Filter expenses based on search text
  const filteredExpenses = useMemo(() => {
    if (!searchText.trim()) return expenses;
    
    const searchLower = searchText.toLowerCase();
    return expenses.filter(expense => 
      expense.description.toLowerCase().includes(searchLower) ||
      expense.category.name.toLowerCase().includes(searchLower) ||
      expense.notes?.toLowerCase().includes(searchLower) ||
      expense.tags?.some(tag => tag.toLowerCase().includes(searchLower))
    );
  }, [expenses, searchText]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadExpenses(filter || undefined, true);
    setRefreshing(false);
  };

  const handleDeleteExpense = (expenseId: string, description: string) => {
    Alert.alert(
      'Delete Expense',
      `Are you sure you want to delete "${description}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteExpense(expenseId)
        }
      ]
    );
  };

  const renderExpenseItem = ({ item: expense }) => (
    <ListItem
      bottomDivider
      onPress={() => {
        // Navigate to expense details or edit screen
        // navigation.navigate('ExpenseDetails', { expenseId: expense.id });
      }}
      containerStyle={styles.listItem}
    >
      <Icon
        name="circle"
        color={expense.category.color}
        size={12}
        containerStyle={styles.categoryIndicator}
      />
      <ListItem.Content>
        <ListItem.Title style={styles.expenseTitle}>
          {expense.description}
        </ListItem.Title>
        <ListItem.Subtitle style={styles.expenseSubtitle}>
          {expense.category.name} • {formatDate(expense.date)}
        </ListItem.Subtitle>
        {expense.notes && (
          <Text style={styles.notesText}>{expense.notes}</Text>
        )}
        {expense.tags && expense.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {expense.tags.map((tag, index) => (
              <Text key={index} style={styles.tagText}>#{tag}</Text>
            ))}
          </View>
        )}
      </ListItem.Content>
      <View style={styles.rightContent}>
        <Text style={styles.amountText}>
          {formatCurrency(expense.amount, expense.currency)}
        </Text>
        <Button
          icon={<Icon name="delete" color="#FF3B30" size={20} />}
          type="clear"
          onPress={() => handleDeleteExpense(expense.id, expense.description)}
          buttonStyle={styles.deleteButton}
        />
      </View>
    </ListItem>
  );

  const EmptyListComponent = () => (
    <Card containerStyle={styles.emptyCard}>
      <Icon name="receipt" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>No expenses yet</Text>
      <Text style={styles.emptySubtitle}>
        Start tracking your expenses by adding your first one!
      </Text>
      <Button
        title="Add Expense"
        onPress={() => navigation.navigate('AddExpense')}
        buttonStyle={styles.addFirstExpenseButton}
        icon={<Icon name="add" color="#fff" style={{ marginRight: 8 }} />}
      />
    </Card>
  );

  return (
    <View style={styles.container}>
      <Header
        leftComponent={{ 
          icon: 'arrow-back', 
          color: '#fff', 
          onPress: () => navigation.goBack() 
        }}
        centerComponent={{ 
          text: 'Expenses', 
          style: { color: '#fff', fontSize: 18, fontWeight: 'bold' } 
        }}
        rightComponent={{ 
          icon: 'filter-list', 
          color: '#fff', 
          onPress: () => {
            // Navigate to filter screen
            // navigation.navigate('ExpenseFilter');
          }
        }}
        backgroundColor="#007AFF"
      />

      <SearchBar
        placeholder="Search expenses..."
        value={searchText}
        onChangeText={setSearchText}
        containerStyle={styles.searchContainer}
        inputContainerStyle={styles.searchInputContainer}
        platform="default"
        round
      />

      {expenses.length > 0 && (
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryText}>
            {filteredExpenses.length} of {expenses.length} expenses
          </Text>
        </View>
      )}

      <FlatList
        data={filteredExpenses}
        renderItem={renderExpenseItem}
        keyExtractor={item => item.id}
        ListEmptyComponent={EmptyListComponent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#007AFF']}
          />
        }
        contentContainerStyle={expenses.length === 0 ? styles.emptyContainer : undefined}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
    paddingHorizontal: 16,
  },
  searchInputContainer: {
    backgroundColor: '#f5f5f5',
  },
  summaryContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  summaryText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  listItem: {
    backgroundColor: '#fff',
    marginBottom: 1,
  },
  categoryIndicator: {
    marginRight: 12,
  },
  expenseTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  expenseSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 13,
    color: '#888',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagText: {
    fontSize: 12,
    color: '#007AFF',
    marginRight: 8,
  },
  rightContent: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 4,
  },
  deleteButton: {
    padding: 4,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  emptyCard: {
    margin: 32,
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#333',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  addFirstExpenseButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
});

export default ExpenseListScreen;
