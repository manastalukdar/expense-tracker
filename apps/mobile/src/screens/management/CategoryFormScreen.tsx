import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Input, Button, Header, ListItem, Icon } from 'react-native-elements';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useExpenseStore } from '../../store/useExpenseStore';
import { ExpenseCategory, CategoryFormData } from '@expense-tracker/shared';

interface CategoryFormScreenProps {
  route: {
    params?: {
      mode: 'create' | 'edit';
      category?: ExpenseCategory;
    };
  };
}

const CATEGORY_ICONS = [
  '🍔', '🏠', '🚗', '🎓', '💊', '🎬', '🛍️', '✈️',
  '💰', '📱', '⚽', '🎯', '🎨', '📚', '🔧', '👕',
  '🍕', '☕', '⛽', '🚌', '🎵', '💼', '🎮', '🏥'
];

const CategoryFormScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { mode = 'create', category } = (route.params as any) || {};
  
  const { 
    categories, 
    createCategory, 
    updateCategory, 
    isLoading 
  } = useExpenseStore();

  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    icon: '',
    parentId: undefined,
  });

  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showParentPicker, setShowParentPicker] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && category) {
      setFormData({
        name: category.name,
        icon: category.icon,
        parentId: category.parentId,
      });
    }
  }, [mode, category]);

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    try {
      if (mode === 'create') {
        await createCategory(formData);
        Alert.alert('Success', 'Category created successfully', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else if (category) {
        await updateCategory(category.id, formData);
        Alert.alert('Success', 'Category updated successfully', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to save category'
      );
    }
  };

  const getParentCategoryName = () => {
    if (!formData.parentId) return 'None (Top Level)';
    const parent = categories.find(cat => cat.id === formData.parentId);
    return parent ? `${parent.icon || '📁'} ${parent.name}` : 'None (Top Level)';
  };

  const getAvailableParentCategories = () => {
    if (mode === 'edit' && category) {
      // Exclude self and any descendants to prevent circular references
      return categories.filter(cat => 
        cat.id !== category.id && 
        cat.parentId !== category.id
      );
    }
    return categories;
  };

  return (
    <View style={styles.container}>
      <Header
        centerComponent={{ 
          text: mode === 'create' ? 'Add Category' : 'Edit Category',
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
          <Text style={styles.sectionTitle}>Category Details</Text>
          
          <Input
            label="Category Name"
            value={formData.name}
            onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
            placeholder="Enter category name"
            containerStyle={styles.inputContainer}
            inputStyle={styles.input}
            labelStyle={styles.inputLabel}
          />

          <Text style={styles.fieldLabel}>Icon</Text>
          <ListItem
            onPress={() => setShowIconPicker(!showIconPicker)}
            containerStyle={styles.pickerItem}
          >
            <Text style={styles.selectedIcon}>
              {formData.icon || '📁'}
            </Text>
            <ListItem.Content>
              <ListItem.Title style={styles.pickerLabel}>
                Choose Icon
              </ListItem.Title>
            </ListItem.Content>
            <Icon
              name={showIconPicker ? 'chevron-up' : 'chevron-down'}
              type="feather"
              size={20}
              color="#8E8E93"
            />
          </ListItem>

          {showIconPicker && (
            <View style={styles.iconGrid}>
              <Button
                title="No Icon"
                onPress={() => {
                  setFormData(prev => ({ ...prev, icon: '' }));
                  setShowIconPicker(false);
                }}
                buttonStyle={[
                  styles.iconButton,
                  styles.noIconButton,
                  formData.icon === '' && styles.selectedIconButton
                ]}
                titleStyle={styles.noIconButtonText}
              />
              {CATEGORY_ICONS.map((icon, index) => (
                <Button
                  key={index}
                  title={icon}
                  onPress={() => {
                    setFormData(prev => ({ ...prev, icon }));
                    setShowIconPicker(false);
                  }}
                  buttonStyle={[
                    styles.iconButton,
                    formData.icon === icon && styles.selectedIconButton
                  ]}
                  titleStyle={styles.iconButtonText}
                />
              ))}
            </View>
          )}

          <Text style={styles.fieldLabel}>Parent Category</Text>
          <ListItem
            onPress={() => setShowParentPicker(!showParentPicker)}
            containerStyle={styles.pickerItem}
          >
            <ListItem.Content>
              <ListItem.Title style={styles.pickerValue}>
                {getParentCategoryName()}
              </ListItem.Title>
            </ListItem.Content>
            <Icon
              name={showParentPicker ? 'chevron-up' : 'chevron-down'}
              type="feather"
              size={20}
              color="#8E8E93"
            />
          </ListItem>

          {showParentPicker && (
            <View style={styles.parentList}>
              <ListItem
                onPress={() => {
                  setFormData(prev => ({ ...prev, parentId: undefined }));
                  setShowParentPicker(false);
                }}
                containerStyle={styles.parentItem}
              >
                <ListItem.Content>
                  <ListItem.Title style={styles.parentName}>
                    None (Top Level)
                  </ListItem.Title>
                </ListItem.Content>
                {!formData.parentId && (
                  <Icon name="check" type="feather" size={20} color="#007AFF" />
                )}
              </ListItem>
              
              {getAvailableParentCategories().map((cat) => (
                <ListItem
                  key={cat.id}
                  onPress={() => {
                    setFormData(prev => ({ ...prev, parentId: cat.id }));
                    setShowParentPicker(false);
                  }}
                  containerStyle={styles.parentItem}
                >
                  <Text style={styles.parentIcon}>{cat.icon || '📁'}</Text>
                  <ListItem.Content>
                    <ListItem.Title style={styles.parentName}>
                      {cat.name}
                    </ListItem.Title>
                  </ListItem.Content>
                  {formData.parentId === cat.id && (
                    <Icon name="check" type="feather" size={20} color="#007AFF" />
                  )}
                </ListItem>
              ))}
            </View>
          )}
        </View>

        <View style={styles.info}>
          <Text style={styles.infoText}>
            Categories help organize your expenses. You can create subcategories by selecting a parent category.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.bottomActions}>
        <Button
          title={mode === 'create' ? 'Create Category' : 'Update Category'}
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
  pickerLabel: {
    fontSize: 16,
    color: '#000',
  },
  pickerValue: {
    fontSize: 16,
    color: '#000',
  },
  selectedIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 8,
  },
  iconButton: {
    backgroundColor: 'white',
    borderRadius: 8,
    width: 50,
    height: 50,
    margin: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedIconButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  iconButtonText: {
    fontSize: 20,
  },
  noIconButton: {
    backgroundColor: '#F0F0F0',
  },
  noIconButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  parentList: {
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  parentItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  parentIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  parentName: {
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

export default CategoryFormScreen;