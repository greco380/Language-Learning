# Language Learning App 🌍

An interactive language learning application that uses speech recognition and AI to help you build vocabulary in your target language. Record words, generate personalized curricula, and practice with AI-powered quizzes.

## Features ✨

- **🎤 Voice Recording**: Record yourself asking for words in your target language
- **🤖 AI-Powered Word Extraction**: Uses OpenAI to understand and extract words from your speech
- **📚 Auto-Generated Curriculum**: Automatically organizes your vocabulary into themed courses
- **📝 Practice Mode**: AI-generated quizzes to test your knowledge
- **📊 Progress Tracking**: Monitor your learning progress across all courses
- **💾 Local Storage**: All data saved locally in your browser
- **🌐 15+ Languages**: Support for Spanish, French, German, Italian, Japanese, and more
- **📱 Responsive Design**: Works on desktop and mobile devices

## Tech Stack 🛠️

- **Frontend**: React 18 with Hooks
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **AI Integration**: OpenAI API (GPT-3.5/GPT-4)
- **Speech Recognition**: Web Speech API
- **State Management**: React Context API
- **Storage**: localStorage

## Prerequisites 📋

- Node.js 14+ and npm
- Modern web browser with Web Speech API support (Chrome, Edge, Safari)
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

## Installation 🚀

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd language-learning-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**

   Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your OpenAI API key:
   ```env
   REACT_APP_OPENAI_API_KEY=your_actual_api_key_here
   REACT_APP_OPENAI_MODEL=gpt-3.5-turbo
   REACT_APP_DEFAULT_LANGUAGE=Spanish
   ```

   **Important**: Never commit your `.env` file! It's already in `.gitignore`.

4. **Start the development server**
   ```bash
   npm start
   ```

   The app will open at [http://localhost:3000](http://localhost:3000)

## Usage Guide 📖

### Recording Words

1. **Select Your Target Language**
   - Click the language dropdown in the top-right corner
   - Choose from 15+ available languages

2. **Record a Word**
   - Click the microphone button on the home page
   - Say: *"Please say [word] in [language]"*
   - Example: *"Please say hello in Spanish"*
   - The word will be extracted and saved automatically

3. **View Your Words**
   - Navigate to the "History" tab
   - Search, filter, and sort your vocabulary
   - Delete words you don't need

### Learning with Curriculum

1. **Generate Curriculum**
   - Go to the "Curriculum" tab
   - Your words are automatically organized into themed courses
   - Courses are categorized by difficulty (beginner, intermediate, advanced)

2. **Start a Course**
   - Click on any course card
   - You'll be taken to the practice page with AI-generated questions

### Practice Mode

1. **Answer Questions**
   - Read the question carefully
   - Type your answer or select from multiple choice
   - Submit to see if you're correct

2. **Track Progress**
   - View your score after each question
   - See overall session statistics at the end
   - Your progress is saved automatically

## Project Structure 📁

```
language-learning-app/
├── public/
│   └── index.html
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── BottomNav.jsx
│   │   ├── RecordButton.jsx
│   │   ├── LanguageToggle.jsx
│   │   ├── WordCard.jsx
│   │   ├── CourseCard.jsx
│   │   └── PracticeQuestion.jsx
│   ├── pages/              # Main application pages
│   │   ├── HomePage.jsx
│   │   ├── PracticePage.jsx
│   │   ├── HistoryPage.jsx
│   │   └── CurriculumPage.jsx
│   ├── services/           # API and browser services
│   │   ├── openaiService.js
│   │   ├── speechService.js
│   │   └── storageService.js
│   ├── utils/              # Helper functions
│   │   ├── audioProcessor.js
│   │   ├── scoreCalculator.js
│   │   └── curriculumGenerator.js
│   ├── hooks/              # Custom React hooks
│   │   ├── useRecording.js
│   │   └── useSpeechRecognition.js
│   ├── context/            # Global state management
│   │   └── AppContext.jsx
│   ├── App.jsx             # Main app component
│   ├── index.js            # Entry point
│   └── index.css           # Global styles
├── .env.example            # Environment variables template
├── .gitignore
├── package.json
├── tailwind.config.js
└── README.md
```

## Configuration ⚙️

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_OPENAI_API_KEY` | Your OpenAI API key | *Required* |
| `REACT_APP_OPENAI_MODEL` | OpenAI model to use | `gpt-3.5-turbo` |
| `REACT_APP_DEFAULT_LANGUAGE` | Default target language | `Spanish` |

### Supported Languages

- Spanish
- French
- German
- Italian
- Portuguese
- Japanese
- Chinese
- Korean
- Russian
- Arabic
- Hindi
- Dutch
- Swedish
- Norwegian
- Danish

## Browser Compatibility 🌐

The app requires Web Speech API support:

- ✅ Chrome/Edge (Recommended)
- ✅ Safari
- ❌ Firefox (Limited support)

## Building for Production 🏗️

```bash
npm run build
```

This creates an optimized production build in the `build/` folder.

To serve the production build locally:
```bash
npx serve -s build
```

## Troubleshooting 🔧

### Microphone Not Working

1. Check browser permissions for microphone access
2. Ensure you're using HTTPS (required for Web Speech API)
3. Try Chrome or Edge if using Firefox

### API Errors

1. Verify your OpenAI API key in `.env`
2. Check your OpenAI account has credits
3. Ensure the `.env` file is in the root directory

### Words Not Saving

1. Check browser console for errors
2. Ensure localStorage is enabled
3. Try clearing browser cache and refreshing

## Data Privacy 🔒

- All vocabulary data is stored locally in your browser
- API calls to OpenAI only send transcriptions and learning data
- No user data is collected or sent to external servers
- Export your data anytime using the "Export Data" button

## Development 💻

### Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

### Adding New Features

1. Create components in `src/components/`
2. Add pages in `src/pages/`
3. Update routing in `src/App.jsx`
4. Use `useAppContext()` for global state

## Contributing 🤝

Contributions are welcome! Please feel free to submit issues and pull requests.

## License 📄

This project is licensed under the MIT License.

## Acknowledgments 🙏

- OpenAI for GPT API
- Web Speech API for speech recognition
- Tailwind CSS for styling
- Lucide React for icons

## Support 💬

For issues and questions, please open an issue on GitHub.

---

**Happy Learning! 🎉**
