import { createTheme } from '@mui/material/styles';


export const theme = createTheme({
    shape: {
        borderRadius: 8,
    },
    components: {
        MuiButton: {
            defaultProps: {
                variant: 'contained',
            }
        }
    }
});