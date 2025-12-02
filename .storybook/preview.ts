import type { Preview } from '@storybook/nextjs-vite'
import '../src/app/globals.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#F8F9FA' },
        { name: 'white', value: '#FFFFFF' },
        { name: 'dark', value: '#1a1a1a' },
      ],
    },
    layout: 'centered',
  },
};

export default preview;