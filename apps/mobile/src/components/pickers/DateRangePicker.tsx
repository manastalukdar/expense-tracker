import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Button, Icon, ListItem, Overlay } from 'react-native-elements';
import { DateRange } from '@expense-tracker/shared';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, subDays, startOfWeek, endOfWeek } from 'date-fns';

interface DateRangePickerProps {
  selectedRange?: DateRange;
  onRangeSelect: (range: DateRange | undefined) => void;
  placeholder?: string;
  allowClear?: boolean;
  style?: any;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  selectedRange,
  onRangeSelect,
  placeholder = "Select date range",
  allowClear = true,
  style
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(-1);

  const datePresets = [
    {
      label: 'This Week',
      range: {
        startDate: startOfWeek(new Date()),
        endDate: endOfWeek(new Date())
      }
    },
    {
      label: 'This Month',
      range: {
        startDate: startOfMonth(new Date()),
        endDate: endOfMonth(new Date())
      }
    },
    {
      label: 'Last Month',
      range: {
        startDate: startOfMonth(subMonths(new Date(), 1)),
        endDate: endOfMonth(subMonths(new Date(), 1))
      }
    },
    {
      label: 'Last 3 Months',
      range: {
        startDate: startOfMonth(subMonths(new Date(), 3)),
        endDate: endOfMonth(new Date())
      }
    },
    {
      label: 'Last 6 Months',
      range: {
        startDate: startOfMonth(subMonths(new Date(), 6)),
        endDate: endOfMonth(new Date())
      }
    },
    {
      label: 'This Year',
      range: {
        startDate: startOfYear(new Date()),
        endDate: endOfYear(new Date())
      }
    },
    {
      label: 'Last 30 Days',
      range: {
        startDate: subDays(new Date(), 30),
        endDate: new Date()
      }
    }
  ];

  const handlePresetSelect = (preset: { label: string; range: DateRange }) => {
    onRangeSelect(preset.range);
    setIsVisible(false);
  };

  const handleClear = () => {
    onRangeSelect(undefined);
    setIsVisible(false);
  };

  const formatDateRange = (range: DateRange): string => {
    const startStr = format(range.startDate, 'MMM dd, yyyy');
    const endStr = format(range.endDate, 'MMM dd, yyyy');
    return `${startStr} - ${endStr}`;
  };

  const getDisplayText = (): string => {
    if (!selectedRange) return placeholder;
    return formatDateRange(selectedRange);
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={styles.pickerButton}
        onPress={() => setIsVisible(true)}
      >
        <View style={styles.pickerContent}>
          <Icon
            name="date-range"
            type="material"
            size={20}
            color="#666"
            style={styles.icon}
          />
          <Text style={[
            styles.pickerText,
            !selectedRange && styles.placeholderText
          ]}>
            {getDisplayText()}
          </Text>
          <Icon
            name="chevron-down"
            type="feather"
            size={20}
            color="#8E8E93"
          />
        </View>
      </TouchableOpacity>

      <Overlay
        isVisible={isVisible}
        onBackdropPress={() => setIsVisible(false)}
        overlayStyle={styles.overlay}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Date Range</Text>
          
          <View style={styles.presetsList}>
            {datePresets.map((preset, index) => (
              <ListItem
                key={preset.label}
                onPress={() => handlePresetSelect(preset)}
                containerStyle={styles.presetItem}
              >
                <Icon
                  name="calendar"
                  type="feather"
                  size={16}
                  color="#007AFF"
                />
                <ListItem.Content>
                  <ListItem.Title style={styles.presetLabel}>
                    {preset.label}
                  </ListItem.Title>
                  <ListItem.Subtitle style={styles.presetRange}>
                    {formatDateRange(preset.range)}
                  </ListItem.Subtitle>
                </ListItem.Content>
              </ListItem>
            ))}
          </View>

          <View style={styles.modalButtons}>
            {allowClear && (
              <Button
                title="Clear"
                type="outline"
                onPress={handleClear}
                buttonStyle={styles.clearButton}
                titleStyle={styles.clearButtonText}
              />
            )}
            <Button
              title="Cancel"
              type="outline"
              onPress={() => setIsVisible(false)}
              buttonStyle={styles.cancelButton}
              titleStyle={styles.cancelButtonText}
            />
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
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  pickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 12,
  },
  pickerText: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  placeholderText: {
    color: '#8E8E93',
  },
  overlay: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 12,
  },
  modalContent: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#000',
  },
  presetsList: {
    maxHeight: 400,
  },
  presetItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  presetLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  presetRange: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  clearButton: {
    borderColor: '#FF3B30',
    borderWidth: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: 24,
    flex: 1,
  },
  clearButtonText: {
    color: '#FF3B30',
  },
  cancelButton: {
    borderColor: '#666',
    borderWidth: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: 24,
    flex: 1,
  },
  cancelButtonText: {
    color: '#666',
  },
});

export default DateRangePicker;