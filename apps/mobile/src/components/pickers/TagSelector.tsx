import React, { useState } from 'react';
import { View, StyleSheet, Modal, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, ListItem, Icon, Button, SearchBar, Chip, Input, Overlay } from 'react-native-elements';
import { useExpenseStore } from '../../store/useExpenseStore';
import { Tag, TagFormData } from '@expense-tracker/shared';

const TAG_COLORS = [
  '#007AFF', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE',
  '#85C1E9', '#82E0AA', '#F8C471', '#CD6155', '#BB8FCE',
];

interface TagSelectorProps {
  selectedTagIds: string[];
  onTagsSelect: (tagIds: string[]) => void;
  placeholder?: string;
  maxSelections?: number;
  style?: any;
}

const TagSelector: React.FC<TagSelectorProps> = ({
  selectedTagIds,
  onTagsSelect,
  placeholder = "Select Tags",
  maxSelections,
  style
}) => {
  const { tags, createTag, isLoading } = useExpenseStore();
  const [isVisible, setIsVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTagData, setNewTagData] = useState<TagFormData>({
    name: '',
    color: TAG_COLORS[0],
    description: '',
  });
  const [showColorPicker, setShowColorPicker] = useState(false);

  const resetNewTagData = () => {
    setNewTagData({
      name: '',
      color: TAG_COLORS[0],
      description: '',
    });
  };

  const handleCreateTag = async () => {
    if (!newTagData.name.trim()) {
      Alert.alert('Error', 'Please enter a tag name');
      return;
    }

    try {
      const tagId = await createTag(newTagData);
      const newTag = tags.find(t => t.id === tagId);
      if (newTag) {
        // Auto-select the newly created tag
        const newSelectedIds = [...selectedTagIds, tagId];
        onTagsSelect(newSelectedIds);
      }
      setShowCreateModal(false);
      resetNewTagData();
      Alert.alert('Success', 'Tag created successfully!');
    } catch {
      Alert.alert('Error', 'Failed to create tag. Please try again.');
    }
  };

  const selectedTags = tags.filter(tag => selectedTagIds.includes(tag.id));

  const filteredTags = tags.filter(tag => 
    !searchQuery || 
    tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (tag.description && tag.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getTagColor = (color?: string) => {
    return color || '#007AFF';
  };

  const handleTagToggle = (tag: Tag) => {
    const isSelected = selectedTagIds.includes(tag.id);
    let newSelectedIds: string[];

    if (isSelected) {
      newSelectedIds = selectedTagIds.filter(id => id !== tag.id);
    } else {
      if (maxSelections && selectedTagIds.length >= maxSelections) {
        return; // Don't add if max selections reached
      }
      newSelectedIds = [...selectedTagIds, tag.id];
    }

    onTagsSelect(newSelectedIds);
  };

  const handleClearAll = () => {
    onTagsSelect([]);
  };

  const renderTagItem = (tag: Tag) => {
    const isSelected = selectedTagIds.includes(tag.id);
    const isDisabled = !isSelected && maxSelections && selectedTagIds.length >= maxSelections;

    return (
      <ListItem
        onPress={() => !isDisabled && handleTagToggle(tag)}
        containerStyle={[
          styles.tagItem,
          isDisabled && styles.disabledTagItem
        ]}
        disabled={isDisabled}
      >
        <View style={[styles.tagColorIndicator, { backgroundColor: getTagColor(tag.color) }]} />
        <ListItem.Content>
          <ListItem.Title style={[
            styles.tagName,
            isDisabled && styles.disabledText
          ]}>
            #{tag.name}
          </ListItem.Title>
          {tag.description && (
            <ListItem.Subtitle style={[
              styles.tagDescription,
              isDisabled && styles.disabledText
            ]}>
              {tag.description}
            </ListItem.Subtitle>
          )}
        </ListItem.Content>
        {isSelected && (
          <Icon name="check" type="feather" size={20} color="#007AFF" />
        )}
        {isDisabled && (
          <Icon name="lock" type="feather" size={16} color="#8E8E93" />
        )}
      </ListItem>
    );
  };

  return (
    <View style={[styles.container, style]}>
      <ListItem
        onPress={() => setIsVisible(true)}
        containerStyle={styles.pickerButton}
      >
        <ListItem.Content>
          {selectedTags.length > 0 ? (
            <View style={styles.selectedTagsContainer}>
              <View style={styles.chipContainer}>
                {selectedTags.slice(0, 3).map((tag) => (
                  <Chip
                    key={tag.id}
                    title={tag.name}
                    buttonStyle={[styles.chipButton, { backgroundColor: getTagColor(tag.color) }]}
                    titleStyle={styles.chipText}
                    containerStyle={styles.chip}
                  />
                ))}
                {selectedTags.length > 3 && (
                  <Text style={styles.moreTagsText}>+{selectedTags.length - 3}</Text>
                )}
              </View>
            </View>
          ) : (
            <ListItem.Title style={styles.placeholderText}>
              {placeholder}
            </ListItem.Title>
          )}
        </ListItem.Content>
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
            <Text style={styles.modalTitle}>
              Select Tags {maxSelections ? `(${selectedTagIds.length}/${maxSelections})` : ''}
            </Text>
            <Button
              title="Done"
              type="clear"
              titleStyle={styles.doneButton}
              onPress={() => setIsVisible(false)}
            />
          </View>

          {selectedTags.length > 0 && (
            <View style={styles.selectedSection}>
              <View style={styles.selectedHeader}>
                <Text style={styles.selectedTitle}>Selected Tags</Text>
                <Button
                  title="Clear All"
                  type="clear"
                  titleStyle={styles.clearAllButton}
                  onPress={handleClearAll}
                />
              </View>
              <View style={styles.selectedChipContainer}>
                {selectedTags.map((tag) => (
                  <Chip
                    key={tag.id}
                    title={tag.name}
                    buttonStyle={[styles.selectedChipButton, { backgroundColor: getTagColor(tag.color) }]}
                    titleStyle={styles.selectedChipText}
                    containerStyle={styles.selectedChip}
                    onPress={() => handleTagToggle(tag)}
                    icon={{
                      name: 'x',
                      type: 'feather',
                      size: 14,
                      color: 'white',
                    }}
                  />
                ))}
              </View>
            </View>
          )}

          <SearchBar
            placeholder="Search tags..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            containerStyle={styles.searchContainer}
            inputContainerStyle={styles.searchInput}
            lightTheme
          />

          <ScrollView style={styles.modalContent}>
            {filteredTags.map(tag => (
              <React.Fragment key={tag.id}>
                {renderTagItem(tag)}
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
                  Create New Tag
                </ListItem.Title>
              </ListItem.Content>
            </ListItem>

            {filteredTags.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  {searchQuery ? 'No matching tags found' : 'No tags available'}
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
        <View style={styles.createModalContent}>
          <Text style={styles.createModalTitle}>Create New Tag</Text>

          <Input
            label="Tag Name"
            value={newTagData.name}
            onChangeText={(text) =>
              setNewTagData(prev => ({ ...prev, name: text }))
            }
            placeholder="Enter tag name"
            containerStyle={styles.inputContainer}
          />

          <Input
            label="Description (Optional)"
            value={newTagData.description}
            onChangeText={(text) =>
              setNewTagData(prev => ({ ...prev, description: text }))
            }
            placeholder="Enter tag description"
            multiline
            numberOfLines={2}
            containerStyle={styles.inputContainer}
          />

          <TouchableOpacity
            style={styles.pickerRow}
            onPress={() => setShowColorPicker(true)}
          >
            <Text style={styles.pickerLabel}>Color</Text>
            <View style={styles.pickerValue}>
              <View
                style={[styles.colorPreview, { backgroundColor: newTagData.color }]}
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
                resetNewTagData();
              }}
              buttonStyle={styles.cancelCreateButton}
            />
            <Button
              title="Create"
              onPress={handleCreateTag}
              loading={isLoading}
              buttonStyle={styles.createButton}
            />
          </View>
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
            {TAG_COLORS.map((color, index) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorButton,
                  { backgroundColor: color },
                  newTagData.color === color && styles.selectedColorButton,
                ]}
                onPress={() => {
                  setNewTagData(prev => ({ ...prev, color }));
                  setShowColorPicker(false);
                }}
              >
                {newTagData.color === color && (
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
  selectedTagsContainer: {
    flex: 1,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  chip: {
    marginRight: 6,
    marginBottom: 4,
  },
  chipButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  chipText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  moreTagsText: {
    fontSize: 14,
    color: '#8E8E93',
    fontStyle: 'italic',
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
  selectedSection: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    padding: 16,
  },
  selectedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  clearAllButton: {
    color: '#FF3B30',
    fontSize: 14,
  },
  selectedChipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  selectedChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  selectedChipButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  selectedChipText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
    marginRight: 4,
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
  tagItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
    alignItems: 'flex-start',
  },
  disabledTagItem: {
    opacity: 0.5,
  },
  tagColorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
    marginTop: 6,
  },
  tagName: {
    fontSize: 16,
    color: '#000',
    marginBottom: 2,
  },
  tagDescription: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 18,
  },
  disabledText: {
    color: '#B0B0B0',
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

export default TagSelector;