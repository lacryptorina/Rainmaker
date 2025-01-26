require('dotenv').config();
const { Client, Intents, MessageEmbed } = require('discord.js');
const { Connection, PublicKey } = require('@solana/web3.js');
const axios = require('axios');

// Initialize Discord bot
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

// Initialize Solana connection
const solanaConnection = new Connection('https://api.mainnet-beta.solana.com');

// Solscan API base URL
const SOLSCAN_API_URL = 'https://api.solscan.io';

// Bot startup
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// Handle messages
client.on('messageCreate', async (message) => {
  if (message.author.bot) return; // Ignore bot messages

  // Wallet verification command
  if (message.content.startsWith('!verify')) {
    const walletAddress = message.content.split(' ')[1];
    if (!walletAddress) {
      return message.reply('Please provide a wallet address. Usage: `!verify <wallet_address>`');
    }

    try {
      const publicKey = new PublicKey(walletAddress);
      const challenge = `Verify ownership of ${walletAddress} at ${Date.now()}`;

      // Send challenge to user
      await message.author.send(`Please sign this message to verify ownership: "${challenge}"`);
      message.reply('Check your DMs for the verification challenge.');

      // Wait for signed message (this is a simplified example)
      const filter = (m) => m.author.id === message.author.id && m.channel.type === 'DM';
      const collected = await message.author.dmChannel.awaitMessages({ filter, max: 1, time: 60000, errors: ['time'] });
      const signedMessage = collected.first().content;

      // Verify signature (this is a placeholder; actual verification requires a signed transaction)
      const isValid = true; // Replace with actual verification logic
      if (isValid) {
        message.reply(`✅ Wallet ${walletAddress} verified successfully!`);
      } else {
        message.reply('❌ Verification failed. Please try again.');
      }
    } catch (error) {
      console.error(error);
      message.reply('❌ Invalid wallet address or verification failed.');
    }
  }

  // Contract address/ticker detection
  const contractRegex = /\$[A-Za-z0-9]+|([A-Za-z0-9]{32,44})/g;
  const matches = message.content.match(contractRegex);
  if (matches) {
    for (const match of matches) {
      const contractAddress = match.startsWith('$') ? match.slice(1) : match;
      try {
        const response = await axios.get(`${SOLSCAN_API_URL}/account/${contractAddress}`, {
          headers: { 'Authorization': `Bearer ${process.env.SOLSCAN_API_KEY}` },
        });

        const contractData = response.data.data;
        const embed = new MessageEmbed()
          .setTitle(`Contract: ${contractAddress}`)
          .addField('Balance', `${contractData.lamports / 1e9} SOL`)
          .addField('Transactions', contractData.transactionCount)
          .setColor('#00FF00');

        message.reply({ embeds: [embed] });
      } catch (error) {
        console.error(error);
        message.reply('❌ Failed to fetch contract data. Please check the address.');
      }
    }
  }

  // RUG command
  if (message.content.toLowerCase() === 'rug') {
    const shillerMessage = await message.channel.messages.fetch({ limit: 1, before: message.id });
    const shillerContent = shillerMessage.first().content;

    const contractAddress = shillerContent.match(/([A-Za-z0-9]{32,44})/)?.[0];
    if (!contractAddress) {
      return message.reply('❌ No contract address found in the SHILLER\'s post.');
    }

    try {
      const response = await axios.get(`${SOLSCAN_API_URL}/account/${contractAddress}/transactions`, {
        headers: { 'Authorization': `Bearer ${process.env.SOLSCAN_API_KEY}` },
      });

      const transactions = response.data.data;
      const embed = new MessageEmbed()
        .setTitle(`Concurrent Transactions for ${contractAddress}`)
        .setDescription(`Found ${transactions.length} transactions in the last 5 minutes.`)
        .setColor('#FF0000');

      message.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      message.reply('❌ Failed to fetch transaction data.');
    }
  }
});

// Start the bot
client.login(process.env.DISCORD_BOT_TOKEN);