# LabCohort: Your Research Helper & Socializing Platform

## 📚 About LabCohort

LabCohort is a MERN stack web application designed for researchers, academics, and students to **discover, manage, analyze, and share research papers**, and **connect with peers**. It's the ultimate combination of your browser tabs into a single website where you can search for, contain, analyze, and understand research papers, all while effortlessly connecting with fellow researchers and engaging in discussions.

---

## ✨ Key Features

1.  **User Authentication:** Secure sign-up and login functionalities.
2.  **Personalized User Profiles:** Create and manage your profile, adding social and academic links (GitHub, LinkedIn, Kaggle, ResearchGate).
3.  **Comprehensive Research Paper Management:** Browse and search for papers, then effortlessly like and bookmark them for easy access.
4.  **Integrated AI Assistant:** Chat directly with your favorite AI assistant (Gemini) without ever leaving the platform – no more switching tabs!
5.  **One-Click Paper Analysis:** Summarize and extract key aspects of research papers instantly, gaining insights and related topics with a single click.
6.  **Social Networking:** Send and manage friend requests, view your friends list, and explore other users' profiles and connections.
7.  **User Search:** Easily find and connect with other researchers by username or ID to expand your network.
8.  **QuickNote Functionality:** Jot down and download important notes directly from the website using the sidebar QuickNote feature.
9.  **Responsive Design:** A clean, intuitive, and adaptive user interface built with React.

---

## 📸 Features Overview (with Screenshot Suggestions)

### 1. User Authentication

Seamlessly sign up and log in to your LabCohort account to access personalized features.

[Alt text](screenshots/login.png)


### 2. Personalized User Profiles

Manage your personal information, update your password, and showcase your online presence with integrated links to your GitHub, LinkedIn, Kaggle, and ResearchGate profiles.
#### 1. Social Networking (Friends)
Connect with other researchers! Send friend requests, accept or decline incoming requests, and manage your network.
#### 2. User Search
Easily find and connect with specific users by searching for their IDs.
[Alt text](screenshots/Profilepage.png)


### 3. Comprehensive Research Paper Management

Discover a vast collection of research papers. You can mark papers as liked or bookmarked to organize your research.

[Alt text](screenshots/Paperspage.png)

### 4. Chat With Your AI Assistant Directly Through Here

Thought of talking to your favorite AI assistant but have to change tabs? No need to worry! With the help of API integration, you can directly chat with Gemini from the website itself while doing your other work.

[Alt text](screenshots/Geminipage.png)


### 5. Analyze Research Papers with a Single Button

Analyzing research papers is not that easy, especially if you read them line by line. Now, with just one "analyze" button, you can summarize and extract key aspects of the paper along with many additional related topics.

[Alt text](screenshots/PaperPreview.png)
[Alt text](screenshots/AnalyzePage.png)

### 6. QuickNote

Take and download quick notes directly from the website, conveniently available on the right side of your screen.

[Alt text](screenshots/QuickNoteWriter.png)
[Alt text](screenshots/QuickNotePreview.png)
*

---

## 🚀 Technologies Used

LabCohort is built using the **MERN stack**, ensuring a robust and scalable application.

### Frontend:

* [React.js](https://react.dev/)
* [React Router DOM](https://reactrouter.com/en/main)
* [Axios](https://axios-http.com/) (for API requests)
* [jwt-decode](https://www.npmjs.com/package/jwt-decode)
* [React Icons](https://react-icons.github.io/react-icons/)
* CSS3

### Backend:

* [Node.js](https://nodejs.org/en)
* [Express.js](https://expressjs.com/)
* [JWT (jsonwebtoken)](https://www.npmjs.com/package/jsonwebtoken)
* [Bcrypt.js](https://www.npmjs.com/package/bcryptjs) (for password hashing)
* [Cors](https://www.npmjs.com/package/cors)
* [Dotenv](https://www.npmjs.com/package/dotenv)
* **Database Management:** SQLite3

---

## 📈 Future Enhancements / Roadmap

LabCohort is continuously evolving! Here are some features and improvements I'm planning for future iterations:

* **AI-Powered Paper Recommendation System:** An intelligent system that suggests papers based on your liked/bookmarked papers, search history, and research interests.
* **Expanded Paper Sources:** Integrate more academic databases beyond ArXiv and PubMed to broaden the available paper collection.
* **User Paper Upload & Sharing:** Allow users to upload their own research papers and share them with the community.
* **Real-time Notifications:** Implement instant notifications for friend requests, paper likes, new uploads, and discussions.
* **Advanced Paper Search & Filters:** Introduce more granular search options (e.g., by specific topics, publication year ranges, author affiliations) and category filters.
* **Comment System:** Enable users to comment on papers and engage in in-depth discussions.
* **Group Creation:** Allow users to create private or public groups for collaborative research projects.
* **Performance Optimizations:** Explore advanced caching strategies, database indexing, and code optimizations for improved application speed and responsiveness.
* **Accessibility Improvements:** Enhance the UI/UX to meet accessibility standards, ensuring a seamless experience for all users.

---

## ⚙️ Installation & Setup

Follow these steps to get LabCohort up and running on your local machine.

### Prerequisites

* Node.js (v14 or higher recommended)
* Git

### 1. Clone the Repository

```
$ git clone https://github.com/narayandabu/Rchef.git
```
```cd Rchef```

### 2. Backend Setup
Navigate to the server directory, install dependencies, and create your environment file.
Then :

```cd .Bbackend```

```npm install```

 Then to start the Backend Server use:
```npm run dev```
or ```npm start```

- The backend server will run on http://localhost:5000 (or your specified PORT).

### 3. Frontend Setup
Open a new terminal, navigate to the client directory, and install dependencies.

``` cd ./Frontend```

```npm install ```

- The frontend application automatically looks for the backend at http://localhost:5000 (as configured in pckage.jsson as  "proxy": "http://localhost:5000"). If you changed the backend port, you might need to update axiosInstance.js accordingly.

Now, start the frontend development server:

```npm start``` or use

```npm run dev```

The frontend application will open in your browser at http://localhost:5173 as I have configured it to do so you can change it in my npm setup.

#### - NOTE: 
🤝 Contributing
Contributions are welcome! If you have suggestions for improvements or new features, please follow these steps:

- STEPS:

1. Fork the repository.

2. Create a new branch (git checkout -b feature/your-feature-name).

3. Make your changes.

4. Commit your changes (git commit -m 'Add new feature').

5. Push to the branch (git push origin feature/your-feature-name).

6. Open a Pull Request.

- Please ensure your code adheres to the project's style and includes relevant tests if applicable.


### 📞 Contact
For any questions or inquiries, feel free to reach out:

Name: Narayan Prasad Das

GitHub: https://github.com/narayandabu

Email: narayanpdas2004@gmail.com 