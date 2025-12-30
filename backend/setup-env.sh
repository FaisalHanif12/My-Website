#!/bin/bash
echo "Setting up .env file..."
if [ ! -f .env ]; then
    cat > .env << 'ENVFILE'
OPENROUTER_API_KEY=sk-or-v1-0a856fc6f0ac16842650ddd48fa5dd685fd331
OPENROUTER_API_URL=https://openrouter.ai/api/v1/chat/completions
OPENROUTER_MODEL=openai/gpt-4o-mini
PORT=3000
NODE_ENV=development
ENVFILE
    echo "✅ .env file created!"
else
    echo "⚠️  .env file already exists"
fi
