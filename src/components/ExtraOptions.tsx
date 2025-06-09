import {
  Box,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { extraOptions, ExtraOption } from '@/hooks/useProductForm';

interface ExtraOptionsProps {
  selectedOptions: Record<string, boolean>;
  onOptionChange: (optionId: string, checked: boolean) => void;
}

export default function ExtraOptions({ selectedOptions, onOptionChange }: ExtraOptionsProps) {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#000000' }}>
        เพิ่มเติม
      </Typography>
      <Box sx={{ bgcolor: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: '8px', p: 2 }}>
        <FormGroup>
          {extraOptions.map((option) => (
            <FormControlLabel
              key={option.id}
              control={
                <Checkbox
                  checked={selectedOptions[option.id] || false}
                  onChange={(e) => onOptionChange(option.id, e.target.checked)}
                  sx={{
                    color: '#CCCCCC',
                    '&.Mui-checked': {
                      color: '#000000',
                    },
                  }}
                />
              }
              label={
                <Box sx={{ 
                  display: 'flex', 
                  width: '100%', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  pr: 0
                }}>
                  <Typography variant="body2" sx={{ color: '#000000', fontSize: '0.85rem'}}>
                    {option.name}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: '#666666', 
                    fontWeight: 500, 
                    fontSize: '0.85rem',
                    textAlign: 'right'
                  }}>
                    +฿{option.price}
                  </Typography>
                </Box>
              }
              sx={{ 
                width: '100%', 
                mr: 0, 
                mb: 0.5,
                pr: 0,
                '&:last-child': { mb: 0 },
                '& .MuiFormControlLabel-label': {
                  width: '100%',
                  pr: 0
                }
              }}
            />
          ))}
        </FormGroup>
      </Box>
    </Box>
  );
} 