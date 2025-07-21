import React, { useState } from 'react';
import { View, StyleSheet, Modal, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, ListItem, Icon, Button, SearchBar, Input, Overlay, ButtonGroup } from 'react-native-elements';
import { useExpenseStore } from '../../store/useExpenseStore';
import { PaymentMethod, PaymentMethodFormData } from '@expense-tracker/shared';

const PAYMENT_METHOD_TYPES = [
  { type: 'cash', name: 'Cash', icon: '💵' },
  { type: 'credit_card', name: 'Credit Card', icon: '💳' },
  { type: 'debit_card', name: 'Debit Card', icon: '💳' },
  { type: 'bank_transfer', name: 'Bank Transfer', icon: '🏦' },
  { type: 'digital_wallet', name: 'Digital Wallet', icon: '📱' },
  { type: 'other', name: 'Other', icon: '💰' },
] as const;

const PAYMENT_METHOD_COLORS = [
  '#007AFF', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE',
];

interface PaymentMethodPickerProps {
  selectedPaymentMethodId?: string;
  selectedPaymentMethodIds?: string[];
  onPaymentMethodSelect?: (paymentMethod: PaymentMethod | null) => void;
  onPaymentMethodsSelect?: (paymentMethods: PaymentMethod[]) => void;
  placeholder?: string;
  allowClear?: boolean;
  allowMultiple?: boolean;
  style?: any;
}

const PaymentMethodPicker: React.FC<PaymentMethodPickerProps> = ({
  selectedPaymentMethodId,
  selectedPaymentMethodIds = [],
  onPaymentMethodSelect,
  onPaymentMethodsSelect,
  placeholder = "Select Payment Method",
  allowClear = true,
  allowMultiple = false,
  style
}) => {
  const { paymentMethods, createPaymentMethod, isLoading } = useExpenseStore();
  const [isVisible, setIsVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPaymentMethodData, setNewPaymentMethodData] = useState<PaymentMethodFormData>({
    type: 'cash',
    name: '',
    color: PAYMENT_METHOD_COLORS[0],
    icon: '💵',
  });
  const [selectedTypeIndex, setSelectedTypeIndex] = useState(0);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const resetNewPaymentMethodData = () => {
    setNewPaymentMethodData({
      type: 'cash',
      name: '',
      color: PAYMENT_METHOD_COLORS[0],
      icon: '💵',
    });
    setSelectedTypeIndex(0);
  };

  const handleCreatePaymentMethod = async () => {
    if (!newPaymentMethodData.name.trim()) {
      Alert.alert('Error', 'Please enter a payment method name');
      return;
    }

    try {
      const paymentMethodId = await createPaymentMethod(newPaymentMethodData);
      const newPaymentMethod = paymentMethods.find(pm => pm.id === paymentMethodId);
      if (newPaymentMethod) {
        onPaymentMethodSelect(newPaymentMethod);
      }
      setShowCreateModal(false);
      setIsVisible(false);
      resetNewPaymentMethodData();
      Alert.alert('Success', 'Payment method created successfully!');
    } catch {
      Alert.alert('Error', 'Failed to create payment method. Please try again.');
    }
  };

  const handleTypeSelection = (index: number) => {
    setSelectedTypeIndex(index);
    const selectedType = PAYMENT_METHOD_TYPES[index];
    setNewPaymentMethodData(prev => ({
      ...prev,
      type: selectedType.type,
      icon: selectedType.icon,
    }));
  };

  const selectedPaymentMethod = paymentMethods.find(pm => pm.id === selectedPaymentMethodId);
  const selectedPaymentMethods = paymentMethods.filter(pm => selectedPaymentMethodIds.includes(pm.id));

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
    if (allowMultiple && onPaymentMethodsSelect) {
      if (!paymentMethod) return;
      
      const currentSelected = paymentMethods.filter(pm => selectedPaymentMethodIds.includes(pm.id));
      const isSelected = selectedPaymentMethodIds.includes(paymentMethod.id);
      
      let newSelected: PaymentMethod[];
      if (isSelected) {
        // Remove from selection
        newSelected = currentSelected.filter(pm => pm.id !== paymentMethod.id);
      } else {
        // Add to selection
        newSelected = [...currentSelected, paymentMethod];
      }
      
      onPaymentMethodsSelect(newSelected);
    } else if (onPaymentMethodSelect) {
      onPaymentMethodSelect(paymentMethod);
      setIsVisible(false);
      setSearchQuery('');
    }
  };

  const renderPaymentMethodItem = (paymentMethod: PaymentMethod) => (
    <ListItem
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
      {(allowMultiple ? selectedPaymentMethodIds.includes(paymentMethod.id) : selectedPaymentMethodId === paymentMethod.id) && (
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
        {allowMultiple ? (
          selectedPaymentMethods.length > 0 ? (
            <ListItem.Content>
              <ListItem.Title style={styles.selectedText}>
                {selectedPaymentMethods.length === 1 
                  ? selectedPaymentMethods[0].name
                  : `${selectedPaymentMethods.length} payment methods selected`
                }
              </ListItem.Title>
            </ListItem.Content>
          ) : (
            <ListItem.Content>
              <ListItem.Title style={styles.placeholderText}>
                {placeholder}
              </ListItem.Title>
            </ListItem.Content>
          )
        ) : (
          selectedPaymentMethod ? (
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
          )
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
                onPress={() => {
                  if (allowMultiple && onPaymentMethodsSelect) {
                    onPaymentMethodsSelect([]);
                  } else {
                    handlePaymentMethodSelect(null);
                  }
                }}
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
                {(allowMultiple ? selectedPaymentMethodIds.length === 0 : !selectedPaymentMethodId) && (
                  <Icon name="check" type="feather" size={20} color="#007AFF" />
                )}
              </ListItem>
            )}

            {allowMultiple && filteredPaymentMethods.length > 0 && (
              <ListItem
                onPress={() => {
                  if (onPaymentMethodsSelect) {
                    onPaymentMethodsSelect(filteredPaymentMethods);
                  }
                }}
                containerStyle={[styles.paymentMethodItem, styles.selectAllItem]}
              >
                <Icon
                  name="check-square"
                  type="feather"
                  size={20}
                  color="#007AFF"
                />
                <ListItem.Content>
                  <ListItem.Title style={styles.selectAllText}>
                    Select All
                  </ListItem.Title>
                </ListItem.Content>
              </ListItem>
            )}

            {filteredPaymentMethods.map(paymentMethod => (
              <React.Fragment key={paymentMethod.id}>
                {renderPaymentMethodItem(paymentMethod)}
              </React.Fragment>
            ))}

            <ListItem
              onPress={() => setShowCreateModal(true)}
              containerStyle={styles.createItem}
            >
              <Icon
                name="plus"
                type="feather"
                size={20}
                color="#007AFF"
              />
              <ListItem.Content>
                <ListItem.Title style={styles.createText}>
                  Create New Payment Method
                </ListItem.Title>
              </ListItem.Content>
            </ListItem>

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

      <Overlay
        isVisible={showCreateModal}
        onBackdropPress={() => setShowCreateModal(false)}
        overlayStyle={styles.createModal}
      >
        <ScrollView style={styles.createModalContent}>
          <Text style={styles.createModalTitle}>Create New Payment Method</Text>

          <Input
            label="Name"
            value={newPaymentMethodData.name}
            onChangeText={(text) =>
              setNewPaymentMethodData(prev => ({ ...prev, name: text }))
            }
            placeholder="Enter payment method name"
            containerStyle={styles.inputContainer}
          />

          <Text style={styles.sectionLabel}>Type</Text>
          <ButtonGroup
            buttons={PAYMENT_METHOD_TYPES.map(type => type.name)}
            selectedIndex={selectedTypeIndex}
            onPress={handleTypeSelection}
            containerStyle={styles.typeButtonGroup}
            selectedButtonStyle={styles.selectedTypeButton}
          />

          <TouchableOpacity
            style={styles.pickerRow}
            onPress={() => setShowColorPicker(true)}
          >
            <Text style={styles.pickerLabel}>Color</Text>
            <View style={styles.pickerValue}>
              <View
                style={[styles.colorPreview, { backgroundColor: newPaymentMethodData.color }]}
              />
              <Icon name="chevron-right" size={16} color="#666" />
            </View>
          </TouchableOpacity>

          <View style={styles.createModalButtons}>
            <Button
              title="Cancel"
              type="outline"
              onPress={() => {
                setShowCreateModal(false);
                resetNewPaymentMethodData();
              }}
              buttonStyle={styles.cancelCreateButton}
            />
            <Button
              title="Create"
              onPress={handleCreatePaymentMethod}
              loading={isLoading}
              buttonStyle={styles.createButton}
            />
          </View>
        </ScrollView>
      </Overlay>

      <Overlay
        isVisible={showColorPicker}
        onBackdropPress={() => setShowColorPicker(false)}
        overlayStyle={styles.colorPickerModal}
      >
        <View style={styles.colorPickerContent}>
          <Text style={styles.colorPickerTitle}>Select Color</Text>
          <View style={styles.colorGrid}>
            {PAYMENT_METHOD_COLORS.map((color, index) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorButton,
                  { backgroundColor: color },
                  newPaymentMethodData.color === color && styles.selectedColorButton,
                ]}
                onPress={() => {
                  setNewPaymentMethodData(prev => ({ ...prev, color }));
                  setShowColorPicker(false);
                }}
              >
                {newPaymentMethodData.color === color && (
                  <Icon name="check" size={16} color="white" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Overlay>
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
  selectAllItem: {
    backgroundColor: '#F0F8FF',
  },
  selectAllText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
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
  createItem: {
    backgroundColor: '#F0F8FF',
    paddingVertical: 12,
    borderBottomWidth: 0,
  },
  createText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
    marginLeft: 8,
  },
  createModal: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 12,
  },
  createModalContent: {
    padding: 20,
  },
  createModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
    marginLeft: 10,
  },
  typeButtonGroup: {
    borderRadius: 8,
    marginBottom: 16,
    height: 40,
  },
  selectedTypeButton: {
    backgroundColor: '#007AFF',
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginBottom: 12,
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  pickerValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorPreview: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  createModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelCreateButton: {
    borderColor: '#666',
    borderWidth: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: 24,
  },
  createButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
  },
  colorPickerModal: {
    width: '70%',
    borderRadius: 12,
  },
  colorPickerContent: {
    padding: 20,
  },
  colorPickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  colorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedColorButton: {
    borderWidth: 3,
    borderColor: '#333',
  },
});

export default PaymentMethodPicker;