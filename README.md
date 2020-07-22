# X:/Anonymous

## Cryptographic algorithms and functions used in this project haven't been fully reviewed, so don't use this for any seriously sensitive data. 

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

#### Side Notes:

* If it doesn't work, once the project has loaded, look for the "package.json" file on the left side of the screen, and click on it. Then click on the "Add Package" button, and click on any packages that show up to download them. If it still doesn't work, then contact me through one of my social media profiles listed at the bottom of my [website](https://www.xtrendence.com).

* Keep in mind that Glitch automatically shuts down your server after 30 minutes of inactivity.

* Messages are encrypted using RSA-2048/3072/4096 (depending on which one you choose), so they will have a character limit. The bigger the key size, the stronger the encryption (but the chat app will be slower). In the future, I might just encrypt each message using AES and a random key, and then encrypt the AES key with RSA to bypass any limits, just like how images are encrypted.

* Most browsers have a limit of 5MBs of local storage per website. If the storage gets full, new messages and conversations won't be saved. You can keep an eye on it through the settings pane or on the chat page.

### What does this do?

This is a self-hosted, open-source, end-to-end encrypted chat application that doesn't save conversations. Basically, when you create a conversation, a private and public key pair is generated locally on your browser. Nobody else (including the server) knows what the private key is. When you send messages to the other person using X:/Anonymous, the message is encrypted using RSA. Conversations are stored locally as well, so the server literally saves no information about you by design. Glitch, the website I mentioned above to host the application on, probably stores IP addresses and whatnot, but they never ever get a plaintext copy of your messages. They don't get your private key at any point either. So the server ultimately has absolutely no idea what's actually being said between two people, and since it's self hosted, you can know for sure that there isn't any malicious code or anything that could compromise the security of your communications.

### Can I send files?

Yes, but currently, only images. The way it works is that you select an image, it gets converted to Base64 on your browser, a random string is generated and is used as a key to encrypt the Base64 string using AES. The key is then encrypted using the other person's public key, and both the AES encrypted string and RSA encrypted string are sent to the server, and relayed to the other user. The other user then uses their private key to decrypt the AES key, and uses the key to decrypt the string and finally get the Base64 string that represents the image. So throughout the process, the server can't view the image. The image isn't stored anywhere, even in local storage (it would be too big anyway, and would require users to increase their local storage size limit).

### Why would I need this?

Pretty much every social media platform has a chat feature, but they all store your chats in such a way that they can read them. This is a massive invasion of privacy. What if you want to share a secret with one person, and one person only? Wouldn't you feel better knowing potentially hundreds of people don't have access to your conversations?

### Why can't I just use an app like Signal?

You can, and you should, but for regular conversations. Most messaging apps store your conversations on their servers. I believe Signal stores them locally though. For the ones that store them on their servers, they might be encrypted, but they're still stored. X:/Anonymous doesn't even store them. It literally stores nothing but the time at which a conversation was created, its participant's anonymous IDs (randomly generated), and their public keys (also randomly generated). So what's better? Encryption, or no data existing in the first place? If you host it on Glitch, they might save the encrypted conversation content, but if you host it on a private domain, then nothing is saved at any point.

### How does it work?

Let's suppose there are two people who want to talk to each other, but what they want to say has to remain an absolute secret, to the point where they don't even want a record of the conversation existing. We'll call them Adam and Eve. Adam creates an anonymous conversation using X:/Anonymous. On his browser, completely on the client-side, a public key and private key are generated for him. He sends his public key to the server, and gets an anonymous ID generated for him. A file is created on the server that contains the time at which the conversation was created, when it was last modified, and Adam's anonymous ID and public key. A conversation ID is also generated, and Adam is redirected to the chat page. He can now send a link for Eve to join by sharing his URL. Eve clicks on the link, and she (still on the client-side) gets a private and public key pair generated for her, is given an anonymous ID, and is given access to the chat page. Adam and Eve's private keys are stored on their browser's local storage, never by the server. When they send a message to each other, they encrypt their messages with the other person's public key. The encrypted message is sent to the server, and relayed to the other person, who then decrypts it locally on the client-side with their private key. At no point does the server have access to any private keys, or any plaintext data. Messages that are sent and received also get stored in the browser's local storage. The downside is that there's no way to really prove what the original content of a message was if one of the users decides to modify their local storage records and make it seem like the other person said something they didn't. But would you rather trust one other person (who's potentially a friend), or an entire company that would have a lot to gain from selling your data?

### Can this be dangerous?

Probably, but so can anything else. There are already plenty of services that accomplish this very thing, I'm just not aware of any self-hosted ones that can be hosted with the click of a link (thanks Glitch). This was created to promote and encourage privacy, not nefarious activities such as piracy or terrorism.

## Terminology

**Local Storage:** A type of web storage used by your browser to store data locally. This is comparable to cookies, but the difference (in terms of privacy) is that the data is never required to be sent to the server. Local storage is an HTML5 feature though, so you'll need a fairly modern browser to use it. 

**Private Key:** Used to decrypt text that has been encrypted with the private key's corresponding public key. Keep this safe as it can decrypt messages.

**Public Key:** Used to encrypt text so that only the person with the correct private key can decrypt it. You don't need to keep this safe, it's already shared with anyone who connects to you.

**Anonymous ID:** Used to differentiate users without having to identify them. Randomly generated. Keep this safe, others may be able to "impersonate" you with it. This isn't shared with the other chat participant.

**Conversation ID:** Used to identify different conversations. Randomly generated.

![X-Anonymous](https://i.imgur.com/uTdp1pb.jpg)
