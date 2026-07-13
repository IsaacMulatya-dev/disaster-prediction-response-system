import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './tailwind.css'
import './index.css'
import '@fontsource-variable/inter'

createRoot(document.getElementById("root")!).render(<App />);
