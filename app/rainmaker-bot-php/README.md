# The Rainmaker Discord Bot (PHP Version)

A Discord bot that integrates with Solana and Solscan's API for wallet verification, contract data fetching, and detecting potential rug pulls.

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/rainmaker-bot-php.git
   cd rainmaker-bot-php
   ```

2. Install dependencies:
   ```bash
   composer install
   ```

3. Create a `.env` file and add your credentials:
   ```env
   DISCORD_BOT_TOKEN=your_discord_bot_token
   SOLSCAN_API_KEY=your_solscan_api_key
   ```

4. Start the bot:
   ```bash
   php index.php
   ```

## Commands

- `!verify <wallet_address>`: Verify ownership of a Solana wallet.
- `rug`: Check for concurrent transactions on a contract mentioned in the previous message.
- Automatic contract detection: Detects Solana contract addresses or tickers in messages and displays their data.

## Deployment

Deploy the bot on a cloud platform like Heroku, Vercel, or AWS. Set the environment variables (`DISCORD_BOT_TOKEN`, `SOLSCAN_API_KEY`) on the hosting platform.