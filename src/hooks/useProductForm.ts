import { useState } from 'react';

export interface ExtraOption {
  id: string;
  name: string;
  price: number;
}

export const extraOptions: ExtraOption[] = [
  { id: 'egg', name: 'ไข่ดาว', price: 10 },
  { id: 'cheese', name: 'ชีส', price: 15 },
  { id: 'bacon', name: 'เบคอน', price: 20 },
  { id: 'mushroom', name: 'เห็ด', price: 12 },
];

export const useProductForm = (basePrice: number) => {
  const [quantity, setQuantity] = useState(1);
  const [instructions, setInstructions] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<Record<string, boolean>>({});

  const handleOptionChange = (optionId: string, checked: boolean) => {
    setSelectedOptions(prev => ({
      ...prev,
      [optionId]: checked
    }));
  };

  const getSelectedExtras = () => {
    return extraOptions.filter(option => selectedOptions[option.id]);
  };

  const calculateTotalPrice = () => {
    const extraPrice = extraOptions.reduce((total, option) => {
      return selectedOptions[option.id] ? total + option.price : total;
    }, 0);
    
    return (basePrice + extraPrice) * quantity;
  };

  const resetForm = () => {
    setQuantity(1);
    setInstructions('');
    setSelectedOptions({});
  };

  return {
    // States
    quantity,
    instructions,
    selectedOptions,
    
    // Actions
    setQuantity,
    setInstructions,
    handleOptionChange,
    resetForm,
    
    // Computed
    getSelectedExtras,
    calculateTotalPrice,
    totalPrice: calculateTotalPrice(),
  };
}; 