import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { addExpense } from '../store/slices/expenseSlice';

const AddExpenseScreen = () => {
  const dispatch = useDispatch();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');

  const handleAddExpense = () => {
    if (amount && description && category) {
      dispatch(addExpense({
        id: Date.now().toString(),
        amount: parseFloat(amount),
        description,
        category,
        date: new Date().toISOString(),
      }));
      setAmount('');
      setDescription('');
      setCategory('');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        label="Amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        label="Description"
        value={description}
        onChangeText={setDescription}
        style={styles.input}
      />
      <TextInput
        label="Category"
        value={category}
        onChangeText={setCategory}
        style={styles.input}
      />
      <Button mode="contained" onPress={handleAddExpense}>
        Add Expense
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    marginBottom: 16,
  },
});

export default AddExpenseScreen;
