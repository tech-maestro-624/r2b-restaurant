import {
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  SelectChangeEvent,
  Alert,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { branchService } from '../../services/branch.service';
import { useBranch } from '../../contexts/BranchContext';
import { Branch } from '../../types/branch';

export default function BranchSelector() {
  const { selectedBranch, setSelectedBranch } = useBranch();

  const { data: branchData, isError } = useQuery({
    queryKey: ['branches'],
    queryFn: () =>
      branchService.getAll().then((res) => {
        return res.data;
      }),
    onSuccess: (data) => {
      // Auto-select first branch if none selected
      if (!selectedBranch && data.branches.length > 0) {
        setSelectedBranch(data.branches[0]);
      }
    },
  });

  const handleChange = (event: SelectChangeEvent<string>) => {
    const branch = branchData?.branches.find((b: Branch) => b._id === event.target.value);
    if (branch) {
      setSelectedBranch(branch);
    }
  };

  if (isError) {
    return <Alert severity="error" sx={{ width: 200 }}>Failed to load branches</Alert>;
  }

  if (!branchData?.branches.length) {
    return <Alert severity="info" sx={{ width: 200 }}>No branches available</Alert>;
  }

  return (
    <FormControl
      size="small"
      sx={{
        minWidth: 200,
        backgroundColor: '#0F1215', // dark blue container background
        borderRadius: 1,
        '& .MuiInputBase-root': {
          backgroundColor: '#0F1215', // white background for the input field
        },
      }}
    >
      <InputLabel
        sx={{
          color: 'white',
          '&.Mui-focused': { color: 'white' },
        }}
      >
        Select Branch
      </InputLabel>
      <Select
        value={selectedBranch?._id || ''}
        label="Select Branch"
        onChange={handleChange}
        variant="outlined"
        sx={{
          color: 'white',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'lightblue',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'lightblue',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: 'lightblue',
          },
        }}
      >
        {branchData.branches.map((branch: Branch) => (
          <MenuItem key={branch._id} value={branch._id}>
            {branch.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
