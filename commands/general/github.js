/**
 * GitHub Command - Show bot GitHub repository and stats
 */

const axios = require('axios');
const config = require('../../config');

module.exports = {
    name: 'github',
    aliases: ['repo', 'git', 'source', 'sc', 'script'],
    category: 'general',
    description: 'Show bot GitHub repository and statistics',
    usage: '.github',
    ownerOnly: false,

    async execute(sock, msg, args, extra) {
        try {
            const chatId = extra.from;
            
            // GitHub repository URL
            const repoUrl = 'https://github.com/mruniquehacker/KnightBot-Mini';
            const apiUrl = 'https://api.github.com/repos/mruniquehacker/KnightBot-Mini';
            
            // Send loading message
            const loadingMsg = await extra.reply('🔍 Fetching GitHub repository information...');
            
            try {
                // Fetch repository data from GitHub API
                const response = await axios.get(apiUrl, {
                    headers: {
                        'User-Agent': 'KnightBot-Mini'
                    }
                });
                
                const repo = response.data;
                
                // Format the response with a human touch
                let message = `Hey there! I found the GitHub repository for this assistant.\n\n`;
                message += `• Repository: ${repo.html_url}\n`;
                message += `• Description: ${repo.description || 'No description available'}\n`;
                message += `• Maintainer: ${repo.owner.login}\n`;
                message += `• Stars: ${repo.stargazers_count.toLocaleString()}\n`;
                message += `• Forks: ${repo.forks_count.toLocaleString()}\n`;
                message += `• Watchers: ${repo.watchers_count.toLocaleString()}\n\n`;
                message += `If you want, I can also share other commands or details.`;
                
                // Edit the loading message with the actual data
                await sock.sendMessage(chatId, {
                    text: message,
                    edit: loadingMsg.key
                });
                
            } catch (apiError) {
                // Fallback message if API fails
                console.error('GitHub API Error:', apiError.message);
                
                let fallbackMessage = `╭━━『 *GitHub Repository* 』━━╮\n\n`;
                fallbackMessage += `Hey, I couldn’t fetch the live stats just now, but here’s the repo info I could get.\n\n`;
                fallbackMessage += `• Repository: ${repoUrl}\n`;
                fallbackMessage += `• Owner: mruniquehacker\n`;
                fallbackMessage += `\nFeel free to visit the link for the latest details.`;
                
                await sock.sendMessage(chatId, {
                    text: fallbackMessage,
                    edit: loadingMsg.key
                });
            }
            
        } catch (error) {
            console.error('GitHub command error:', error);
            await extra.reply(`❌ Error: ${error.message}`);
        }
    }
};