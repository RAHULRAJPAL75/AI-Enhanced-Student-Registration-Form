# GenAI Features - Student Registration Portal

## 🤖 What's Been Added

This project now includes **3 real GenAI features** built for a GenAI Architect intern role:

### 1. **AI Chat Assistant** 🗨️
- Floating chat widget on the dashboard (bottom-right corner)
- Answers questions about:
  - Sprint workflows and agile practices
  - Student records and MongoDB database
  - Dashboard features and navigation
  - Account management
- **Context-aware**: Knows your name and the number of students in the system

### 2. **AI-Powered Insights** 💡
- Personalized recommendations shown on the dashboard
- Generates 3 smart suggestions:
  - Learning path recommendations
  - Collaboration opportunities
  - Sprint goal suggestions
- Updates automatically based on your profile

### 3. **Semantic Search** 🔍
- Backend endpoint for intelligent student search
- Understands search intent, not just keywords
- Uses OpenAI embeddings for similarity matching
- (Frontend integration ready via `/api/ai/search` endpoint)

---

## 🚀 How to Use

### Run in Demo Mode (No API Key Required)
The features work **right now** in demo mode with simulated responses:

```bash
# Terminal 1 - Start backend
cd backend
npm start

# Terminal 2 - Start frontend
cd frontend
npm run dev
```

Visit `http://localhost:5173` and:
1. Register or login
2. See AI Insights card on dashboard
3. Click the chat bubble (bottom-right) to chat with AI
4. All features work with demo responses!

---

### Enable Full AI Features (OpenAI API Key)

1. **Get an OpenAI API Key**
   - Go to: https://platform.openai.com/api-keys
   - Create a new secret key
   - Copy it

2. **Add to Backend Environment**
   - Edit `backend/.env`
   - Uncomment and add your key:
     ```env
     OPENAI_API_KEY=sk-your-actual-key-here
     ```

3. **Restart Backend Server**
   ```bash
   cd backend
   npm start
   ```

4. **Test Full AI**
   - Chat widget will now use real GPT-3.5-turbo responses
   - Insights will be personalized with real AI analysis
   - Semantic search will use real embeddings

---

## 🛠️ Technical Architecture

### Backend (`backend/`)
```
services/
  ├── aiService.js         # AI logic (OpenAI integration)
routes/
  ├── aiRoutes.js          # API endpoints (/api/ai/*)
server.js                  # Routes wired in
```

### Frontend (`frontend/src/`)
```
components/
  ├── AIChatWidget.jsx     # Chat UI component
  ├── AIInsights.jsx       # Insights dashboard card
App.jsx                    # Components integrated
```

### API Endpoints
| Endpoint | Method | Purpose |
|---|---|---|
| `/api/ai/chat` | POST | Chat with AI assistant |
| `/api/ai/insights` | POST | Generate student insights |
| `/api/ai/search` | POST | Semantic student search |
| `/api/ai/status` | GET | Check if AI is enabled |

---

## 💰 Cost Considerations

**Demo Mode:** Free - no API calls
**Full AI Mode:** ~$0.002 per chat message (GPT-3.5-turbo)

For an internship project with ~100 interactions:
- Total cost: **~$0.20** (very affordable!)

---

## 🎨 UI Features

- **Dark theme** matching existing dashboard
- **Smooth animations** on all AI components
- **Demo mode badge** shows when running without API key
- **Loading states** with spinners and typing indicators
- **Mobile responsive** - chat widget adapts to small screens

---

## 🔒 Security Notes

- API key is **never exposed to frontend**
- All AI calls go through your backend
- Demo mode works offline/without API key
- Environment variables properly configured

---

## 📚 What You Learned (GenAI Architect Skills)

✅ OpenAI API integration (chat completions, embeddings)
✅ Building context-aware AI assistants
✅ Prompt engineering for specific use cases
✅ Graceful fallbacks (demo mode)
✅ Full-stack AI feature implementation
✅ Cost-effective AI architecture

---

## 🐛 Troubleshooting

**Chat not working?**
- Check backend is running on port 5000
- Check browser console for errors
- Verify MongoDB is connected

**Want real AI responses?**
- Add `OPENAI_API_KEY` to `backend/.env`
- Restart backend server
- Check `/api/ai/status` endpoint

**Demo mode is fine!**
- All features work with simulated responses
- Great for testing and demos
- No cost, no setup required

---

## 🎯 Next Steps (Advanced Features)

Want to extend this further?

1. **Vector Database Integration**
   - Use Pinecone/Weaviate for semantic search
   - Store student embeddings
   - True semantic similarity matching

2. **RAG Pipeline**
   - Upload course documents
   - Build knowledge base
   - AI answers from course content

3. **Multi-Modal AI**
   - Image analysis for student projects
   - Vision + language models
   - Screenshot understanding

4. **Fine-Tuned Models**
   - Train custom model on your data
   - Domain-specific responses
   - Better accuracy for your use case

---

Made with 🤖 by a GenAI Architect Intern
