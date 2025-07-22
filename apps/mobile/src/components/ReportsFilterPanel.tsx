import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput, Modal, TouchableOpacity, Text as RNText } from 'react-native';
import { Icon } from 'react-native-elements';
import { ExpenseFilter } from '@expense-tracker/shared';

interface ReportsFilterPanelProps {
  isVisible: boolean;
  onClose: () => void;
  onApplyFilter: (filter: ExpenseFilter) => void;
  currentFilter?: ExpenseFilter;
}

const ReportsFilterPanel: React.FC<ReportsFilterPanelProps> = ({
  isVisible,
  onClose,
  onApplyFilter,
  currentFilter
}) => {
  const [minAmount, setMinAmount] = useState<string>(currentFilter?.minAmount?.toString() || '');
  const [maxAmount, setMaxAmount] = useState<string>(currentFilter?.maxAmount?.toString() || '');
  const [searchText, setSearchText] = useState<string>(currentFilter?.searchText || '');

  const handleApplyFilter = () => {
    const filter: ExpenseFilter = {
      minAmount: minAmount ? parseFloat(minAmount) : undefined,
      maxAmount: maxAmount ? parseFloat(maxAmount) : undefined,
      searchText: searchText || undefined,
    };
    onApplyFilter(filter);
    onClose();
  };

  const handleClearAll = () => {
    setMinAmount('');
    setMaxAmount('');
    setSearchText('');
  };

  const getActiveFiltersCount = (): number => {
    let count = 0;
    if (minAmount && parseFloat(minAmount) > 0) count++;
    if (maxAmount && parseFloat(maxAmount) > 0) count++;
    if (searchText && searchText.trim()) count++;
    return count;
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <RNText style={styles.title}>Filter Reports</RNText>
          <TouchableOpacity onPress={handleClearAll}>
            <RNText style={styles.clearAllButton}>Clear All</RNText>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <RNText style={styles.sectionLabel}>Search</RNText>
            <View style={styles.inputWithIcon}>
              <Icon
                name="search"
                type="feather"
                size={16}
                color="#8E8E93"
              />
              <TextInput
                style={styles.searchInputText}
                placeholder="Search expenses..."
                value={searchText}
                onChangeText={setSearchText}
                placeholderTextColor="#8E8E93"
              />
            </View>
          </View>

          <View style={styles.section}>
            <RNText style={styles.sectionLabel}>Amount Range</RNText>
            <View style={styles.amountRow}>
              <View style={[styles.amountInput, { marginRight: 8 }]}>
                <RNText style={styles.amountLabel}>Min Amount</RNText>
                <View style={styles.inputWithIcon}>
                  <Icon
                    name="dollar-sign"
                    type="feather"
                    size={16}
                    color="#8E8E93"
                  />
                  <TextInput
                    style={styles.amountInputText}
                    placeholder="0.00"
                    value={minAmount}
                    onChangeText={setMinAmount}
                    keyboardType="numeric"
                    placeholderTextColor="#8E8E93"
                  />
                </View>
              </View>
              <View style={[styles.amountInput, { marginLeft: 8 }]}>
                <RNText style={styles.amountLabel}>Max Amount</RNText>
                <View style={styles.inputWithIcon}>
                  <Icon
                    name="dollar-sign"
                    type="feather"
                    size={16}
                    color="#8E8E93"
                  />
                  <TextInput
                    style={styles.amountInputText}
                    placeholder="999.99"
                    value={maxAmount}
                    onChangeText={setMaxAmount}
                    keyboardType="numeric"
                    placeholderTextColor="#8E8E93"
                  />
                </View>
              </View>
            </View>
          </View>

          <RNText style={styles.tempMessage}>
            Date Range, Categories, Payment Methods, and Tags filters will be added in the next update.
          </RNText>
        </ScrollView>

        <View style={styles.footer}>
          <RNText style={styles.filtersCount}>
            {getActiveFiltersCount()} filter{getActiveFiltersCount() === 1 ? '' : 's'} active
          </RNText>
          <View style={styles.footerButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <RNText style={styles.cancelButtonText}>Cancel</RNText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={handleApplyFilter}>
              <RNText style={styles.applyButtonText}>Apply Filters</RNText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  clearAllButton: {
    color: '#FF3B30',
    fontSize: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 16,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  amountInput: {
    flex: 1,
    marginBottom: 0,
    marginHorizontal: 6,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F8F8F8',
  },
  amountInputText: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    marginLeft: 8,
    padding: 0,
  },
  amountLabel: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: 'normal',
    marginBottom: 8,
  },
  searchInputText: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    marginLeft: 8,
    padding: 0,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
    backgroundColor: '#FAFAFA',
  },
  filtersCount: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 12,
  },
  footerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    borderColor: '#8E8E93',
    borderWidth: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#8E8E93',
    fontSize: 16,
  },
  applyButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  tempMessage: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 20,
    paddingHorizontal: 20,
  },
});

export default ReportsFilterPanel;