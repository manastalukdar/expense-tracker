import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, ListItem, Icon, Button, SearchBar } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import { useExpenseStore } from '../../store/useExpenseStore';
import { PaymentMethod } from '@expense-tracker/shared';

const PaymentMethodManagementScreen: React.FC = () => {
  const navigation = useNavigation();
  const { 
    paymentMethods, 
    deletePaymentMethod, 
    isLoading 
  } = useExpenseStore();

  const [searchQuery, setSearchQuery] = useState('');

  const handleAddPaymentMethod = () => {
    navigation.navigate('PaymentMethodForm' as never, { mode: 'create' } as never);
  };

  const handleEditPaymentMethod = (paymentMethod: PaymentMethod) => {
    navigation.navigate('PaymentMethodForm' as never, { 
      mode: 'edit', 
      paymentMethod 
    } as never);
  };

  const handleDeletePaymentMethod = (paymentMethod: PaymentMethod) => {
    Alert.alert(
      'Delete Payment Method',
      `Are you sure you want to delete "${paymentMethod.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePaymentMethod(paymentMethod.id);
            } catch (error) {
              Alert.alert(
                'Error',
                error instanceof Error ? error.message : 'Failed to delete payment method'
              );
            }
          },
        },
      ]
    );
  };

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

  const filteredPaymentMethods = searchQuery
    ? paymentMethods.filter(pm => 
        pm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getPaymentMethodTypeName(pm.type).toLowerCase().includes(searchQuery.toLowerCase())
      )
    : paymentMethods;

  return (
    <View style={styles.container}>
      <SearchBar
        placeholder="Search payment methods..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        containerStyle={styles.searchContainer}
        inputContainerStyle={styles.searchInput}
        lightTheme
      />

      <ScrollView style={styles.content}>
        <View style={styles.paymentMethodList}>
          {filteredPaymentMethods.map((paymentMethod) => (
            <ListItem
              key={paymentMethod.id}
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
                {paymentMethod.description && (
                  <Text style={styles.paymentMethodDescription}>
                    {paymentMethod.description}
                  </Text>
                )}
              </ListItem.Content>
              
              <View style={styles.paymentMethodActions}>
                <Icon
                  name="edit-3"
                  type="feather"
                  size={18}
                  color="#007AFF"
                  onPress={() => handleEditPaymentMethod(paymentMethod)}
                  containerStyle={styles.actionIcon}
                />
                <Icon
                  name="trash-2"
                  type="feather"
                  size={18}
                  color="#FF3B30"
                  onPress={() => handleDeletePaymentMethod(paymentMethod)}
                  containerStyle={styles.actionIcon}
                />
              </View>
            </ListItem>
          ))}
        </View>

        {paymentMethods.length === 0 && !isLoading && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No Payment Methods Yet</Text>
            <Text style={styles.emptySubtitle}>
              Add your first payment method to start tracking how you pay for expenses.
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomActions}>
        <Button
          title="Add Payment Method"
          onPress={handleAddPaymentMethod}
          buttonStyle={styles.addButton}
          titleStyle={styles.addButtonText}
          icon={
            <Icon
              name="plus"
              type="feather"
              size={20}
              color="white"
              containerStyle={{ marginRight: 8 }}
            />
          }
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
  searchContainer: {
    backgroundColor: '#F2F2F7',
    borderTopWidth: 0,
    borderBottomWidth: 0,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  searchInput: {
    backgroundColor: 'white',
    borderRadius: 10,
  },
  content: {
    flex: 1,
  },
  paymentMethodList: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  paymentMethodItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
    alignItems: 'flex-start',
  },
  paymentMethodIcon: {
    fontSize: 24,
    marginRight: 12,
    marginTop: 2,
  },
  paymentMethodName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  paymentMethodType: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 2,
  },
  paymentMethodDescription: {
    fontSize: 13,
    color: '#B0B0B0',
    fontStyle: 'italic',
  },
  paymentMethodActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    padding: 8,
    marginLeft: 4,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
  },
  bottomActions: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  addButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
  },
  addButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },
});

export default PaymentMethodManagementScreen;