import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Input, Button, Header, Card, Text, ButtonGroup, Icon } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import { useExpenseStore } from '../store';
import { CategoryPicker, PaymentMethodPicker, TagSelector, VendorPicker } from '../components/pickers';
import { 
  Expense, 
  ExpenseCategory, 
  PaymentMethod,
  validateExpense,
  DEFAULT_CURRENCIES 
} from '@expense-tracker/shared';

const AddExpenseScreen = () => {
  const navigation = useNavigation();
  const { createExpense, currencies, userPreferences, tags, isLoading } = useExpenseStore();
  
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [vendor, setVendor] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [selectedCurrencyIndex, setSelectedCurrencyIndex] = useState(0);
  const [notes, setNotes] = useState('');

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
    if (!selectedCategory) {
      Alert.alert('Validation Error', 'Please select a category');
      return;
    }
    
    if (!vendor.trim()) {
      Alert.alert('Validation Error', 'Please enter a vendor name');
      return;
    }
    
    if (!selectedPaymentMethod) {
      Alert.alert('Validation Error', 'Please select a payment method');
      return;
    }

    const selectedCurrency = availableCurrencies[selectedCurrencyIndex];
    const selectedTags = tags.filter(tag => selectedTagIds.includes(tag.id));
    
    const expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'> = {
      amount: parseFloat(amount),
      description: description.trim() || undefined,
      vendor: vendor.trim(),
      category: selectedCategory,
      date: new Date(),
      currency: selectedCurrency,
      paymentMethod: selectedPaymentMethod,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      notes: notes.trim() || undefined,
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
      setVendor('');
      setNotes('');
      setSelectedCategory(null);
      setSelectedPaymentMethod(null);
      setSelectedTagIds([]);
      setSelectedCurrencyIndex(availableCurrencies.findIndex(c => c.code === defaultCurrency.code) || 0);
    } catch {
      Alert.alert('Error', 'Failed to add expense. Please try again.');
    }
  };

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
        
        <VendorPicker
          value={vendor}
          onVendorSelect={setVendor}
          placeholder="Enter vendor name"
          style={styles.inputContainer}
        />
        
        <Input
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="What did you spend on? (optional)"
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
      </Card>

      <Card containerStyle={styles.selectionCard}>
        <Text style={styles.sectionTitle}>Category *</Text>
        <CategoryPicker
          selectedCategoryId={selectedCategory?.id}
          onCategorySelect={setSelectedCategory}
          placeholder="Select a category"
          allowClear={false}
        />
      </Card>

      <Card containerStyle={styles.selectionCard}>
        <Text style={styles.sectionTitle}>Payment Method *</Text>
        <PaymentMethodPicker
          selectedPaymentMethodId={selectedPaymentMethod?.id}
          onPaymentMethodSelect={setSelectedPaymentMethod}
          placeholder="Select payment method"
        />
      </Card>

      <Card containerStyle={styles.selectionCard}>
        <Text style={styles.sectionTitle}>Tags</Text>
        <TagSelector
          selectedTagIds={selectedTagIds}
          onTagsSelect={setSelectedTagIds}
          placeholder="Select tags (optional)"
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
          disabled={!amount || !vendor || !selectedCategory || !selectedPaymentMethod || isLoading}
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
  selectionCard: {
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
