import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Input, Icon, Text } from 'react-native-elements';
import { useExpenseStore } from '../../store/useExpenseStore';
import { debounce } from '@expense-tracker/shared';

interface VendorPickerProps {
  value: string;
  onVendorSelect: (vendor: string) => void;
  placeholder?: string;
  style?: any;
}

const VendorPicker: React.FC<VendorPickerProps> = ({
  value,
  onVendorSelect,
  placeholder = "Enter vendor name",
  style
}) => {
  const { searchVendors } = useExpenseStore();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const debouncedSearch = debounce(async (query: string) => {
    if (query.length > 0) {
      setIsSearching(true);
      try {
        const results = await searchVendors(query);
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      } catch (error) {
        console.error('Error searching vendors:', error);
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, 300);

  useEffect(() => {
    debouncedSearch(value);
  }, [value]);

  const handleVendorChange = (text: string) => {
    onVendorSelect(text);
  };

  const handleSuggestionSelect = (vendor: string) => {
    onVendorSelect(vendor);
    setShowSuggestions(false);
  };

  const handleInputFocus = () => {
    if (value.length > 0 && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow for selection
    setTimeout(() => setShowSuggestions(false), 150);
  };

  const renderSuggestionItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleSuggestionSelect(item)}
    >
      <Icon
        name="storefront"
        type="material"
        size={16}
        color="#666"
        style={styles.suggestionIcon}
      />
      <Text style={styles.suggestionText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, style]}>
      <Input
        label="Vendor *"
        value={value}
        onChangeText={handleVendorChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        placeholder={placeholder}
        leftIcon={<Icon name="storefront" type="material" color="#666" />}
        rightIcon={
          isSearching ? (
            <Icon name="refresh" color="#666" />
          ) : value.length > 0 ? (
            <TouchableOpacity onPress={() => onVendorSelect('')}>
              <Icon name="clear" color="#666" />
            </TouchableOpacity>
          ) : undefined
        }
        containerStyle={styles.inputContainer}
        inputStyle={styles.input}
        labelStyle={styles.inputLabel}
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={suggestions}
            renderItem={renderSuggestionItem}
            keyExtractor={(item, index) => `${item}-${index}`}
            style={styles.suggestionsList}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            maxToRenderPerBatch={5}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
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
  suggestionsContainer: {
    position: 'absolute',
    top: 70,
    left: 10,
    right: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1000,
    maxHeight: 200,
  },
  suggestionsList: {
    flexGrow: 0,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  suggestionIcon: {
    marginRight: 12,
  },
  suggestionText: {
    fontSize: 16,
    color: '#000',
    flex: 1,
  },
});

export default VendorPicker;