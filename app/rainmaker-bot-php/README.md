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

5. Invite the bot to your server using this OAuth2 link:
   [Invite The Rainmaker Bot](https://discord.com/oauth2/authorize?client_id=1333005913556127746&permissions=1134139894784&response_type=code&redirect_uri=https%3A%2F%2Fdiscord.com%2Foauth2%2Fauthorize&integration_type=0&scope=identify+guilds+guilds.channels.read+messages.read+dm_channels.messages.read+activities.write+bot+connections+gateway.connect+dm_channels.messages.write+dm_channels.read+applications.entitlements+webhook.incoming+presences.write+guilds.join+gdm.join+activities.read+role_connections.write+applications.store.update+applications.builds.upload)

## Commands

- `!verify <wallet_address>`: Verify ownership of a Solana wallet.
- `rug`: Check for concurrent transactions on a contract mentioned in the previous message.
- Automatic contract detection: Detects Solana contract addresses or tickers in messages and displays their data.

## Deployment

Deploy the bot on a cloud platform like Heroku, Vercel, or AWS. Set the environment variables (`DISCORD_BOT_TOKEN`, `SOLSCAN_API_KEY`) on the hosting platform.