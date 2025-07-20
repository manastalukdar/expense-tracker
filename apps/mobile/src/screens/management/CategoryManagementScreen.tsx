import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, ListItem, Icon, Button, SearchBar } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import { useExpenseStore } from '../../store/useExpenseStore';
import { ExpenseCategory, CategoryTree } from '@expense-tracker/shared';

const CategoryManagementScreen: React.FC = () => {
  const navigation = useNavigation();
  const { 
    categories, 
    getCategoryTree, 
    deleteCategory, 
    isLoading 
  } = useExpenseStore();

  const [categoryTree, setCategoryTree] = useState<CategoryTree[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadCategoryTree();
  }, [categories]);

  const loadCategoryTree = async () => {
    try {
      const tree = await getCategoryTree();
      setCategoryTree(tree);
    } catch (error) {
      console.error('Failed to load category tree:', error);
    }
  };

  const handleAddCategory = () => {
    navigation.navigate('CategoryForm' as never, { mode: 'create' } as never);
  };

  const handleEditCategory = (category: ExpenseCategory) => {
    navigation.navigate('CategoryForm' as never, { 
      mode: 'edit', 
      category 
    } as never);
  };

  const handleDeleteCategory = (category: ExpenseCategory) => {
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${category.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCategory(category.id);
            } catch (error) {
              Alert.alert(
                'Error',
                error instanceof Error ? error.message : 'Failed to delete category'
              );
            }
          },
        },
      ]
    );
  };

  const toggleCategoryExpansion = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const renderCategoryTree = (tree: CategoryTree[], depth = 0): React.ReactNode[] => {
    return tree.map((node) => {
      const category = node.category;
      const hasChildren = node.children.length > 0;
      const isExpanded = expandedCategories.has(category.id);
      
      // Filter based on search query
      if (searchQuery && !category.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return null;
      }

      return (
        <View key={category.id}>
          <ListItem
            onPress={() => hasChildren && toggleCategoryExpansion(category.id)}
            containerStyle={[
              styles.categoryItem,
              { paddingLeft: 16 + (depth * 20) }
            ]}
          >
            <View style={styles.categoryContent}>
              <View style={styles.categoryInfo}>
                {hasChildren && (
                  <Icon
                    name={isExpanded ? 'chevron-down' : 'chevron-right'}
                    type="feather"
                    size={16}
                    color="#8E8E93"
                    containerStyle={styles.expandIcon}
                  />
                )}
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <View style={styles.categoryDetails}>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  {depth > 0 && (
                    <Text style={styles.depthIndicator}>
                      Level {depth + 1}
                    </Text>
                  )}
                </View>
              </View>
              
              <View style={styles.categoryActions}>
                <Icon
                  name="edit-3"
                  type="feather"
                  size={18}
                  color="#007AFF"
                  onPress={() => handleEditCategory(category)}
                  containerStyle={styles.actionIcon}
                />
                <Icon
                  name="trash-2"
                  type="feather"
                  size={18}
                  color="#FF3B30"
                  onPress={() => handleDeleteCategory(category)}
                  containerStyle={styles.actionIcon}
                />
              </View>
            </View>
          </ListItem>

          {hasChildren && isExpanded && (
            <View>
              {renderCategoryTree(node.children, depth + 1)}
            </View>
          )}
        </View>
      );
    }).filter(Boolean);
  };

  const filteredCategories = searchQuery
    ? categories.filter(cat => 
        cat.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <View style={styles.container}>
      <SearchBar
        placeholder="Search categories..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        containerStyle={styles.searchContainer}
        inputContainerStyle={styles.searchInput}
        lightTheme
      />

      <ScrollView style={styles.content}>
        {searchQuery ? (
          // Show flat list when searching
          <View style={styles.categoryList}>
            {filteredCategories.map((category) => (
              <ListItem
                key={category.id}
                containerStyle={styles.categoryItem}
              >
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <ListItem.Content>
                  <ListItem.Title style={styles.categoryName}>
                    {category.name}
                  </ListItem.Title>
                </ListItem.Content>
                <View style={styles.categoryActions}>
                  <Icon
                    name="edit-3"
                    type="feather"
                    size={18}
                    color="#007AFF"
                    onPress={() => handleEditCategory(category)}
                    containerStyle={styles.actionIcon}
                  />
                  <Icon
                    name="trash-2"
                    type="feather"
                    size={18}
                    color="#FF3B30"
                    onPress={() => handleDeleteCategory(category)}
                    containerStyle={styles.actionIcon}
                  />
                </View>
              </ListItem>
            ))}
          </View>
        ) : (
          // Show hierarchical tree
          <View style={styles.categoryList}>
            {renderCategoryTree(categoryTree)}
          </View>
        )}

        {categories.length === 0 && !isLoading && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No Categories Yet</Text>
            <Text style={styles.emptySubtitle}>
              Add your first category to get started organizing your expenses.
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomActions}>
        <Button
          title="Add Category"
          onPress={handleAddCategory}
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
  categoryList: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  categoryItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  expandIcon: {
    marginRight: 8,
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  categoryDetails: {
    flex: 1,
  },
  categoryName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  depthIndicator: {
    fontSize: 12,
    color: '#8E8E93',
  },
  categoryActions: {
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

export default CategoryManagementScreen;