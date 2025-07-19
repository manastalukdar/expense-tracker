import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Input, Button, Header, Card, Text, ButtonGroup, Icon } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import { useExpenseStore } from '../store';
import { 
  Expense, 
  ExpenseCategory, 
  Currency, 
  generateId, 
  validateExpense,
  DEFAULT_CURRENCIES 
} from '@expense-tracker/shared';

const AddExpenseScreen = () => {
  const navigation = useNavigation();
  const { createExpense, categories, currencies, userPreferences, isLoading } = useExpenseStore();
  
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(0);
  const [selectedCurrencyIndex, setSelectedCurrencyIndex] = useState(0);
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState('');

  const defaultCurrency = userPreferences?.defaultCurrency || DEFAULT_CURRENCIES[0];
  const availableCurrencies = currencies.length > 0 ? currencies : DEFAULT_CURRENCIES;
  
  // Set default currency index
  React.useEffect(() => {
    const defaultIndex = availableCurrencies.findIndex(c => c.code === defaultCurrency.code);
    if (defaultIndex >= 0) {
      setSelectedCurrencyIndex(defaultIndex);
    }
  }, [defaultCurrency, availableCurrencies]);

  const handleAddExpense = async () => {
    const selectedCategory = categories[selectedCategoryIndex];
    const selectedCurrency = availableCurrencies[selectedCurrencyIndex];
    
    const expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'> = {
      amount: parseFloat(amount),
      description: description.trim(),
      category: selectedCategory,
      date: new Date(),
      currency: selectedCurrency,
      notes: notes.trim() || undefined,
      tags: tags.trim() ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : undefined,
    };

    const validationErrors = validateExpense(expenseData);
    if (validationErrors.length > 0) {
      Alert.alert('Validation Error', validationErrors.join('\n'));
      return;
    }

    try {
      await createExpense(expenseData);
      Alert.alert('Success', 'Expense added successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
      
      // Reset form
      setAmount('');
      setDescription('');
      setNotes('');
      setTags('');
      setSelectedCategoryIndex(0);
      setSelectedCurrencyIndex(availableCurrencies.findIndex(c => c.code === defaultCurrency.code) || 0);
    } catch (error) {
      Alert.alert('Error', 'Failed to add expense. Please try again.');
    }
  };

  const categoryButtons = categories.map(cat => ({ element: () => (
    <View style={styles.categoryButton}>
      <Text style={styles.categoryEmoji}>{cat.icon}</Text>
      <Text style={styles.categoryText}>{cat.name}</Text>
    </View>
  )}));

  const currencyButtons = availableCurrencies.map(curr => curr.code);

  return (
    <ScrollView style={styles.container}>
      <Header
        leftComponent={{ 
          icon: 'arrow-back', 
          color: '#fff', 
          onPress: () => navigation.goBack() 
        }}
        centerComponent={{ 
          text: 'Add Expense', 
          style: { color: '#fff', fontSize: 18, fontWeight: 'bold' } 
        }}
        backgroundColor="#007AFF"
      />

      <Card containerStyle={styles.formCard}>
        <Text style={styles.sectionTitle}>Expense Details</Text>
        
        <Input
          label="Amount *"
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          placeholder="0.00"
          leftIcon={<Icon name="attach-money" color="#666" />}
          containerStyle={styles.inputContainer}
        />
        
        <Input
          label="Description *"
          value={description}
          onChangeText={setDescription}
          placeholder="What did you spend on?"
          leftIcon={<Icon name="description" color="#666" />}
          containerStyle={styles.inputContainer}
        />
        
        <Input
          label="Notes"
          value={notes}
          onChangeText={setNotes}
          placeholder="Additional notes (optional)"
          multiline
          numberOfLines={3}
          leftIcon={<Icon name="note" color="#666" />}
          containerStyle={styles.inputContainer}
        />
        
        <Input
          label="Tags"
          value={tags}
          onChangeText={setTags}
          placeholder="Comma separated tags (optional)"
          leftIcon={<Icon name="local-offer" color="#666" />}
          containerStyle={styles.inputContainer}
        />
      </Card>

      <Card containerStyle={styles.categoryCard}>
        <Text style={styles.sectionTitle}>Category</Text>
        <ButtonGroup
          buttons={categoryButtons}
          selectedIndex={selectedCategoryIndex}
          onPress={setSelectedCategoryIndex}
          containerStyle={styles.buttonGroup}
          selectedButtonStyle={styles.selectedButton}
        />
      </Card>

      <Card containerStyle={styles.currencyCard}>
        <Text style={styles.sectionTitle}>Currency</Text>
        <ButtonGroup
          buttons={currencyButtons}
          selectedIndex={selectedCurrencyIndex}
          onPress={setSelectedCurrencyIndex}
          containerStyle={styles.buttonGroup}
          selectedButtonStyle={styles.selectedButton}
        />
      </Card>

      <View style={styles.buttonContainer}>
        <Button
          title="Add Expense"
          onPress={handleAddExpense}
          loading={isLoading}
          disabled={!amount || !description || isLoading}
          buttonStyle={styles.addButton}
          icon={<Icon name="add" color="#fff" style={{ marginRight: 8 }} />}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  formCard: {
    margin: 16,
    borderRadius: 12,
  },
  categoryCard: {
    margin: 16,
    borderRadius: 12,
  },
  currencyCard: {
    margin: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  inputContainer: {
    marginBottom: 16,
  },
  buttonGroup: {
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedButton: {
    backgroundColor: '#007AFF',
  },
  categoryButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  categoryEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 12,
    textAlign: 'center',
  },
  buttonContainer: {
    margin: 16,
    marginBottom: 32,
  },
  addButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
  },
});

export default AddExpenseScreen;
