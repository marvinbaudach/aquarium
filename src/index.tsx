import { createRoot } from 'react-dom/client'
import './styles.css'
import App from './App'

const root = document.getElementById('root')
if (!root) throw new Error('Root element #root not found')

createRoot(root).render(
  <App
    spheres={[
      [1, 'orange', 0.05, [-4, -1, -1]],
      [0.75, 'hotpink', 0.1, [-4, 2, -2]],
      [1.25, 'aquamarine', 0.2, [4, -3, 2]],
      [1.5, 'lightblue', 0.3, [-4, -2, -3]],
      [2, 'pink', 0.3, [-4, 2, -4]],
      [2, 'skyblue', 0.3, [-4, 2, -4]],
      [1.5, 'orange', 0.05, [-4, -1, -1]],
      [2, 'hotpink', 0.1, [-4, 2, -2]],
      [1.5, 'aquamarine', 0.2, [4, -3, 2]],
      [1.25, 'lightblue', 0.3, [-4, -2, -3]],
      [1, 'pink', 0.3, [-4, 2, -4]],
      [1, 'skyblue', 0.3, [-4, 2, -4]],
    ]}
  />,
)
