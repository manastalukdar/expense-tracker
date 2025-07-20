import React, { useState } from 'react';
import { View, StyleSheet, Modal, ScrollView } from 'react-native';
import { Text, ListItem, Icon, Button, SearchBar } from 'react-native-elements';
import { useExpenseStore } from '../../store/useExpenseStore';
import { PaymentMethod } from '@expense-tracker/shared';

interface PaymentMethodPickerProps {
  selectedPaymentMethodId?: string;
  onPaymentMethodSelect: (paymentMethod: PaymentMethod | null) => void;
  placeholder?: string;
  allowClear?: boolean;
  style?: any;
}

const PaymentMethodPicker: React.FC<PaymentMethodPickerProps> = ({
  selectedPaymentMethodId,
  onPaymentMethodSelect,
  placeholder = "Select Payment Method",
  allowClear = true,
  style
}) => {
  const { paymentMethods } = useExpenseStore();
  const [isVisible, setIsVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedPaymentMethod = paymentMethods.find(pm => pm.id === selectedPaymentMethodId);

  const filteredPaymentMethods = paymentMethods.filter(paymentMethod => 
    !searchQuery || 
    paymentMethod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getPaymentMethodTypeName(paymentMethod.type).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case 'credit_card': return '💳';
      case 'debit_card': return '💳';
      case 'cash': return '💵';
      case 'bank_transfer': return '🏦';
      case 'digital_wallet': return '📱';
      case 'cryptocurrency': return '₿';
      case 'check': return '📝';
      default: return '💳';
    }
  };

  const getPaymentMethodTypeName = (type: string) => {
    switch (type) {
      case 'credit_card': return 'Credit Card';
      case 'debit_card': return 'Debit Card';
      case 'cash': return 'Cash';
      case 'bank_transfer': return 'Bank Transfer';
      case 'digital_wallet': return 'Digital Wallet';
      case 'cryptocurrency': return 'Cryptocurrency';
      case 'check': return 'Check';
      default: return type;
    }
  };

  const handlePaymentMethodSelect = (paymentMethod: PaymentMethod | null) => {
    onPaymentMethodSelect(paymentMethod);
    setIsVisible(false);
    setSearchQuery('');
  };

  const renderPaymentMethodItem = (paymentMethod: PaymentMethod) => (
    <ListItem
      key={paymentMethod.id}
      onPress={() => handlePaymentMethodSelect(paymentMethod)}
      containerStyle={styles.paymentMethodItem}
    >
      <Text style={styles.paymentMethodIcon}>
        {getPaymentMethodIcon(paymentMethod.type)}
      </Text>
      <ListItem.Content>
        <ListItem.Title style={styles.paymentMethodName}>
          {paymentMethod.name}
        </ListItem.Title>
        <ListItem.Subtitle style={styles.paymentMethodType}>
          {getPaymentMethodTypeName(paymentMethod.type)}
          {paymentMethod.lastFourDigits && ` •••• ${paymentMethod.lastFourDigits}`}
        </ListItem.Subtitle>
      </ListItem.Content>
      {selectedPaymentMethodId === paymentMethod.id && (
        <Icon name="check" type="feather" size={20} color="#007AFF" />
      )}
    </ListItem>
  );

  return (
    <View style={[styles.container, style]}>
      <ListItem
        onPress={() => setIsVisible(true)}
        containerStyle={styles.pickerButton}
      >
        {selectedPaymentMethod ? (
          <>
            <Text style={styles.selectedIcon}>
              {getPaymentMethodIcon(selectedPaymentMethod.type)}
            </Text>
            <ListItem.Content>
              <ListItem.Title style={styles.selectedText}>
                {selectedPaymentMethod.name}
              </ListItem.Title>
              <ListItem.Subtitle style={styles.selectedSubtext}>
                {getPaymentMethodTypeName(selectedPaymentMethod.type)}
                {selectedPaymentMethod.lastFourDigits && ` •••• ${selectedPaymentMethod.lastFourDigits}`}
              </ListItem.Subtitle>
            </ListItem.Content>
          </>
        ) : (
          <ListItem.Content>
            <ListItem.Title style={styles.placeholderText}>
              {placeholder}
            </ListItem.Title>
          </ListItem.Content>
        )}
        <Icon
          name="chevron-down"
          type="feather"
          size={20}
          color="#8E8E93"
        />
      </ListItem>

      <Modal
        visible={isVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Button
              title="Cancel"
              type="clear"
              titleStyle={styles.cancelButton}
              onPress={() => {
                setIsVisible(false);
                setSearchQuery('');
              }}
            />
            <Text style={styles.modalTitle}>Select Payment Method</Text>
            <Button
              title="Done"
              type="clear"
              titleStyle={styles.doneButton}
              onPress={() => setIsVisible(false)}
            />
          </View>

          <SearchBar
            placeholder="Search payment methods..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            containerStyle={styles.searchContainer}
            inputContainerStyle={styles.searchInput}
            lightTheme
          />

          <ScrollView style={styles.modalContent}>
            {allowClear && (
              <ListItem
                onPress={() => handlePaymentMethodSelect(null)}
                containerStyle={[styles.paymentMethodItem, styles.clearItem]}
              >
                <Icon
                  name="x"
                  type="feather"
                  size={20}
                  color="#FF3B30"
                />
                <ListItem.Content>
                  <ListItem.Title style={styles.clearText}>
                    Clear Selection
                  </ListItem.Title>
                </ListItem.Content>
                {!selectedPaymentMethodId && (
                  <Icon name="check" type="feather" size={20} color="#007AFF" />
                )}
              </ListItem>
            )}

            {filteredPaymentMethods.map(renderPaymentMethodItem)}

            {filteredPaymentMethods.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  {searchQuery ? 'No matching payment methods found' : 'No payment methods available'}
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  pickerButton: {
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    paddingVertical: 12,
  },
  selectedIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  selectedText: {
    fontSize: 16,
    color: '#000',
  },
  selectedSubtext: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  placeholderText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  modal: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  cancelButton: {
    color: '#8E8E93',
    fontSize: 16,
  },
  doneButton: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  searchContainer: {
    backgroundColor: '#F2F2F7',
    borderTopWidth: 0,
    borderBottomWidth: 0,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchInput: {
    backgroundColor: 'white',
    borderRadius: 10,
  },
  modalContent: {
    flex: 1,
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
  },
  paymentMethodItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
    alignItems: 'flex-start',
  },
  paymentMethodIcon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  paymentMethodName: {
    fontSize: 16,
    color: '#000',
    marginBottom: 2,
  },
  paymentMethodType: {
    fontSize: 14,
    color: '#8E8E93',
  },
  clearItem: {
    backgroundColor: '#FFF5F5',
  },
  clearText: {
    fontSize: 16,
    color: '#FF3B30',
    marginLeft: 8,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
});

export default PaymentMethodPicker;