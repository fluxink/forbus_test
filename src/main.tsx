import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { Provider } from "react-redux"
import { App } from "./App"
import { store } from "./app/store"
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { theme } from "./config/theme"

const container = document.getElementById("root")

if (container) {
    const root = createRoot(container)

    root.render(
        <StrictMode>
            <ThemeProvider theme={theme}>
                <Provider store={store}>
                    <CssBaseline />
                    <App />
                </Provider>
            </ThemeProvider>
        </StrictMode>,
    )
} else {
    throw new Error(
        "Root element with ID 'root' was not found in the document. Ensure there is a corresponding HTML element with the ID 'root' in your HTML file.",
    )
}
