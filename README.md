# This project is still in development.

### How to use:

#### Manual:

1. Go to https://glitch.com and sign up.
2. Create a new project, and select "Clone from Git Repo."
3. Copy and paste the following URL into the input field: https://github.com/Xtrendence/X-Anonymous.git
4. Press "OK," and let it finish loading.
5. Click on "Show" on the top left, and select "In a New Window."

#### Automatic:

1. Go to https://glitch.com, sign up, and log in.
2. Open https://glitch.com/edit/#!/remix/clone-from-repo?REPO_URL=https://github.com/Xtrendence/X-Anonymous
3. Click on "Show" on the top left, and select "In a New Window."

#### Side Note:

If it doesn't work, once the project has loaded, look for the "package.json" file on the left side of the screen, and click on it. Then click on the "Add Package" button, and click on any packages that show up to download them. If it still doesn't work, then contact me through one of my social media profiles listed at the bottom of my [website](https://www.xtrendence.com).

Also, keep in mind that Glitch automatically shuts down your server after 30 minutes of inactivity. 

### What does this do?

This is a self-hosted, open-source, end-to-end encrypted chat application that doesn't save conversations. Basically, when you create a conversation, a private and public key pair is generated locally on your browser. The server and nobody else knows what the private key is. When you send messages to the other person using X:/Anonymous, the message is encrypted using RSA. Conversations are stored locally as well, so the server literally saves no information about you by design. Glitch, the website I mentioned above to host the application on, probably stores IP addresses and whatnot, but they never ever get a plaintext copy of your messages. They don't get your private key at any point either. So the server ultimately has absolutely no idea what's actually being said between two people, and since it's self hosted, you can know for sure that there isn't any malicious code or anything that could compromise the security of your communications.

### Why would I need this?

Pretty much every social media platform has a chat feature, but they all store your chats in such a way that they can read them. This is a massive invasion of privacy. What if you want to share a secret with one person, and one person only? Wouldn't you feel better knowing potentially hundreds of people don't have access to your conversations?

### Why can't I just use an app like Signal?

You can, and you should, but for regular conversations. Every messaging app stores your conversations on their servers. They might be encrypted, but they're still stored. X:/Anonymous doesn't even store them. It literally stores nothing but the time at which a conversation was created, its participant's anonymous IDs (randomly generated), and their public keys (also randomly generated). So what's better? Encryption, or no data existing in the first place?

## Terminology

**Private Key:** Used to decrypt text that has been encrypted with the private key's corresponding public key. Keep this safe as it can decrypt messages.

**Public Key:** Used to encrypt text so that only the person with the correct private key can decrypt it. You don't need to keep this safe, it's already shared with anyone who connects to you.

**Anonymous ID:** Used to differentiate users without having to identify them. Randomly generated. Keep this safe, others may be able to impersonate you with it. This isn't shared with the other chat participant.

**Conversation ID:** Used to identify different conversations. Randomly generated.
