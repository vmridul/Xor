# 𝕏𝕠𝕣 — Post Organizer for 𝕏

**𝕏𝕠𝕣** is a local-first extension designed to help you organize, search, and manage your saved posts on 𝕏 into folders. It has a clean, native-feeling dashboard.

##  Features

- **Two-Click Save**: Add tweets to specific folders directly from your 𝕏 timeline.
- **Smart Search**: Instantly find posts within any folder by searching tweet text, author names, or handles.
- **Custom Folders**: Create, manage, and delete folders with custom colors to categorize your inspiration.
- **Data Portability**: Export your entire collection as a JSON file or import backups in seconds.
- **Privacy First**: All your data is stored locally in your browser. No external servers, no tracking.

##  Installation
1. Download the latest file from the [Releases](#) page.
2. Extract the ZIP file to a folder on your computer.
3. Open Chrome and navigate to `chrome://extensions/`.
4. Enable **Developer mode** in the top right.
5. Click **Load unpacked** and select the extracted folder.

### For Developers
If you want to build it from source:

1. **Clone the repo:**
   ```bash
   git clone https://github.com/your-username/xor.git
   cd xor
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Build the project:**
   ```bash
   npm run build
   ```

4. **Load the extension:**
   - Go to `chrome://extensions/`.
   - Enable **Developer mode**.
   - Click **Load unpacked** and select the `dist` folder generated in your project directory.

## Tech Stack

- **Framework**: [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Components**: [Radix UI](https://www.radix-ui.com/)
- **Storage**: Chrome Storage API

##  Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
