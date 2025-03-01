# Reality2DProxies

A React application that provides a user-friendly interface for testing and using the DINO-X API for object detection, segmentation, and analysis in images.

## Overview

Reality2DProxies is a tool that allows you to upload images and analyze them using the DINO-X API. The application provides a visual representation of detected objects, bounding boxes, and segmentation masks. It's built with React, TypeScript, and Vite, and uses Tailwind CSS for styling.

## Features

- Upload and analyze images using the DINO-X API
- Customize analysis prompts
- View detected objects with bounding boxes and segmentation masks
- Filter results by object category
- Select different visualization layers (bounding boxes, masks, etc.)
- Integration with GPT-4V for additional analysis (optional)

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- DINO-X API token (from [Deep Data Space](https://api.deepdataspace.com))
- (Optional) OpenAI API key for GPT-4V integration

## Getting Started

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/Reality2DProxies.git
   cd Reality2DProxies
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env` file based on the example:
   ```bash
   cp .env.example .env
   ```

4. (Optional) Add your OpenAI API key to the `.env` file if you want to use GPT-4V integration:
   ```
   VITE_OPENAI_API_KEY=your_api_key_here
   ```

### Running the Application

Start the development server:
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`.

## Usage

1. **Enter your DINO-X API token** in the token field
2. **Upload an image** by dragging and dropping or clicking the upload area
3. **Customize the prompt** (default is `<universal_twice>`)
4. **Click "Analyze"** to process the image
5. **View the results** in the display area below
   - Use the filter bar to show/hide specific object categories
   - Use the layer selector to toggle different visualization elements

## API Integration

The application integrates with the DINO-X API from Deep Data Space. The API provides object detection, segmentation, and analysis capabilities.

### Default Prompt

The default prompt `<universal_twice>` is a special prompt that instructs the DINO-X API to detect a wide range of objects. You can customize this prompt based on your specific needs.

## Project Structure

- `src/components/` - React components for the UI
- `src/hooks/` - Custom React hooks for state management and API integration
- `src/services/` - API integration services
- `src/types/` - TypeScript type definitions
- `src/utils/` - Utility functions

## Development

### Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run lint` - Run ESLint to check for code issues
- `npm run preview` - Preview the production build locally

### Adding New Features

To add new features or modify existing ones:

1. Make changes to the relevant components or services
2. Test your changes locally
3. Submit a pull request with a description of your changes

## Troubleshooting

### Common Issues

- **API Token Issues**: Ensure your DINO-X API token is valid and correctly entered
- **Image Upload Problems**: Check that your image is in a supported format (JPEG, PNG)
- **Analysis Timeout**: Large images or complex scenes may take longer to analyze

## License

[Include license information here]

## Acknowledgements

- [DINO-X API](https://api.deepdataspace.com) for providing the object detection capabilities
- [React](https://reactjs.org/) and [Vite](https://vitejs.dev/) for the frontend framework
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Lucide React](https://lucide.dev/) for icons 