import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Overlay, Input, Icon } from 'react-native-elements';
import { ExpenseFilter, DateRange, ExpenseCategory, PaymentMethod } from '@expense-tracker/shared';
import { DateRangePicker, CategoryPicker, PaymentMethodPicker, TagSelector } from './pickers';

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
  const [dateRange, setDateRange] = useState<DateRange | undefined>(currentFilter?.dateRange);
  const [selectedCategories, setSelectedCategories] = useState<ExpenseCategory[]>([]);
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(currentFilter?.tags || []);
  const [minAmount, setMinAmount] = useState<string>(currentFilter?.minAmount?.toString() || '');
  const [maxAmount, setMaxAmount] = useState<string>(currentFilter?.maxAmount?.toString() || '');
  const [searchText, setSearchText] = useState<string>(currentFilter?.searchText || '');

  const handleApplyFilter = () => {
    const filter: ExpenseFilter = {};

    if (dateRange) {
      filter.dateRange = dateRange;
    }

    if (selectedCategories.length > 0) {
      filter.categories = selectedCategories.map(cat => cat.id);
    }

    if (selectedPaymentMethods.length > 0) {
      filter.paymentMethods = selectedPaymentMethods.map(pm => pm.id);
    }

    if (selectedTagIds.length > 0) {
      filter.tags = selectedTagIds;
    }

    if (minAmount.trim()) {
      const min = parseFloat(minAmount);
      if (!isNaN(min) && min >= 0) {
        filter.minAmount = min;
      }
    }

    if (maxAmount.trim()) {
      const max = parseFloat(maxAmount);
      if (!isNaN(max) && max >= 0) {
        filter.maxAmount = max;
      }
    }

    if (searchText.trim()) {
      filter.searchText = searchText.trim();
    }

    onApplyFilter(filter);
    onClose();
  };

  const handleClearAll = () => {
    setDateRange(undefined);
    setSelectedCategories([]);
    setSelectedPaymentMethods([]);
    setSelectedTagIds([]);
    setMinAmount('');
    setMaxAmount('');
    setSearchText('');
  };

  const getActiveFiltersCount = (): number => {
    let count = 0;
    if (dateRange) count++;
    if (selectedCategories.length > 0) count++;
    if (selectedPaymentMethods.length > 0) count++;
    if (selectedTagIds.length > 0) count++;
    if (minAmount.trim()) count++;
    if (maxAmount.trim()) count++;
    if (searchText.trim()) count++;
    return count;
  };

  return (
    <Overlay
      isVisible={isVisible}
      onBackdropPress={onClose}
      overlayStyle={styles.overlay}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Filter Reports</Text>
          <Button
            title="Clear All"
            type="clear"
            titleStyle={styles.clearAllButton}
            onPress={handleClearAll}
          />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Date Range</Text>
            <DateRangePicker
              selectedRange={dateRange}
              onRangeSelect={setDateRange}
              placeholder="Select date range (all time)"
              allowClear={true}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Categories</Text>
            <CategoryPicker
              selectedCategoryIds={selectedCategories.map(cat => cat.id)}
              onCategoriesSelect={setSelectedCategories}
              placeholder="Select categories (all categories)"
              allowClear={true}
              allowMultiple={true}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Payment Methods</Text>
            <PaymentMethodPicker
              selectedPaymentMethodIds={selectedPaymentMethods.map(pm => pm.id)}
              onPaymentMethodsSelect={setSelectedPaymentMethods}
              placeholder="Select payment methods (all methods)"
              allowClear={true}
              allowMultiple={true}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Tags</Text>
            <TagSelector
              selectedTagIds={selectedTagIds}
              onTagsSelect={setSelectedTagIds}
              placeholder="Select tags (all tags)"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Amount Range</Text>
            <View style={styles.amountRow}>
              <Input
                label="Min Amount"
                value={minAmount}
                onChangeText={setMinAmount}
                keyboardType="decimal-pad"
                placeholder="0.00"
                leftIcon={<Icon name="attach-money" color="#666" size={20} />}
                containerStyle={styles.amountInput}
                inputStyle={styles.amountInputText}
                labelStyle={styles.amountLabel}
              />
              <Input
                label="Max Amount"
                value={maxAmount}
                onChangeText={setMaxAmount}
                keyboardType="decimal-pad"
                placeholder="No limit"
                leftIcon={<Icon name="attach-money" color="#666" size={20} />}
                containerStyle={styles.amountInput}
                inputStyle={styles.amountInputText}
                labelStyle={styles.amountLabel}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Search Text</Text>
            <Input
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Search in descriptions, vendors, notes..."
              leftIcon={<Icon name="search" color="#666" />}
              containerStyle={styles.searchInput}
              inputStyle={styles.searchInputText}
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Text style={styles.filtersCount}>
            {getActiveFiltersCount()} filter{getActiveFiltersCount() !== 1 ? 's' : ''} active
          </Text>
          <View style={styles.footerButtons}>
            <Button
              title="Cancel"
              type="outline"
              onPress={onClose}
              buttonStyle={styles.cancelButton}
              titleStyle={styles.cancelButtonText}
            />
            <Button
              title="Apply Filters"
              onPress={handleApplyFilter}
              buttonStyle={styles.applyButton}
              titleStyle={styles.applyButtonText}
            />
          </View>
        </View>
      </View>
    </Overlay>
  );
};

const styles = StyleSheet.create({
  overlay: {
    width: '95%',
    maxHeight: '85%',
    borderRadius: 16,
    padding: 0,
  },
  container: {
    flex: 1,
    maxHeight: 600,
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
  amountInputText: {
    fontSize: 16,
    color: '#000',
  },
  amountLabel: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: 'normal',
  },
  searchInput: {
    marginBottom: 0,
  },
  searchInputText: {
    fontSize: 16,
    color: '#000',
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
    flex: 1,
  },
  cancelButtonText: {
    color: '#8E8E93',
    fontSize: 16,
  },
  applyButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    flex: 1,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ReportsFilterPanel;