import React, { useState } from 'react';
import { View, StyleSheet, Modal, ScrollView, TouchableOpacity, Alert, Text as RNText } from 'react-native';
import { Text, ListItem, Icon, Button, SearchBar, Input, Overlay } from 'react-native-elements';
import { useExpenseStore } from '../../store/useExpenseStore';
import { ExpenseCategory, CategoryFormData } from '@expense-tracker/shared';

const CATEGORY_ICONS = [
  '🍔', '🏠', '🚗', '🎓', '💊', '🎬', '🛍️', '✈️',
  '💰', '📱', '⚽', '🎯', '🎨', '📚', '🔧', '👕',
  '🍕', '☕', '⛽', '🚌', '🎵', '💼', '🎮', '🏥',
];

const CATEGORY_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
];

interface CategoryPickerProps {
  selectedCategoryId?: string;
  selectedCategoryIds?: string[];
  onCategorySelect?: (category: ExpenseCategory | null) => void;
  onCategoriesSelect?: (categories: ExpenseCategory[]) => void;
  placeholder?: string;
  allowClear?: boolean;
  allowMultiple?: boolean;
  excludeCategories?: string[];
  style?: any;
}

const CategoryPicker: React.FC<CategoryPickerProps> = ({
  selectedCategoryId,
  selectedCategoryIds = [],
  onCategorySelect,
  onCategoriesSelect,
  placeholder = "Select Category",
  allowClear = true,
  allowMultiple = false,
  excludeCategories = [],
  style
}) => {
  const { categories, createCategory, isLoading } = useExpenseStore();
  const [isVisible, setIsVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCategoryData, setNewCategoryData] = useState<CategoryFormData>({
    name: '',
    color: CATEGORY_COLORS[0],
    icon: '',
    parentId: undefined,
  });
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const resetNewCategoryData = () => {
    setNewCategoryData({
      name: '',
      color: CATEGORY_COLORS[0],
      icon: '',
      parentId: undefined,
    });
  };

  const handleCreateCategory = async () => {
    if (!newCategoryData.name.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    try {
      const categoryId = await createCategory(newCategoryData);
      const newCategory = categories.find(cat => cat.id === categoryId);
      if (newCategory) {
        onCategorySelect(newCategory);
      }
      setShowCreateModal(false);
      setIsVisible(false);
      resetNewCategoryData();
      Alert.alert('Success', 'Category created successfully!');
    } catch {
      Alert.alert('Error', 'Failed to create category. Please try again.');
    }
  };

  const selectedCategory = categories.find(cat => cat.id === selectedCategoryId);
  const selectedCategories = categories.filter(cat => selectedCategoryIds.includes(cat.id));

  const filteredCategories = categories.filter(category => {
    const matchesSearch = !searchQuery || 
      category.name.toLowerCase().includes(searchQuery.toLowerCase());
    const notExcluded = !excludeCategories.includes(category.id);
    return matchesSearch && notExcluded;
  });

  const handleCategorySelect = (category: ExpenseCategory | null) => {
    if (allowMultiple && onCategoriesSelect) {
      if (!category) return;
      
      const currentSelected = categories.filter(cat => selectedCategoryIds.includes(cat.id));
      const isSelected = selectedCategoryIds.includes(category.id);
      
      let newSelected: ExpenseCategory[];
      if (isSelected) {
        // Remove from selection
        newSelected = currentSelected.filter(cat => cat.id !== category.id);
      } else {
        // Add to selection
        newSelected = [...currentSelected, category];
      }
      
      onCategoriesSelect(newSelected);
    } else if (onCategorySelect) {
      onCategorySelect(category);
      setIsVisible(false);
      setSearchQuery('');
    }
  };

  const renderCategoryItem = (category: ExpenseCategory) => (
    <ListItem
      onPress={() => handleCategorySelect(category)}
      containerStyle={styles.categoryItem}
    >
      <Text style={styles.categoryIcon}>{category.icon || '📁'}</Text>
      <ListItem.Content>
        <ListItem.Title style={styles.categoryName}>
          {category.name}
        </ListItem.Title>
      </ListItem.Content>
      {(allowMultiple ? selectedCategoryIds.includes(category.id) : selectedCategoryId === category.id) && (
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
          selectedCategories.length > 0 ? (
            <ListItem.Content>
              <ListItem.Title style={styles.selectedText}>
                {selectedCategories.length === 1 
                  ? selectedCategories[0].name
                  : `${selectedCategories.length} categories selected`
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
          selectedCategory ? (
            <>
              <Text style={styles.selectedIcon}>{selectedCategory.icon || '📁'}</Text>
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
                onPress={() => {
                  if (allowMultiple && onCategoriesSelect) {
                    onCategoriesSelect([]);
                  } else {
                    handleCategorySelect(null);
                  }
                }}
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
                {(allowMultiple ? selectedCategoryIds.length === 0 : !selectedCategoryId) && (
                  <Icon name="check" type="feather" size={20} color="#007AFF" />
                )}
              </ListItem>
            )}

            {allowMultiple && filteredCategories.length > 0 && (
              <ListItem
                onPress={() => {
                  if (onCategoriesSelect) {
                    onCategoriesSelect(filteredCategories);
                  }
                }}
                containerStyle={[styles.categoryItem, styles.selectAllItem]}
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

            {filteredCategories.map(category => (
              <React.Fragment key={category.id}>
                {renderCategoryItem(category)}
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
                  Create New Category
                </ListItem.Title>
              </ListItem.Content>
            </ListItem>

            {filteredCategories.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  {searchQuery ? 'No matching categories found' : 'No categories yet'}
                </Text>
                {!searchQuery && (
                  <Text style={styles.emptySubtext}>
                    Create your first category above to get started
                  </Text>
                )}
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
        <View style={styles.createModalContent}>
          <Text style={styles.createModalTitle}>Create New Category</Text>

          <Input
            label="Category Name"
            value={newCategoryData.name}
            onChangeText={(text) =>
              setNewCategoryData(prev => ({ ...prev, name: text }))
            }
            placeholder="Enter category name"
            containerStyle={styles.inputContainer}
          />

          <TouchableOpacity
            style={styles.pickerRow}
            onPress={() => setShowIconPicker(true)}
          >
            <Text style={styles.pickerLabel}>Icon</Text>
            <View style={styles.pickerValue}>
              <RNText style={styles.selectedIconPreview}>{newCategoryData.icon || '📁'}</RNText>
              <Icon name="chevron-right" size={16} color="#666" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.pickerRow}
            onPress={() => setShowColorPicker(true)}
          >
            <Text style={styles.pickerLabel}>Color</Text>
            <View style={styles.pickerValue}>
              <View
                style={[styles.colorPreview, { backgroundColor: newCategoryData.color }]}
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
                resetNewCategoryData();
              }}
              buttonStyle={styles.cancelCreateButton}
            />
            <Button
              title="Create"
              onPress={handleCreateCategory}
              loading={isLoading}
              buttonStyle={styles.createButton}
            />
          </View>
        </View>
      </Overlay>

      <Overlay
        isVisible={showIconPicker}
        onBackdropPress={() => setShowIconPicker(false)}
        overlayStyle={styles.iconPickerModal}
      >
        <View style={styles.iconPickerContent}>
          <Text style={styles.iconPickerTitle}>Select Icon</Text>
          <ScrollView style={styles.iconGrid}>
            <View style={styles.iconRow}>
              <TouchableOpacity
                style={[
                  styles.iconButton,
                  styles.noIconButton,
                  newCategoryData.icon === '' && styles.selectedIconButton,
                ]}
                onPress={() => {
                  setNewCategoryData(prev => ({ ...prev, icon: '' }));
                  setShowIconPicker(false);
                }}
              >
                <RNText style={styles.noIconButtonText}>No Icon</RNText>
              </TouchableOpacity>
              {CATEGORY_ICONS.map((icon, index) => (
                <TouchableOpacity
                  key={icon}
                  style={[
                    styles.iconButton,
                    newCategoryData.icon === icon && styles.selectedIconButton,
                  ]}
                  onPress={() => {
                    setNewCategoryData(prev => ({ ...prev, icon }));
                    setShowIconPicker(false);
                  }}
                >
                  <RNText style={styles.iconButtonText}>{icon}</RNText>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </Overlay>

      <Overlay
        isVisible={showColorPicker}
        onBackdropPress={() => setShowColorPicker(false)}
        overlayStyle={styles.colorPickerModal}
      >
        <View style={styles.colorPickerContent}>
          <Text style={styles.colorPickerTitle}>Select Color</Text>
          <View style={styles.colorGrid}>
            {CATEGORY_COLORS.map((color, index) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorButton,
                  { backgroundColor: color },
                  newCategoryData.color === color && styles.selectedColorButton,
                ]}
                onPress={() => {
                  setNewCategoryData(prev => ({ ...prev, color }));
                  setShowColorPicker(false);
                }}
              >
                {newCategoryData.color === color && (
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
  emptySubtext: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
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
  selectedIconPreview: {
    fontSize: 20,
    marginRight: 8,
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
  iconPickerModal: {
    width: '80%',
    maxHeight: '60%',
    borderRadius: 12,
  },
  iconPickerContent: {
    padding: 20,
  },
  iconPickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  iconGrid: {
    maxHeight: 300,
  },
  iconRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
    marginBottom: 8,
  },
  selectedIconButton: {
    backgroundColor: '#007AFF',
  },
  iconButtonText: {
    fontSize: 24,
  },
  noIconButton: {
    backgroundColor: '#E8E8E8',
  },
  noIconButtonText: {
    fontSize: 10,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
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

export default CategoryPicker;