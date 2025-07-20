import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Input, Button, Header, ListItem, Icon } from 'react-native-elements';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useExpenseStore } from '../../store/useExpenseStore';
import { Tag, TagFormData } from '@expense-tracker/shared';

interface TagFormScreenProps {
  route: {
    params?: {
      mode: 'create' | 'edit';
      tag?: Tag;
    };
  };
}

const TAG_COLORS = [
  '#007AFF', '#FF3B30', '#FF9500', '#FFCC00', '#34C759',
  '#00C7BE', '#32ADE6', '#5856D6', '#AF52DE', '#FF2D92',
  '#A2845E', '#8E8E93', '#FF6B6B', '#4ECDC4', '#45B7D1',
  '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
];

const TagFormScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { mode = 'create', tag } = (route.params as any) || {};
  
  const { 
    createTag, 
    updateTag, 
    isLoading 
  } = useExpenseStore();

  const [formData, setFormData] = useState<TagFormData>({
    name: '',
    color: TAG_COLORS[0],
    description: '',
  });

  const [showColorPicker, setShowColorPicker] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && tag) {
      setFormData({
        name: tag.name,
        color: tag.color || TAG_COLORS[0],
        description: tag.description || '',
      });
    }
  }, [mode, tag]);

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter a tag name');
      return;
    }

    // Validate tag name (no spaces, special characters except hyphen and underscore)
    const cleanName = formData.name.trim().replace(/\s+/g, '_').toLowerCase();
    if (!/^[a-z0-9_-]+$/.test(cleanName)) {
      Alert.alert(
        'Invalid Tag Name', 
        'Tag names can only contain letters, numbers, hyphens, and underscores. Spaces will be converted to underscores.'
      );
      return;
    }

    try {
      const submitData = {
        ...formData,
        name: cleanName,
        description: formData.description.trim() || undefined,
      };

      if (mode === 'create') {
        await createTag(submitData);
        Alert.alert('Success', 'Tag created successfully', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else if (tag) {
        await updateTag(tag.id, submitData);
        Alert.alert('Success', 'Tag updated successfully', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to save tag'
      );
    }
  };

  const handleNameChange = (text: string) => {
    // Show preview of cleaned name
    const cleaned = text.trim().replace(/\s+/g, '_').toLowerCase();
    setFormData(prev => ({ ...prev, name: text }));
  };

  const getCleanedName = () => {
    return formData.name.trim().replace(/\s+/g, '_').toLowerCase();
  };

  return (
    <View style={styles.container}>
      <Header
        centerComponent={{ 
          text: mode === 'create' ? 'Add Tag' : 'Edit Tag',
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
          <Text style={styles.sectionTitle}>Tag Details</Text>
          
          <Input
            label="Tag Name"
            value={formData.name}
            onChangeText={handleNameChange}
            placeholder="e.g., work, travel, food"
            containerStyle={styles.inputContainer}
            inputStyle={styles.input}
            labelStyle={styles.inputLabel}
          />

          {formData.name.trim() && formData.name !== getCleanedName() && (
            <View style={styles.namePreview}>
              <Text style={styles.namePreviewLabel}>Tag will be saved as:</Text>
              <Text style={styles.namePreviewValue}>#{getCleanedName()}</Text>
            </View>
          )}

          <Text style={styles.fieldLabel}>Color</Text>
          <ListItem
            onPress={() => setShowColorPicker(!showColorPicker)}
            containerStyle={styles.pickerItem}
          >
            <View style={[styles.colorIndicator, { backgroundColor: formData.color }]} />
            <ListItem.Content>
              <ListItem.Title style={styles.pickerLabel}>
                Choose Color
              </ListItem.Title>
            </ListItem.Content>
            <Icon
              name={showColorPicker ? 'chevron-up' : 'chevron-down'}
              type="feather"
              size={20}
              color="#8E8E93"
            />
          </ListItem>

          {showColorPicker && (
            <View style={styles.colorGrid}>
              {TAG_COLORS.map((color, index) => (
                <Button
                  key={index}
                  onPress={() => {
                    setFormData(prev => ({ ...prev, color }));
                    setShowColorPicker(false);
                  }}
                  buttonStyle={[
                    styles.colorButton,
                    { backgroundColor: color },
                    formData.color === color && styles.selectedColorButton
                  ]}
                />
              ))}
            </View>
          )}

          <Input
            label="Description (Optional)"
            value={formData.description}
            onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
            placeholder="What is this tag used for?"
            multiline
            numberOfLines={3}
            containerStyle={styles.inputContainer}
            inputStyle={[styles.input, styles.textArea]}
            labelStyle={styles.inputLabel}
          />

          <View style={styles.tagPreview}>
            <Text style={styles.previewTitle}>Preview</Text>
            <View style={styles.previewContainer}>
              <View style={[styles.previewTag, { backgroundColor: formData.color }]}>
                <Text style={styles.previewTagText}>
                  #{getCleanedName() || 'tag-name'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.info}>
          <Text style={styles.infoText}>
            Tags are labels that help you categorize and filter expenses. Use descriptive names that will make sense when reviewing your expenses later.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.bottomActions}>
        <Button
          title={mode === 'create' ? 'Create Tag' : 'Update Tag'}
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
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  namePreview: {
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  namePreviewLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  namePreviewValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
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
  colorIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'white',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 8,
  },
  colorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColorButton: {
    borderColor: '#000',
  },
  tagPreview: {
    marginTop: 8,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  previewContainer: {
    alignItems: 'flex-start',
  },
  previewTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  previewTagText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
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

export default TagFormScreen;