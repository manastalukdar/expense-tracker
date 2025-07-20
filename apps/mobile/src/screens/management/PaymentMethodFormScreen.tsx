import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Input, Button, Header, ListItem, Icon } from 'react-native-elements';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useExpenseStore } from '../../store/useExpenseStore';
import { PaymentMethod, PaymentMethodFormData } from '@expense-tracker/shared';

interface PaymentMethodFormScreenProps {
  route: {
    params?: {
      mode: 'create' | 'edit';
      paymentMethod?: PaymentMethod;
    };
  };
}

const PAYMENT_METHOD_TYPES = [
  { value: 'credit_card', label: 'Credit Card', icon: '💳' },
  { value: 'debit_card', label: 'Debit Card', icon: '💳' },
  { value: 'cash', label: 'Cash', icon: '💵' },
  { value: 'bank_transfer', label: 'Bank Transfer', icon: '🏦' },
  { value: 'digital_wallet', label: 'Digital Wallet', icon: '📱' },
  { value: 'cryptocurrency', label: 'Cryptocurrency', icon: '₿' },
  { value: 'check', label: 'Check', icon: '📝' },
];

const PaymentMethodFormScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { mode = 'create', paymentMethod } = (route.params as any) || {};
  
  const { 
    createPaymentMethod, 
    updatePaymentMethod, 
    isLoading 
  } = useExpenseStore();

  const [formData, setFormData] = useState<PaymentMethodFormData>({
    name: '',
    type: 'credit_card',
    lastFourDigits: '',
    description: '',
  });

  const [showTypePicker, setShowTypePicker] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && paymentMethod) {
      setFormData({
        name: paymentMethod.name,
        type: paymentMethod.type,
        lastFourDigits: paymentMethod.lastFourDigits || '',
        description: paymentMethod.description || '',
      });
    }
  }, [mode, paymentMethod]);

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter a payment method name');
      return;
    }

    try {
      const submitData = {
        ...formData,
        lastFourDigits: formData.lastFourDigits.trim() || undefined,
        description: formData.description.trim() || undefined,
      };

      if (mode === 'create') {
        await createPaymentMethod(submitData);
        Alert.alert('Success', 'Payment method created successfully', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else if (paymentMethod) {
        await updatePaymentMethod(paymentMethod.id, submitData);
        Alert.alert('Success', 'Payment method updated successfully', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to save payment method'
      );
    }
  };

  const getSelectedType = () => {
    return PAYMENT_METHOD_TYPES.find(type => type.value === formData.type) || PAYMENT_METHOD_TYPES[0];
  };

  const showLastFourDigits = () => {
    return ['credit_card', 'debit_card'].includes(formData.type);
  };

  return (
    <View style={styles.container}>
      <Header
        centerComponent={{ 
          text: mode === 'create' ? 'Add Payment Method' : 'Edit Payment Method',
          style: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
        }}
        backgroundColor="#007AFF"
        leftComponent={{
          icon: 'arrow-back',
          color: '#fff',
          onPress: () => navigation.goBack()
        }}
        rightComponent={{
          text: 'Save',
          style: { color: '#fff', fontSize: 16 },
          onPress: handleSubmit
        }}
      />

      <ScrollView style={styles.content}>
        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Payment Method Details</Text>
          
          <Input
            label="Name"
            value={formData.name}
            onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
            placeholder="e.g., Chase Sapphire, Cash, PayPal"
            containerStyle={styles.inputContainer}
            inputStyle={styles.input}
            labelStyle={styles.inputLabel}
          />

          <Text style={styles.fieldLabel}>Type</Text>
          <ListItem
            onPress={() => setShowTypePicker(!showTypePicker)}
            containerStyle={styles.pickerItem}
          >
            <Text style={styles.selectedIcon}>{getSelectedType().icon}</Text>
            <ListItem.Content>
              <ListItem.Title style={styles.pickerValue}>
                {getSelectedType().label}
              </ListItem.Title>
            </ListItem.Content>
            <Icon
              name={showTypePicker ? 'chevron-up' : 'chevron-down'}
              type="feather"
              size={20}
              color="#8E8E93"
            />
          </ListItem>

          {showTypePicker && (
            <View style={styles.typeList}>
              {PAYMENT_METHOD_TYPES.map((type) => (
                <ListItem
                  key={type.value}
                  onPress={() => {
                    setFormData(prev => ({ ...prev, type: type.value }));
                    setShowTypePicker(false);
                  }}
                  containerStyle={styles.typeItem}
                >
                  <Text style={styles.typeIcon}>{type.icon}</Text>
                  <ListItem.Content>
                    <ListItem.Title style={styles.typeName}>
                      {type.label}
                    </ListItem.Title>
                  </ListItem.Content>
                  {formData.type === type.value && (
                    <Icon name="check" type="feather" size={20} color="#007AFF" />
                  )}
                </ListItem>
              ))}
            </View>
          )}

          {showLastFourDigits() && (
            <Input
              label="Last Four Digits (Optional)"
              value={formData.lastFourDigits}
              onChangeText={(text) => setFormData(prev => ({ 
                ...prev, 
                lastFourDigits: text.replace(/\D/g, '').slice(0, 4)
              }))}
              placeholder="1234"
              keyboardType="numeric"
              maxLength={4}
              containerStyle={styles.inputContainer}
              inputStyle={styles.input}
              labelStyle={styles.inputLabel}
            />
          )}

          <Input
            label="Description (Optional)"
            value={formData.description}
            onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
            placeholder="Additional notes about this payment method"
            multiline
            numberOfLines={3}
            containerStyle={styles.inputContainer}
            inputStyle={[styles.input, styles.textArea]}
            labelStyle={styles.inputLabel}
          />
        </View>

        <View style={styles.info}>
          <Text style={styles.infoText}>
            Payment methods help you track how you pay for expenses. This information is useful for budgeting and expense reporting.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.bottomActions}>
        <Button
          title={mode === 'create' ? 'Create Payment Method' : 'Update Payment Method'}
          onPress={handleSubmit}
          loading={isLoading}
          buttonStyle={styles.saveButton}
          titleStyle={styles.saveButtonText}
        />
      </View>
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
  form: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    fontSize: 16,
    color: '#000',
  },
  inputLabel: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: 'normal',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  fieldLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
    marginTop: 8,
  },
  pickerItem: {
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    marginBottom: 16,
    paddingVertical: 12,
  },
  pickerValue: {
    fontSize: 16,
    color: '#000',
  },
  selectedIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  typeList: {
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  typeItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  typeIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  typeName: {
    fontSize: 16,
    color: '#000',
  },
  info: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
    textAlign: 'center',
  },
  bottomActions: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },
});

export default PaymentMethodFormScreen;