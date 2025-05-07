import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { List, Text } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { RootState } from '../types';

const ExpenseListScreen = () => {
  const expenses = useSelector((state: RootState) => state.expenses.expenses);

  const renderItem = ({ item }) => (
    <List.Item
      title={item.description}
      description={`${item.category} - ${new Date(item.date).toLocaleDateString()}`}
      right={() => <Text>${item.amount.toFixed(2)}</Text>}
    />
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={expenses}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No expenses added yet</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
  },
});

export default ExpenseListScreen;
