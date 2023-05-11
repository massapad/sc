import { Storage, Context, generateEvent } from '@massalabs/massa-as-sdk';
import { Args } from '@massalabs/as-types';
import { JSON } from "json-as/assembly";

@json
class Tweet {
  content!: string;
  author!: string;
  cdate!: i64;
}

/**
 * This function is meant to be called only one time: when the contract is deployed.
 *
 * @param _ - not used
 */
export function constructor(_: StaticArray<u8>): void {
  // This line is important. It ensures that this function can't be called in the future.
  // If you remove this check, someone could call your constructor function and reset your smart contract.
  if (!Context.isDeployingContract()) {
    return;
  }
  const nTweets = 0;
  // Set the initial value of N_TWEETS to 0 in the storage of the contract
  Storage.set("N_TWEETS", nTweets.toString());
  // This function is used to emit an event to the blockchain
  generateEvent('MassaPad initiated');
}

export function tweet(_args: StaticArray<u8>): void {
  const args = new Args(_args);
  // Get the tweet from the arguments and check if it is valid (not null)
  const content = args
    .nextString()
    .expect('Content argument is missing or invalid');

  const author = args
    .nextString()
    .expect('Author argument is missing or invalid');

  // tweet create date
  const cdate = Date.now();

  const tweet: Tweet = {
    content: content,
    author: author,
    cdate: cdate,
  };

  let tweetLastIndex = 0;
  if (Storage.get<string>("N_TWEETS") !== "") {
    tweetLastIndex = parseInt(Storage.get("N_TWEETS")) as i32;
  }
  tweetLastIndex += 1;
  // Store the tweet in the storage of the contract with the key TWEET_postIndex
  // The keys will have the following syntaxes: TWEET_1, TWEET_2, TWEET_3, etc.
  Storage.set(`TWEET_${tweetLastIndex}`, JSON.stringify<Tweet>(tweet));
  // Incrementing the value of N_TWEETS in the storage of the contract
  Storage.set("N_TWEETS", tweetLastIndex.toString());
}

export function deleteTweet(_args: StaticArray<u8>): void {
  const args = new Args(_args);
  // Get the tweet index from the arguments and check if it is valid, we expect a string of the form "1.0" or "2.0", etc.
  const tweetIndex = args
    .nextString()
    .expect('Tweet index argument is missing or invalid');
    // Delete the tweet from the storage of the contract by setting its value to an empty string
  Storage.set(`TWEET_${tweetIndex}`, "");
}
