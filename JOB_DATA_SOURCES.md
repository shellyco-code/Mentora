# 🛠️ Real-World Data Integration

Mentora AI has been upgraded to support real-world data fetching for Jobs and Learning Recommendations. This replaces AI-generated placeholders with live, actionable opportunities.

## 💼 Jobs: Adzuna API
We use the **Adzuna API** to fetch real-time job listings from around the globe (LinkedIn, Indeed, etc.).

### How to set up:
1.  Go to [Adzuna Developers](https://developer.adzuna.com/).
2.  Register for a free account.
3.  Go to your Dashboard to find your **App ID** and **App Key**.
4.  Add them to your `server/.env` file:
    ```env
    ADZUNA_APP_ID=your_id_here
    ADZUNA_APP_KEY=your_key_here
    ```

## 📚 Learning: YouTube & Google Books
For skill gap recommendations, we can now pull:
- **YouTube Tutorials**: Free video courses matched to your skill gaps.
- **Google Books**: Recommended reading material.

### Integration Details:
The system follows a **Hybrid Intelligence** model:
1.  **AI (Gemini)**: Identifies the specific skill gaps and target job roles from your resume.
2.  **External APIs**: Fetches the latest, live results based on those AI-identified keywords.

---

*Built with ❤️ for Mentora AI*
