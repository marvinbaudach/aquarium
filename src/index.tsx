import { createRoot } from 'react-dom/client'
import './styles.css'
import App from './App'
import { SPHERES } from './data/spheres'

const root = document.getElementById('root')
if (!root) throw new Error('Root element #root not found')

createRoot(root).render(<App spheres={[...SPHERES]} />)
