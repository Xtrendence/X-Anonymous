# wrb.RO

## This is an updated fork 

### What does this do?

This is a self-hosted, open-source, end-to-end encrypted chat application that doesn't save conversations. Basically, when you create a conversation, a private and public key pair is generated locally on your browser. Nobody else (including the server) knows what the private key is. When you send messages to the other person using wrb.RO, the message is encrypted using RSA. Conversations are stored locally as well, so the server literally saves no information about you by design and since it's self hosted, you can know for sure that there isn't any malicious code or anything that could compromise the security of your communications.

### Can I send files?

Yes, but currently, only images. The way it works is that you select an image, it gets converted to Base64 on your browser, a random string is generated and is used as a key to encrypt the Base64 string using AES. The key is then encrypted using the other person's public key, and both the AES encrypted string and RSA encrypted string are sent to the server, and relayed to the other user. The other user then uses their private key to decrypt the AES key, and uses the key to decrypt the string and finally get the Base64 string that represents the image. So throughout the process, the server can't view the image. The image isn't stored anywhere, even in local storage (it would be too big anyway, and would require users to increase their local storage size limit).

### Why would I need this?

Pretty much every social media platform has a chat feature, but they all store your chats in such a way that they can read them. This is a massive invasion of privacy. What if you want to share a secret with one person, and one person only? Wouldn't you feel better knowing potentially hundreds of people don't have access to your conversations?

### Why can't I just use an app like Signal?

You can, and you should, but for regular conversations. Most messaging apps store your conversations on their servers. I believe Signal stores them locally though. For the ones that store them on their servers, they might be encrypted, but they're still stored. wrb.RO doesn't even store them. It literally stores nothing but the time at which a conversation was created, its participant's anonymous IDs (randomly generated), and their public keys (also randomly generated). So what's better? Encryption, or no data existing in the first place?

### How does it work?

Let's suppose there are two people who want to talk to each other, but what they want to say has to remain an absolute secret, to the point where they don't even want a record of the conversation existing. We'll call them Adam and Eve. Adam creates an anonymous conversation using wrb.RO. On his browser, completely on the client-side, a public key and private key are generated for him. He sends his public key to the server, and gets an anonymous ID generated for him. A file is created on the server that contains the time at which the conversation was created, when it was last modified, and Adam's anonymous ID and public key. A conversation ID is also generated, and Adam is redirected to the chat page. He can now send a link for Eve to join by sharing his URL. Eve clicks on the link, and she (still on the client-side) gets a private and public key pair generated for her, is given an anonymous ID, and is given access to the chat page. Adam and Eve's private keys are stored on their browser's local storage, never by the server. When they send a message to each other, they encrypt their messages with the other person's public key. The encrypted message is sent to the server, and relayed to the other person, who then decrypts it locally on the client-side with their private key. At no point does the server have access to any private keys, or any plaintext data. Messages that are sent and received also get stored in the browser's local storage.

### Can this be dangerous?

Probably, but so can anything else. This was created to promote and encourage privacy, not nefarious activities such as piracy, terrorism and other illegal activities.

## Terminology

**Local Storage:** A type of web storage used by your browser to store data locally. This is comparable to cookies, but the difference (in terms of privacy) is that the data is never required to be sent to the server. Local storage is an HTML5 feature though, so you'll need a fairly modern browser to use it. 

**Private Key:** Used to decrypt text that has been encrypted with the private key's corresponding public key. Keep this safe as it can decrypt messages.

**Public Key:** Used to encrypt text so that only the person with the correct private key can decrypt it. You don't need to keep this safe, it's already shared with anyone who connects to you.

**Anonymous ID:** Used to differentiate users without having to identify them. Randomly generated. Keep this safe, others may be able to "impersonate" you with it. This isn't shared with the other chat participant.

**Conversation ID:** Used to identify different conversations. Randomly generated.

![wrb.RO](https://i.imgur.com/uTdp1pb.jpg)
