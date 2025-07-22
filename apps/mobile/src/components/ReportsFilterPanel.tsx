import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput, Modal, TouchableOpacity, Text as RNText, FlatList } from 'react-native';
import { Icon } from 'react-native-elements';
import { ExpenseFilter } from '@expense-tracker/shared';
import { useExpenseStore } from '../store/useExpenseStore';

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
  const { categories, paymentMethods, tags } = useExpenseStore();
  
  const [minAmount, setMinAmount] = useState<string>(currentFilter?.minAmount?.toString() || '');
  const [maxAmount, setMaxAmount] = useState<string>(currentFilter?.maxAmount?.toString() || '');
  const [searchText, setSearchText] = useState<string>(currentFilter?.searchText || '');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(currentFilter?.categories || []);
  const [selectedPaymentMethodIds, setSelectedPaymentMethodIds] = useState<string[]>(currentFilter?.paymentMethods || []);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(currentFilter?.tags || []);
  
  // Modal states for each filter type
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const [showPaymentMethodsModal, setShowPaymentMethodsModal] = useState(false);
  const [showTagsModal, setShowTagsModal] = useState(false);

  const handleApplyFilter = () => {
    const filter: ExpenseFilter = {
      minAmount: minAmount ? parseFloat(minAmount) : undefined,
      maxAmount: maxAmount ? parseFloat(maxAmount) : undefined,
      searchText: searchText || undefined,
      categories: selectedCategoryIds.length === 0 || selectedCategoryIds.length === categories.length ? undefined : selectedCategoryIds,
      paymentMethods: selectedPaymentMethodIds.length === 0 || selectedPaymentMethodIds.length === paymentMethods.length ? undefined : selectedPaymentMethodIds,
      tags: selectedTagIds.length === 0 || selectedTagIds.length === tags.length ? undefined : selectedTagIds,
    };
    onApplyFilter(filter);
    onClose();
  };

  const handleClearAll = () => {
    setMinAmount('');
    setMaxAmount('');
    setSearchText('');
    setSelectedCategoryIds([]);
    setSelectedPaymentMethodIds([]);
    setSelectedTagIds([]);
  };

  const toggleCategorySelection = (categoryId: string) => {
    setSelectedCategoryIds(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const togglePaymentMethodSelection = (paymentMethodId: string) => {
    setSelectedPaymentMethodIds(prev => 
      prev.includes(paymentMethodId) 
        ? prev.filter(id => id !== paymentMethodId)
        : [...prev, paymentMethodId]
    );
  };

  const toggleTagSelection = (tagId: string) => {
    setSelectedTagIds(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const selectAllCategories = () => {
    setSelectedCategoryIds(categories.map(c => c.id));
  };

  const selectAllPaymentMethods = () => {
    setSelectedPaymentMethodIds(paymentMethods.map(pm => pm.id));
  };

  const selectAllTags = () => {
    setSelectedTagIds(tags.map(t => t.id));
  };

  const getDisplayText = (selectedIds: string[], allItems: any[], itemType: string) => {
    if (selectedIds.length === 0 || selectedIds.length === allItems.length) {
      return `All ${itemType}`;
    }
    if (selectedIds.length === 1) {
      const item = allItems.find(i => i.id === selectedIds[0]);
      return item?.name || `1 ${itemType.slice(0, -1)}`;
    }
    return `${selectedIds.length} ${selectedIds.length === 1 ? itemType.slice(0, -1) : itemType}`;
  };

  const getActiveFiltersCount = (): number => {
    let count = 0;
    if (minAmount && parseFloat(minAmount) > 0) count++;
    if (maxAmount && parseFloat(maxAmount) > 0) count++;
    if (searchText && searchText.trim()) count++;
    if (selectedCategoryIds.length > 0 && selectedCategoryIds.length < categories.length) count++;
    if (selectedPaymentMethodIds.length > 0 && selectedPaymentMethodIds.length < paymentMethods.length) count++;
    if (selectedTagIds.length > 0 && selectedTagIds.length < tags.length) count++;
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
            <RNText style={styles.sectionLabel}>Categories</RNText>
            <TouchableOpacity 
              style={styles.pickerButton} 
              onPress={() => setShowCategoriesModal(true)}
            >
              <RNText style={styles.pickerButtonText}>
                {getDisplayText(selectedCategoryIds, categories, 'categories')}
              </RNText>
              <Icon name="chevron-down" type="feather" size={16} color="#8E8E93" />
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <RNText style={styles.sectionLabel}>Payment Methods</RNText>
            <TouchableOpacity 
              style={styles.pickerButton} 
              onPress={() => setShowPaymentMethodsModal(true)}
            >
              <RNText style={styles.pickerButtonText}>
                {getDisplayText(selectedPaymentMethodIds, paymentMethods, 'payment methods')}
              </RNText>
              <Icon name="chevron-down" type="feather" size={16} color="#8E8E93" />
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <RNText style={styles.sectionLabel}>Tags</RNText>
            <TouchableOpacity 
              style={styles.pickerButton} 
              onPress={() => setShowTagsModal(true)}
            >
              <RNText style={styles.pickerButtonText}>
                {getDisplayText(selectedTagIds, tags, 'tags')}
              </RNText>
              <Icon name="chevron-down" type="feather" size={16} color="#8E8E93" />
            </TouchableOpacity>
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

      {/* Categories Selection Modal */}
      <Modal
        visible={showCategoriesModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCategoriesModal(false)}
      >
        <View style={styles.selectionModalContainer}>
          <View style={styles.selectionModalHeader}>
            <TouchableOpacity onPress={() => setShowCategoriesModal(false)}>
              <RNText style={styles.modalCloseText}>Cancel</RNText>
            </TouchableOpacity>
            <RNText style={styles.selectionModalTitle}>Select Categories</RNText>
            <TouchableOpacity onPress={selectAllCategories}>
              <RNText style={styles.modalSelectAllText}>All</RNText>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={categories}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.selectionItem}
                onPress={() => toggleCategorySelection(item.id)}
              >
                <View style={styles.selectionItemLeft}>
                  <RNText style={styles.categoryIcon}>{item.icon || '📁'}</RNText>
                  <RNText style={styles.selectionItemText}>{item.name}</RNText>
                </View>
                {selectedCategoryIds.includes(item.id) && (
                  <Icon name="check" type="feather" size={20} color="#007AFF" />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>

      {/* Payment Methods Selection Modal */}
      <Modal
        visible={showPaymentMethodsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPaymentMethodsModal(false)}
      >
        <View style={styles.selectionModalContainer}>
          <View style={styles.selectionModalHeader}>
            <TouchableOpacity onPress={() => setShowPaymentMethodsModal(false)}>
              <RNText style={styles.modalCloseText}>Cancel</RNText>
            </TouchableOpacity>
            <RNText style={styles.selectionModalTitle}>Select Payment Methods</RNText>
            <TouchableOpacity onPress={selectAllPaymentMethods}>
              <RNText style={styles.modalSelectAllText}>All</RNText>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={paymentMethods}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.selectionItem}
                onPress={() => togglePaymentMethodSelection(item.id)}
              >
                <View style={styles.selectionItemLeft}>
                  <RNText style={styles.paymentIcon}>💳</RNText>
                  <RNText style={styles.selectionItemText}>{item.name}</RNText>
                </View>
                {selectedPaymentMethodIds.includes(item.id) && (
                  <Icon name="check" type="feather" size={20} color="#007AFF" />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>

      {/* Tags Selection Modal */}
      <Modal
        visible={showTagsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowTagsModal(false)}
      >
        <View style={styles.selectionModalContainer}>
          <View style={styles.selectionModalHeader}>
            <TouchableOpacity onPress={() => setShowTagsModal(false)}>
              <RNText style={styles.modalCloseText}>Cancel</RNText>
            </TouchableOpacity>
            <RNText style={styles.selectionModalTitle}>Select Tags</RNText>
            <TouchableOpacity onPress={selectAllTags}>
              <RNText style={styles.modalSelectAllText}>All</RNText>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={tags}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.selectionItem}
                onPress={() => toggleTagSelection(item.id)}
              >
                <View style={styles.selectionItemLeft}>
                  <View style={[styles.tagColorIndicator, { backgroundColor: item.color || '#007AFF' }]} />
                  <RNText style={styles.selectionItemText}>#{item.name}</RNText>
                </View>
                {selectedTagIds.includes(item.id) && (
                  <Icon name="check" type="feather" size={20} color="#007AFF" />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
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
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#000',
  },
  selectionModalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  selectionModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
    backgroundColor: '#FFFFFF',
  },
  selectionModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  modalCloseText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  modalSelectAllText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  selectionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
    backgroundColor: '#FFFFFF',
  },
  selectionItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectionItemText: {
    fontSize: 16,
    color: '#000',
    marginLeft: 12,
  },
  categoryIcon: {
    fontSize: 20,
    width: 24,
    textAlign: 'center',
  },
  paymentIcon: {
    fontSize: 20,
    width: 24,
    textAlign: 'center',
  },
  tagColorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});

export default ReportsFilterPanel;