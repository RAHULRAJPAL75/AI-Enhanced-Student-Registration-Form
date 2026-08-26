# 🚀 Groq AI Setup Guide

## Why Groq?

✅ **FREE** - Generous free tier with 30 requests/minute  
⚡ **FAST** - 10x faster than OpenAI (300+ tokens/sec)  
🎯 **POWERFUL** - Uses Llama 3.3 70B model  
💰 **NO CREDIT CARD** - No payment required for free tier  

## Get Your FREE Groq API Key

### Step 1: Sign Up
1. Go to [console.groq.com](https://console.groq.com/)
2. Click **"Sign in"** or **"Start Building"**
3. Sign up with Google, GitHub, or Email (FREE - no credit card!)

### Step 2: Create API Key
1. Once logged in, click **"API Keys"** in the left sidebar
2. Click **"Create API Key"**
3. Give it a name (e.g., "Student Portal AI")
4. Click **"Submit"**
5. **COPY** the key immediately (starts with `gsk_...`)

### Step 3: Add to Your Project
1. Open `backend/.env` file
2. Uncomment the `GROQ_API_KEY` line
3. Paste your key:
   ```env
   GROQ_API_KEY=gsk_your-actual-key-here
   ```
4. Save the file

### Step 4: Restart Backend
```bash
cd backend
npm start
```

## Features Powered by Groq AI

### 1. 💬 AI Chat Assistant
- Floating chat bubble on dashboard
- Answers questions about portal features
- Context-aware responses
- **Model:** openai/gpt-oss-20b (configurable with `GROQ_MODEL` in `backend/.env`)

### 2. 💡 AI Insights
- Personalized learning recommendations
- Collaboration suggestions
- Sprint goal ideas
- Auto-refreshes on dashboard

### 3. 🔍 Semantic Search (Future)
- Understand search intent
- Find relevant students by context
- Beyond keyword matching

## Free Tier Limits

| Feature | Free Tier |
|---------|-----------|
| Requests | 30 per minute |
| Daily Limit | 14,400 requests/day |
| Speed | ~300 tokens/second |
| Models | Llama 3.3 70B, Mixtral, Gemma |

**That's enough for thousands of students!** 🎉

## Testing the AI Features

### Without API Key (Demo Mode)
- AI features work with fallback responses
- Shows setup instructions
- Great for development

### With API Key (Full AI)
- Real-time AI responses
- Personalized insights
- Context-aware chat

## Troubleshooting

### "AI assistant is not configured"
- Make sure `GROQ_API_KEY` is in `backend/.env`
- Check the key starts with `gsk_`
- Restart backend server

### "Rate limit exceeded"
- Free tier: 30 requests/minute
- Wait 60 seconds or upgrade plan
- For student project, free tier is plenty!

### API Key Not Working
- Verify key is correct (no extra spaces)
- Check you copied the entire key
- Create a new key if needed

## Comparing: Groq vs OpenAI

| Feature | Groq (FREE) | OpenAI (Paid) |
|---------|-------------|---------------|
| Cost | FREE | $0.50-$2 per 1M tokens |
| Speed | 300 tokens/sec | 30 tokens/sec |
| Signup | No credit card | Credit card required |
| Model | Llama 3.3 70B | GPT-3.5/GPT-4 |
| Daily Free | 14,400 requests | ~$5 credit (expires) |

**For student projects, Groq is perfect!** 🎓

## Support

- Groq Docs: [console.groq.com/docs](https://console.groq.com/docs)
- Community: [discord.gg/groq](https://discord.gg/groq)
- Models: [console.groq.com/docs/models](https://console.groq.com/docs/models)

## Next Steps

1. ✅ Get your free Groq API key
2. ✅ Add to `backend/.env`
3. ✅ Restart backend
4. 🎉 Enjoy blazing-fast AI features!

---

**Pro Tip:** Keep your API key secret! Never commit `.env` files to Git.
