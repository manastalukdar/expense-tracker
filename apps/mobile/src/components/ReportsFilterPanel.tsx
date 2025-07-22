import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput, Modal, TouchableOpacity, Text as RNText, FlatList } from 'react-native';
import { Icon } from 'react-native-elements';
import { ExpenseFilter, DateRange } from '@expense-tracker/shared';
import { useExpenseStore } from '../store/useExpenseStore';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfYear, endOfYear, subMonths, subDays, addMonths, isSameDay, isSameMonth, addDays } from 'date-fns';

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
  const [dateRange, setDateRange] = useState<DateRange | undefined>(currentFilter?.dateRange);
  
  // Modal states for each filter type
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const [showPaymentMethodsModal, setShowPaymentMethodsModal] = useState(false);
  const [showTagsModal, setShowTagsModal] = useState(false);
  const [showDateRangeModal, setShowDateRangeModal] = useState(false);
  const [showCustomDateModal, setShowCustomDateModal] = useState(false);
  const [tempStartDate, setTempStartDate] = useState<Date>(new Date());
  const [tempEndDate, setTempEndDate] = useState<Date>(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState<'start' | 'end'>('start');
  const [calendarDate, setCalendarDate] = useState(new Date()); // For navigating calendar months

  const handleApplyFilter = () => {
    const filter: ExpenseFilter = {
      minAmount: minAmount ? parseFloat(minAmount) : undefined,
      maxAmount: maxAmount ? parseFloat(maxAmount) : undefined,
      searchText: searchText || undefined,
      dateRange: dateRange,
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
    setDateRange(undefined);
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

  const getDisplayText = (selectedIds: string[], allItems: { id: string; name: string }[], itemType: string) => {
    if (selectedIds.length === 0 || selectedIds.length === allItems.length) {
      return `All ${itemType}`;
    }
    if (selectedIds.length === 1) {
      const item = allItems.find(i => i.id === selectedIds[0]);
      return item?.name || `1 ${itemType.slice(0, -1)}`;
    }
    return `${selectedIds.length} ${selectedIds.length === 1 ? itemType.slice(0, -1) : itemType}`;
  };

  const getDateRangeDisplayText = (): string => {
    if (!dateRange) {
      return 'All time';
    }
    const startStr = format(dateRange.startDate, 'MMM d, yyyy');
    const endStr = format(dateRange.endDate, 'MMM d, yyyy');
    return `${startStr} - ${endStr}`;
  };

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
    setDateRange(preset.range);
    setShowDateRangeModal(false);
  };

  const handleCustomDateRange = () => {
    setTempStartDate(dateRange?.startDate || new Date());
    setTempEndDate(dateRange?.endDate || new Date());
    setShowCustomDateModal(true);
    setShowDateRangeModal(false);
  };

  const applyCustomDateRange = () => {
    setDateRange({
      startDate: tempStartDate,
      endDate: tempEndDate
    });
    setShowCustomDateModal(false);
  };

  const clearDateRange = () => {
    setDateRange(undefined);
    setShowDateRangeModal(false);
  };

  const handleStartDatePress = () => {
    setDatePickerMode('start');
    setShowStartDatePicker(true);
  };

  const handleEndDatePress = () => {
    setDatePickerMode('end');
    setShowEndDatePicker(true);
  };

  const onStartDateChange = (selectedDate?: Date) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      setTempStartDate(selectedDate);
      // Ensure end date is not before start date
      if (selectedDate > tempEndDate) {
        setTempEndDate(selectedDate);
      }
    }
  };

  const onEndDateChange = (selectedDate?: Date) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      setTempEndDate(selectedDate);
      // Ensure start date is not after end date
      if (selectedDate < tempStartDate) {
        setTempStartDate(selectedDate);
      }
    }
  };

  const onDateSelect = (selectedDate: Date) => {
    if (datePickerMode === 'start') {
      setTempStartDate(selectedDate);
      // Ensure end date is not before start date
      if (selectedDate > tempEndDate) {
        setTempEndDate(selectedDate);
      }
    } else {
      setTempEndDate(selectedDate);
      // Ensure start date is not after end date
      if (selectedDate < tempStartDate) {
        setTempStartDate(selectedDate);
      }
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCalendarDate(prev => subMonths(prev, 1));
    } else {
      setCalendarDate(prev => addMonths(prev, 1));
    }
  };

  const generateCalendarDays = () => {
    const monthStart = startOfMonth(calendarDate);
    const monthEnd = endOfMonth(calendarDate);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = [];
    let currentDate = startDate;

    while (currentDate <= endDate) {
      days.push(new Date(currentDate));
      currentDate = addDays(currentDate, 1);
    }

    return days;
  };

  const isSelectedDate = (date: Date) => {
    const currentDate = datePickerMode === 'start' ? tempStartDate : tempEndDate;
    return isSameDay(date, currentDate);
  };

  const isCurrentMonth = (date: Date) => {
    return isSameMonth(date, calendarDate);
  };

  const getActiveFiltersCount = (): number => {
    let count = 0;
    if (minAmount && parseFloat(minAmount) > 0) count++;
    if (maxAmount && parseFloat(maxAmount) > 0) count++;
    if (searchText && searchText.trim()) count++;
    if (dateRange) count++;
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
            <RNText style={styles.sectionLabel}>Date Range</RNText>
            <TouchableOpacity 
              style={styles.pickerButton} 
              onPress={() => setShowDateRangeModal(true)}
            >
              <RNText style={styles.pickerButtonText}>
                {getDateRangeDisplayText()}
              </RNText>
              <Icon name="chevron-down" type="feather" size={16} color="#8E8E93" />
            </TouchableOpacity>
          </View>

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

      {/* Date Range Selection Modal */}
      <Modal
        visible={showDateRangeModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDateRangeModal(false)}
      >
        <View style={styles.selectionModalContainer}>
          <View style={styles.selectionModalHeader}>
            <TouchableOpacity onPress={() => setShowDateRangeModal(false)}>
              <RNText style={styles.modalCloseText}>Cancel</RNText>
            </TouchableOpacity>
            <RNText style={styles.selectionModalTitle}>Select Date Range</RNText>
            <TouchableOpacity onPress={clearDateRange}>
              <RNText style={styles.modalSelectAllText}>Clear</RNText>
            </TouchableOpacity>
          </View>
          
          <ScrollView>
            {datePresets.map((preset) => (
              <TouchableOpacity
                key={preset.label}
                style={styles.selectionItem}
                onPress={() => handlePresetSelect(preset)}
              >
                <View style={styles.selectionItemLeft}>
                  <Icon name="calendar" type="feather" size={20} color="#007AFF" />
                  <View style={styles.presetContent}>
                    <RNText style={styles.selectionItemText}>{preset.label}</RNText>
                    <RNText style={styles.presetSubtext}>
                      {format(preset.range.startDate, 'MMM d')} - {format(preset.range.endDate, 'MMM d, yyyy')}
                    </RNText>
                  </View>
                </View>
                {dateRange && 
                 dateRange.startDate.getTime() === preset.range.startDate.getTime() &&
                 dateRange.endDate.getTime() === preset.range.endDate.getTime() && (
                  <Icon name="check" type="feather" size={20} color="#007AFF" />
                )}
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity
              style={[styles.selectionItem, styles.customDateItem]}
              onPress={handleCustomDateRange}
            >
              <View style={styles.selectionItemLeft}>
                <Icon name="edit-3" type="feather" size={20} color="#007AFF" />
                <RNText style={styles.selectionItemText}>Custom Date Range</RNText>
              </View>
              <Icon name="chevron-right" type="feather" size={16} color="#8E8E93" />
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Custom Date Range Modal */}
      <Modal
        visible={showCustomDateModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCustomDateModal(false)}
      >
        <View style={styles.selectionModalContainer}>
          <View style={styles.selectionModalHeader}>
            <TouchableOpacity onPress={() => setShowCustomDateModal(false)}>
              <RNText style={styles.modalCloseText}>Cancel</RNText>
            </TouchableOpacity>
            <RNText style={styles.selectionModalTitle}>Custom Date Range</RNText>
            <TouchableOpacity onPress={applyCustomDateRange}>
              <RNText style={styles.modalSelectAllText}>Apply</RNText>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.customDateContent}>
            <View style={styles.dateSection}>
              <RNText style={styles.dateLabel}>Start Date</RNText>
              <TouchableOpacity style={styles.dateInput} onPress={handleStartDatePress}>
                <RNText style={styles.dateInputText}>
                  {format(tempStartDate, 'MMMM d, yyyy')}
                </RNText>
                <Icon name="calendar" type="feather" size={16} color="#007AFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.dateSection}>
              <RNText style={styles.dateLabel}>End Date</RNText>
              <TouchableOpacity style={styles.dateInput} onPress={handleEndDatePress}>
                <RNText style={styles.dateInputText}>
                  {format(tempEndDate, 'MMMM d, yyyy')}
                </RNText>
                <Icon name="calendar" type="feather" size={16} color="#007AFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.quickDateActions}>
              <TouchableOpacity 
                style={styles.quickDateButton}
                onPress={() => setTempStartDate(subDays(tempEndDate, 7))}
              >
                <RNText style={styles.quickDateButtonText}>Last 7 days</RNText>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.quickDateButton}
                onPress={() => setTempStartDate(subDays(tempEndDate, 30))}
              >
                <RNText style={styles.quickDateButtonText}>Last 30 days</RNText>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Simple Date Picker Modal */}
      <Modal
        visible={showStartDatePicker || showEndDatePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowStartDatePicker(false);
          setShowEndDatePicker(false);
        }}
      >
        <View style={styles.datePickerOverlay}>
          <View style={styles.datePickerModal}>
            <View style={styles.datePickerHeader}>
              <TouchableOpacity onPress={() => {
                setShowStartDatePicker(false);
                setShowEndDatePicker(false);
              }}>
                <RNText style={styles.datePickerCancel}>Cancel</RNText>
              </TouchableOpacity>
              <RNText style={styles.datePickerTitle}>
                Select {datePickerMode === 'start' ? 'Start' : 'End'} Date
              </RNText>
              <TouchableOpacity onPress={() => {
                if (datePickerMode === 'start') {
                  onStartDateChange(tempStartDate);
                } else {
                  onEndDateChange(tempEndDate);
                }
              }}>
                <RNText style={styles.datePickerDone}>Done</RNText>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.datePickerContent}>
              <RNText style={styles.datePickerNote}>
                Currently selected: {format(datePickerMode === 'start' ? tempStartDate : tempEndDate, 'MMMM d, yyyy')}
              </RNText>
              
              <View style={styles.calendarContainer}>
                <View style={styles.calendarHeader}>
                  <TouchableOpacity 
                    style={styles.calendarNavButton}
                    onPress={() => navigateMonth('prev')}
                  >
                    <Icon name="chevron-left" type="feather" size={20} color="#007AFF" />
                  </TouchableOpacity>
                  
                  <RNText style={styles.calendarMonthYear}>
                    {format(calendarDate, 'MMMM yyyy')}
                  </RNText>
                  
                  <TouchableOpacity 
                    style={styles.calendarNavButton}
                    onPress={() => navigateMonth('next')}
                  >
                    <Icon name="chevron-right" type="feather" size={20} color="#007AFF" />
                  </TouchableOpacity>
                </View>

                <View style={styles.calendarWeekDays}>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <RNText key={day} style={styles.calendarWeekDay}>{day}</RNText>
                  ))}
                </View>

                <View style={styles.calendarGrid}>
                  {generateCalendarDays().map((date, index) => {
                    const isSelected = isSelectedDate(date);
                    const isCurrentMonthDate = isCurrentMonth(date);
                    const isToday = isSameDay(date, new Date());
                    const isFutureDate = date > new Date();
                    
                    return (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.calendarDay,
                          isSelected && styles.calendarDaySelected,
                          isToday && !isSelected && styles.calendarDayToday,
                          isFutureDate && styles.calendarDayDisabled
                        ]}
                        onPress={() => !isFutureDate && onDateSelect(date)}
                        disabled={isFutureDate}
                      >
                        <RNText style={[
                          styles.calendarDayText,
                          !isCurrentMonthDate && styles.calendarDayTextOutside,
                          isSelected && styles.calendarDayTextSelected,
                          isToday && !isSelected && styles.calendarDayTextToday,
                          isFutureDate && styles.calendarDayTextDisabled
                        ]}>
                          {format(date, 'd')}
                        </RNText>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.dateQuickOptions}>
                <RNText style={styles.dateQuickTitle}>Quick Select:</RNText>
                
                <View style={styles.quickSelectRow}>
                  <TouchableOpacity 
                    style={styles.dateQuickButton}
                    onPress={() => {
                      const newDate = new Date();
                      if (datePickerMode === 'start') {
                        setTempStartDate(newDate);
                      } else {
                        setTempEndDate(newDate);
                      }
                    }}
                  >
                    <RNText style={styles.dateQuickButtonText}>Today</RNText>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.dateQuickButton}
                    onPress={() => {
                      const newDate = subDays(new Date(), 7);
                      if (datePickerMode === 'start') {
                        setTempStartDate(newDate);
                      } else {
                        setTempEndDate(newDate);
                      }
                    }}
                  >
                    <RNText style={styles.dateQuickButtonText}>1 Week Ago</RNText>
                  </TouchableOpacity>
                </View>

                <View style={styles.quickSelectRow}>
                  <TouchableOpacity 
                    style={styles.dateQuickButton}
                    onPress={() => {
                      const newDate = subDays(new Date(), 30);
                      if (datePickerMode === 'start') {
                        setTempStartDate(newDate);
                      } else {
                        setTempEndDate(newDate);
                      }
                    }}
                  >
                    <RNText style={styles.dateQuickButtonText}>1 Month Ago</RNText>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.dateQuickButton}
                    onPress={() => {
                      const newDate = startOfMonth(new Date());
                      if (datePickerMode === 'start') {
                        setTempStartDate(newDate);
                      } else {
                        setTempEndDate(newDate);
                      }
                    }}
                  >
                    <RNText style={styles.dateQuickButtonText}>Start of Month</RNText>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
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
  presetContent: {
    flex: 1,
    marginLeft: 12,
  },
  presetSubtext: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  customDateItem: {
    backgroundColor: '#F0F8FF',
  },
  customDateContent: {
    padding: 20,
  },
  dateSection: {
    marginBottom: 24,
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dateInputText: {
    fontSize: 16,
    color: '#000',
  },
  dateHelper: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
    fontStyle: 'italic',
  },
  quickDateActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  quickDateButton: {
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  quickDateButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  datePickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  datePickerCancel: {
    fontSize: 16,
    color: '#8E8E93',
  },
  datePickerDone: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  datePickerContent: {
    padding: 20,
  },
  datePickerNote: {
    fontSize: 16,
    color: '#000',
    marginBottom: 20,
    textAlign: 'center',
    backgroundColor: '#F8F8F8',
    padding: 12,
    borderRadius: 8,
  },
  dateQuickOptions: {
    marginBottom: 20,
  },
  dateQuickTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  dateQuickButton: {
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#007AFF',
    flex: 1,
    marginHorizontal: 4,
  },
  dateQuickButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  datePickerInstructions: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 16,
  },
  calendarContainer: {
    marginBottom: 20,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarNavButton: {
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  calendarMonthYear: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  calendarWeekDays: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  calendarWeekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    paddingVertical: 8,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: `${100/7}%`,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    borderRadius: 8,
  },
  calendarDaySelected: {
    backgroundColor: '#007AFF',
  },
  calendarDayToday: {
    backgroundColor: '#E3F2FD',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  calendarDayDisabled: {
    opacity: 0.3,
  },
  calendarDayText: {
    fontSize: 16,
    color: '#000',
  },
  calendarDayTextOutside: {
    color: '#C7C7CC',
  },
  calendarDayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  calendarDayTextToday: {
    color: '#007AFF',
    fontWeight: '600',
  },
  calendarDayTextDisabled: {
    color: '#C7C7CC',
  },
  quickSelectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
});

export default ReportsFilterPanel;