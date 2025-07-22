import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, FlatList, Alert, Share } from 'react-native';
import { Text, Button, Header, Card, ListItem, Icon } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import { useExpenseStore } from '../store';
import { Expense, ExpenseFilter, filterExpenses, calculateTotal, formatCurrency, formatDate } from '@expense-tracker/shared';
import { DatabaseManager } from '@expense-tracker/database';
import ReportsFilterPanel from '../components/ReportsFilterPanel';

const CustomReportsScreen: React.FC = () => {
  const navigation = useNavigation();
  
  const { expenses, loadExpenses, userPreferences, isAppInitialized } = useExpenseStore();
  
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [currentFilter, setCurrentFilter] = useState<ExpenseFilter>({});
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      // Only load data if app is initialized
      if (!isAppInitialized) {
        console.log('CustomReports: App not initialized yet, waiting...');
        setIsLoading(true); // Keep loading state until app is initialized
        setError(null); // Clear any previous errors
        return;
      }
      
      try {
        setIsLoading(true);
        await loadExpenses();
        setError(null);
      } catch (err) {
        setError('Failed to load expenses: ' + (err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [isAppInitialized]); // Depend on isAppInitialized

  useEffect(() => {
    try {
      const filtered = filterExpenses(expenses, currentFilter);
      setFilteredExpenses(filtered);
      setError(null);
    } catch (err) {
      setError('Failed to filter expenses: ' + (err as Error).message);
    }
  }, [expenses, currentFilter]);

  const handleApplyFilter = (filter: ExpenseFilter) => {
    setCurrentFilter(filter);
  };

  const handleClearFilters = () => {
    setCurrentFilter({});
  };

  const getActiveFiltersCount = (): number => {
    let count = 0;
    if (currentFilter.dateRange) count++;
    if (currentFilter.categories?.length) count++;
    if (currentFilter.paymentMethods?.length) count++;
    if (currentFilter.tags?.length) count++;
    if (currentFilter.minAmount !== undefined) count++;
    if (currentFilter.maxAmount !== undefined) count++;
    if (currentFilter.searchText) count++;
    return count;
  };

  const getTotalAmount = (): number => {
    if (!filteredExpenses || filteredExpenses.length === 0) return 0;
    return calculateTotal(filteredExpenses);
  };

  const getAverageAmount = (): number => {
    if (!filteredExpenses || filteredExpenses.length === 0) return 0;
    return getTotalAmount() / filteredExpenses.length;
  };


  const exportReport = async () => {
    try {
      const defaultCurrency = userPreferences?.defaultCurrency || { code: 'USD', symbol: '$', name: 'US Dollar' };
      const total = getTotalAmount();
      const average = getAverageAmount();
      const expenseCount = filteredExpenses?.length || 0;
      
      let reportText = `📊 Custom Expense Report\n\n`;
      reportText += `📅 Generated: ${formatDate(new Date())}\n`;
      reportText += `📦 Total Expenses: ${expenseCount}\n`;
      reportText += `💰 Total Amount: ${formatCurrency(total, defaultCurrency)}\n`;
      reportText += `📊 Average Amount: ${formatCurrency(average, defaultCurrency)}\n\n`;
      
      if (expenseCount === 0) {
        reportText += `📋 No expenses found for the selected filters.\n`;
        await Share.share({
          message: reportText,
          title: 'Custom Expense Report'
        });
        return;
      }

      if (getActiveFiltersCount() > 0) {
        reportText += `🔍 Applied Filters:\n`;
        if (currentFilter.dateRange) {
          reportText += `• Date Range: ${formatDate(currentFilter.dateRange.startDate)} - ${formatDate(currentFilter.dateRange.endDate)}\n`;
        }
        if (currentFilter.categories?.length) {
          reportText += `• Categories: ${currentFilter.categories.length} selected\n`;
        }
        if (currentFilter.paymentMethods?.length) {
          reportText += `• Payment Methods: ${currentFilter.paymentMethods.length} selected\n`;
        }
        if (currentFilter.tags?.length) {
          reportText += `• Tags: ${currentFilter.tags.length} selected\n`;
        }
        if (currentFilter.minAmount !== undefined || currentFilter.maxAmount !== undefined) {
          reportText += `• Amount Range: ${currentFilter.minAmount || '0'} - ${currentFilter.maxAmount || '∞'}\n`;
        }
        if (currentFilter.searchText) {
          reportText += `• Search: "${currentFilter.searchText}"\n`;
        }
        reportText += `\n`;
      }

      reportText += `📋 Expense List:\n`;
      (filteredExpenses || []).forEach((expense, index) => {
        reportText += `${index + 1}. ${formatDate(expense.date)} - ${expense.vendor}\n`;
        reportText += `   ${formatCurrency(expense.amount, defaultCurrency)} - ${expense.category.name}\n`;
        if (expense.description) {
          reportText += `   ${expense.description}\n`;
        }
        reportText += `\n`;
      });

      await Share.share({
        message: reportText,
        title: 'Custom Expense Report'
      });
    } catch {
      Alert.alert('Error', 'Failed to export report');
    }
  };

  const renderExpenseItem = ({ item }: { item: Expense }) => {
    const defaultCurrency = userPreferences?.defaultCurrency || { code: 'USD', symbol: '$', name: 'US Dollar' };
    
    return (
      <ListItem containerStyle={styles.expenseItem}>
        <View style={styles.expenseDate}>
          <Text style={styles.dateText}>{formatDate(item.date, 'MMM dd')}</Text>
        </View>
        <ListItem.Content>
          <ListItem.Title style={styles.expenseVendor}>
            {item.vendor}
          </ListItem.Title>
          <ListItem.Subtitle style={styles.expenseDetails}>
            {item.category.icon} {item.category.name}
            {item.description && ` • ${item.description}`}
          </ListItem.Subtitle>
        </ListItem.Content>
        <View style={styles.expenseAmount}>
          <Text style={styles.amountText}>
            {formatCurrency(item.amount, defaultCurrency)}
          </Text>
          {item.paymentMethod && (
            <Text style={styles.paymentMethodText}>
              {item.paymentMethod.name}
            </Text>
          )}
        </View>
      </ListItem>
    );
  };


  const getFilterChips = () => {
    return (
      <>
        {currentFilter.dateRange && (
          <View key="dateRange" style={styles.filterChip}>
            <Text style={styles.filterChipText}>
              {`${formatDate(currentFilter.dateRange.startDate, 'MMM dd')} - ${formatDate(currentFilter.dateRange.endDate, 'MMM dd')}`}
            </Text>
            <Icon
              name="x"
              type="feather"
              size={14}
              color="#007AFF"
              onPress={() => setCurrentFilter(prev => ({ ...prev, dateRange: undefined }))}
              containerStyle={styles.filterChipIcon}
            />
          </View>
        )}
        
        {currentFilter.categories?.length && (
          <View key="categories" style={styles.filterChip}>
            <Text style={styles.filterChipText}>{`${currentFilter.categories.length} categories`}</Text>
            <Icon
              name="x"
              type="feather"
              size={14}
              color="#007AFF"
              onPress={() => setCurrentFilter(prev => ({ ...prev, categories: undefined }))}
              containerStyle={styles.filterChipIcon}
            />
          </View>
        )}
        
        {currentFilter.paymentMethods?.length && (
          <View key="paymentMethods" style={styles.filterChip}>
            <Text style={styles.filterChipText}>{`${currentFilter.paymentMethods.length} payment methods`}</Text>
            <Icon
              name="x"
              type="feather"
              size={14}
              color="#007AFF"
              onPress={() => setCurrentFilter(prev => ({ ...prev, paymentMethods: undefined }))}
              containerStyle={styles.filterChipIcon}
            />
          </View>
        )}
        
        {currentFilter.tags?.length && (
          <View key="tags" style={styles.filterChip}>
            <Text style={styles.filterChipText}>{`${currentFilter.tags.length} tags`}</Text>
            <Icon
              name="x"
              type="feather"
              size={14}
              color="#007AFF"
              onPress={() => setCurrentFilter(prev => ({ ...prev, tags: undefined }))}
              containerStyle={styles.filterChipIcon}
            />
          </View>
        )}
        
        {currentFilter.searchText && (
          <View key="searchText" style={styles.filterChip}>
            <Text style={styles.filterChipText}>{`"${currentFilter.searchText}"`}</Text>
            <Icon
              name="x"
              type="feather"
              size={14}
              color="#007AFF"
              onPress={() => setCurrentFilter(prev => ({ ...prev, searchText: undefined }))}
              containerStyle={styles.filterChipIcon}
            />
          </View>
        )}
      </>
    );
  };

  const defaultCurrency = userPreferences?.defaultCurrency || { code: 'USD', symbol: '$', name: 'US Dollar' };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Header
          leftComponent={{ 
            icon: 'arrow-back', 
            color: '#fff', 
            onPress: () => navigation.goBack() 
          }}
          centerComponent={{ 
            text: 'Custom Reports', 
            style: { color: '#fff', fontSize: 18, fontWeight: 'bold' } 
          }}
          backgroundColor="#007AFF"
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            {!isAppInitialized ? 'Initializing app...' : 'Loading reports...'}
          </Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Header
          leftComponent={{ 
            icon: 'arrow-back', 
            color: '#fff', 
            onPress: () => navigation.goBack() 
          }}
          centerComponent={{ 
            text: 'Custom Reports', 
            style: { color: '#fff', fontSize: 18, fontWeight: 'bold' } 
          }}
          backgroundColor="#007AFF"
        />
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" type="feather" size={48} color="#FF3B30" />
          <Text style={styles.errorText}>{error}</Text>
          <View style={styles.errorButtons}>
            <Button
              title="Retry"
              onPress={retryLoadData}
              buttonStyle={styles.retryButton}
            />
            {error?.includes('Database not initialized') && (
              <Button
                title="Reset Database"
                onPress={async () => {
                  try {
                    setError(null);
                    setIsLoading(true);
                    const db = DatabaseManager.getInstance();
                    await db.resetDatabase();
                    await loadExpenses();
                  } catch (err) {
                    setError('Failed to reset database: ' + (err as Error).message);
                  } finally {
                    setIsLoading(false);
                  }
                }}
                buttonStyle={[styles.retryButton, { backgroundColor: '#FF3B30' }]}
              />
            )}
          </View>
        </View>
      </View>
    );
  }

  const retryLoadData = () => {
    setError(null);
    setIsLoading(true);
    const loadData = async () => {
      try {
        await loadExpenses();
        setError(null);
      } catch (err) {
        setError('Failed to load expenses: ' + (err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  };

  return (
      <View style={styles.container}>
        <Header
          leftComponent={{ 
            icon: 'arrow-back', 
            color: '#fff', 
            onPress: () => navigation.goBack() 
          }}
          centerComponent={{ 
            text: 'Custom Reports', 
            style: { color: '#fff', fontSize: 18, fontWeight: 'bold' } 
          }}
          rightComponent={{ 
            icon: 'share', 
            color: '#fff', 
            onPress: exportReport
          }}
          backgroundColor="#007AFF"
        />

        <ScrollView style={styles.content}>
        {/* Filter Controls */}
        <Card containerStyle={styles.filterCard}>
          <View style={styles.filterHeader}>
            <Button
              title={`Filters ${getActiveFiltersCount() > 0 ? `(${getActiveFiltersCount()})` : ''}`}
              onPress={() => setShowFilterPanel(true)}
              buttonStyle={styles.filterButton}
              titleStyle={styles.filterButtonText}
              icon={<Icon name="filter" type="feather" size={16} color="#007AFF" />}
            />
            {getActiveFiltersCount() > 0 && (
              <Button
                title="Clear All"
                type="clear"
                onPress={handleClearFilters}
                titleStyle={styles.clearFiltersButton}
              />
            )}
          </View>
          
          {getActiveFiltersCount() > 0 && (
            <View style={styles.filterChips}>
              {getFilterChips()}
            </View>
          )}
        </Card>

        {/* Summary Stats */}
        <Card containerStyle={styles.summaryCard}>
          <Text style={styles.cardTitle}>Summary</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{filteredExpenses?.length || 0}</Text>
              <Text style={styles.summaryLabel}>Expenses</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                {formatCurrency(getTotalAmount(), defaultCurrency)}
              </Text>
              <Text style={styles.summaryLabel}>Total</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                {formatCurrency(getAverageAmount(), defaultCurrency)}
              </Text>
              <Text style={styles.summaryLabel}>Average</Text>
            </View>
          </View>
        </Card>

        {/* Expense List */}
        <Card containerStyle={styles.listCard}>
          <Text style={styles.cardTitle}>
            Expense List ({filteredExpenses?.length || 0})
          </Text>
          {(filteredExpenses?.length || 0) > 0 ? (
            <FlatList
              data={filteredExpenses}
              renderItem={renderExpenseItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          ) : (
            <View style={styles.emptyState}>
              <Icon name="receipt" type="feather" size={48} color="#8E8E93" />
              <Text style={styles.emptyText}>
                {getActiveFiltersCount() > 0 
                  ? 'No expenses match your filters'
                  : expenses?.length === 0
                    ? 'No expenses recorded yet.\nAdd your first expense to get started!'
                    : 'No expenses found'
                }
              </Text>
              {getActiveFiltersCount() > 0 ? (
                <Button
                  title="Clear Filters"
                  type="clear"
                  onPress={handleClearFilters}
                  titleStyle={styles.clearFiltersButton}
                />
              ) : expenses?.length === 0 && (
                <Button
                  title="Add Expense"
                  onPress={() => navigation.navigate('AddExpense')}
                  buttonStyle={styles.addExpenseButton}
                />
              )}
            </View>
          )}
        </Card>
      </ScrollView>

      {showFilterPanel && (
        <ReportsFilterPanel
          isVisible={showFilterPanel}
          onClose={() => setShowFilterPanel(false)}
          onApplyFilter={handleApplyFilter}
          currentFilter={currentFilter}
        />
      )}
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  content: {
    flex: 1,
  },
  filterCard: {
    margin: 16,
    borderRadius: 12,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  filterButtonText: {
    color: '#007AFF',
    marginLeft: 8,
  },
  clearFiltersButton: {
    color: '#FF3B30',
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  filterChipText: {
    fontSize: 12,
    color: '#007AFF',
    marginRight: 4,
  },
  filterChipIcon: {
    marginLeft: 4,
  },
  summaryCard: {
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  listCard: {
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
  },
  expenseItem: {
    paddingVertical: 12,
    paddingHorizontal: 0,
  },
  expenseDate: {
    width: 60,
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },
  expenseVendor: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  expenseDetails: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  expenseAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  paymentMethodText: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: '#F2F2F7',
    marginHorizontal: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    marginHorizontal: 8,
  },
  errorButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  addExpenseButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    marginTop: 8,
  },
});

export default CustomReportsScreen;