import React, { useState } from 'react';
import { View, StyleSheet, Modal, ScrollView } from 'react-native';
import { Text, ListItem, Icon, Button, SearchBar } from 'react-native-elements';
import { useExpenseStore } from '../../store/useExpenseStore';
import { ExpenseCategory } from '@expense-tracker/shared';

interface CategoryPickerProps {
  selectedCategoryId?: string;
  onCategorySelect: (category: ExpenseCategory | null) => void;
  placeholder?: string;
  allowClear?: boolean;
  excludeCategories?: string[];
  style?: any;
}

const CategoryPicker: React.FC<CategoryPickerProps> = ({
  selectedCategoryId,
  onCategorySelect,
  placeholder = "Select Category",
  allowClear = true,
  excludeCategories = [],
  style
}) => {
  const { categories } = useExpenseStore();
  const [isVisible, setIsVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedCategory = categories.find(cat => cat.id === selectedCategoryId);

  const filteredCategories = categories.filter(category => {
    const matchesSearch = !searchQuery || 
      category.name.toLowerCase().includes(searchQuery.toLowerCase());
    const notExcluded = !excludeCategories.includes(category.id);
    return matchesSearch && notExcluded;
  });

  const handleCategorySelect = (category: ExpenseCategory | null) => {
    onCategorySelect(category);
    setIsVisible(false);
    setSearchQuery('');
  };

  const renderCategoryItem = (category: ExpenseCategory) => (
    <ListItem
      key={category.id}
      onPress={() => handleCategorySelect(category)}
      containerStyle={styles.categoryItem}
    >
      <Text style={styles.categoryIcon}>{category.icon}</Text>
      <ListItem.Content>
        <ListItem.Title style={styles.categoryName}>
          {category.name}
        </ListItem.Title>
      </ListItem.Content>
      {selectedCategoryId === category.id && (
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
        {selectedCategory ? (
          <>
            <Text style={styles.selectedIcon}>{selectedCategory.icon}</Text>
            <ListItem.Content>
              <ListItem.Title style={styles.selectedText}>
                {selectedCategory.name}
              </ListItem.Title>
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
            <Text style={styles.modalTitle}>Select Category</Text>
            <Button
              title="Done"
              type="clear"
              titleStyle={styles.doneButton}
              onPress={() => setIsVisible(false)}
            />
          </View>

          <SearchBar
            placeholder="Search categories..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            containerStyle={styles.searchContainer}
            inputContainerStyle={styles.searchInput}
            lightTheme
          />

          <ScrollView style={styles.modalContent}>
            {allowClear && (
              <ListItem
                onPress={() => handleCategorySelect(null)}
                containerStyle={[styles.categoryItem, styles.clearItem]}
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
                {!selectedCategoryId && (
                  <Icon name="check" type="feather" size={20} color="#007AFF" />
                )}
              </ListItem>
            )}

            {filteredCategories.map(renderCategoryItem)}

            {filteredCategories.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  {searchQuery ? 'No matching categories found' : 'No categories available'}
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
  categoryItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
    color: '#000',
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

export default CategoryPicker;