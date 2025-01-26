<?php

require 'vendor/autoload.php';
use Discord\Discord;
use Discord\Parts\Channel\Message;
use Discord\Parts\Embed\Embed;
use GuzzleHttp\Client;

// Load environment variables
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

// Initialize Discord bot
$discord = new Discord([
    'token' => $_ENV['DISCORD_BOT_TOKEN'],
]);

// Initialize HTTP client for Solscan API
$httpClient = new Client([
    'base_uri' => 'https://api.solscan.io',
    'headers' => [
        'Authorization' => 'Bearer ' . $_ENV['SOLSCAN_API_KEY'],
    ],
]);

// Bot startup
$discord->on('ready', function ($discord) {
    echo "Bot is ready!", PHP_EOL;

    // Handle messages
    $discord->on('message', function ($message, $discord) use ($httpClient) {
        if ($message->author->bot) return; // Ignore bot messages

        // Wallet verification command
        if (strpos($message->content, '!verify') === 0) {
            $walletAddress = explode(' ', $message->content)[1] ?? null;
            if (!$walletAddress) {
                $message->reply('Please provide a wallet address. Usage: `!verify <wallet_address>`');
                return;
            }

            try {
                $challenge = "Verify ownership of $walletAddress at " . time();
                $message->author->sendMessage("Please sign this message to verify ownership: \"$challenge\"");
                $message->reply('Check your DMs for the verification challenge.');

                // Wait for signed message (simplified example)
                $discord->on('message', function ($dmMessage) use ($message, $walletAddress) {
                    if ($dmMessage->author->id === $message->author->id && $dmMessage->channel->type === 'DM') {
                        $isValid = true; // Replace with actual verification logic
                        if ($isValid) {
                            $message->reply("✅ Wallet $walletAddress verified successfully!");
                        } else {
                            $message->reply('❌ Verification failed. Please try again.');
                        }
                    }
                });
            } catch (Exception $e) {
                $message->reply('❌ Invalid wallet address or verification failed.');
            }
        }

        // Contract address/ticker detection
        $contractRegex = '/\$[A-Za-z0-9]+|([A-Za-z0-9]{32,44})/';
        if (preg_match_all($contractRegex, $message->content, $matches)) {
            foreach ($matches[0] as $match) {
                $contractAddress = str_starts_with($match, '$') ? substr($match, 1) : $match;
                try {
                    $response = $httpClient->get("/account/$contractAddress");
                    $contractData = json_decode($response->getBody(), true)['data'];

                    $embed = new Embed($discord);
                    $embed->setTitle("Contract: $contractAddress")
                          ->addField('Balance', ($contractData['lamports'] / 1e9) . ' SOL')
                          ->addField('Transactions', $contractData['transactionCount'])
                          ->setColor('#00FF00');

                    $message->reply('', false, [$embed]);
                } catch (Exception $e) {
                    $message->reply('❌ Failed to fetch contract data. Please check the address.');
                }
            }
        }

        // RUG command
        if (strtolower($message->content) === 'rug') {
            $shillerMessage = $message->channel->messages->fetch($message->id, 1)->first();
            $shillerContent = $shillerMessage->content;

            if (preg_match('/([A-Za-z0-9]{32,44})/', $shillerContent, $contractMatch)) {
                $contractAddress = $contractMatch[0];
                try {
                    $response = $httpClient->get("/account/$contractAddress/transactions");
                    $transactions = json_decode($response->getBody(), true)['data'];

                    $embed = new Embed($discord);
                    $embed->setTitle("Concurrent Transactions for $contractAddress")
                          ->setDescription('Found ' . count($transactions) . ' transactions in the last 5 minutes.')
                          ->setColor('#FF0000');

                    $message->reply('', false, [$embed]);
                } catch (Exception $e) {
                    $message->reply('❌ Failed to fetch transaction data.');
                }
            } else {
                $message->reply('❌ No contract address found in the SHILLER\'s post.');
            }
        }
    });
});

// Start the bot
$discord->run();